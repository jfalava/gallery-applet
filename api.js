export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    if (pathname === "/gallery") {
      return handleGalleriesWithArtworksRequest(env, searchParams);
    } else if (pathname === "/references") {
      return handleReferencesRequest(env, searchParams);
    } else if (pathname === "/tags") {
      return handleTagsRequest(env, searchParams);
    } else if (pathname === "/artworks") {
      return handleArtworksRequest(env, searchParams);
    } else {
      return createResponse("Hello World!", "text/plain");
    }
  },
};

function createResponse(body, contentType = "application/json", status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization",
    },
  });
}

function getMultipleQueryParams(searchParams, paramName) {
  const values = [];
  searchParams.forEach((value, key) => {
    if (key === paramName) {
      values.push(decodeURIComponent(value).toLowerCase());
    }
  });
  return values;
}

async function handleTagsRequest(env, searchParams) {
  try {
    const ratingId = searchParams.get("rating_id");
    const tagId = searchParams.get("tag_id");

    let query = `
      SELECT t.tag_id, LOWER(t.tag_name) AS tag_name, rt.rating_id
      FROM Tag t
      LEFT JOIN Rating_Tag rt ON t.tag_id = rt.tag_id
    `;
    let conditions = [];
    let params = [];

    if (ratingId) {
      conditions.push("rt.rating_id = ?");
      params.push(ratingId);
    }

    if (tagId) {
      conditions.push("t.tag_id = ?");
      params.push(tagId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    console.log("Query:", query);
    console.log("Params:", params);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const response = results.map((row) => ({
      tag_id: row.tag_id,
      tag_name: row.tag_name,
      rating_id: row.rating_id,
    }));

    return createResponse(JSON.stringify(response));
  } catch (error) {
    console.error("Error:", error);
    return createResponse(
      JSON.stringify({ error: "Database query failed" }),
      "application/json",
      500,
    );
  }
}

async function handleArtworksRequest(env, searchParams) {
  try {
    const artworkIds = searchParams.get("artwork_id");

    if (!artworkIds) {
      return createResponse(
        JSON.stringify({ error: "Missing artwork_id" }),
        "application/json",
        400,
      );
    }

    const idsArray = artworkIds.split(",");

    let query = `
      SELECT a.artwork_url, artist.artist_name, artist.website
      FROM Artwork a
      LEFT JOIN Artist artist ON a.artist_id = artist.artist_id
      WHERE a.artwork_id IN (${idsArray.map(() => "?").join(",")})
    `;

    console.log("Query:", query);
    console.log("Params:", idsArray);

    const { results } = await env.DB.prepare(query)
      .bind(...idsArray)
      .all();

    if (results.length === 0) {
      return createResponse(
        JSON.stringify({ error: "Artworks not found" }),
        "application/json",
        404,
      );
    }

    const response = results.map((row) => ({
      artwork_url: row.artwork_url,
      artist_name: row.artist_name,
      artist_website: row.website || null,
    }));

    return createResponse(JSON.stringify(response));
  } catch (error) {
    console.error("Error:", error);
    return createResponse(
      JSON.stringify({ error: "Database query failed" }),
      "application/json",
      500,
    );
  }
}

async function handleGalleriesWithArtworksRequest(env, searchParams) {
  try {
    const includeRatingIds = getMultipleQueryParams(
      searchParams,
      "include_rating_id",
    );
    const includeTagIds = getMultipleQueryParams(
      searchParams,
      "include_tag_id",
    );

    let query = `
      SELECT g.gallery_id, g.gallery_name, a.artwork_id, a.artwork_url,
             ar.rating_id AS artwork_rating_id, LOWER(r.rating_name) AS artwork_rating_name, 
             at.tag_id, LOWER(t.tag_name) AS tag_name, a.artist_id, artist.artist_name, artist.website,
             gr.rating_id AS gallery_rating_id, LOWER(grr.rating_name) AS gallery_rating_name,
             rt.rating_id AS tag_rating_id
      FROM Gallery g
      JOIN Gallery_Artwork ga ON g.gallery_id = ga.gallery_id
      JOIN Artwork a ON ga.artwork_id = a.artwork_id
      LEFT JOIN Artwork_Rating ar ON a.artwork_id = ar.artwork_id
      LEFT JOIN Rating r ON ar.rating_id = r.rating_id
      LEFT JOIN Artwork_Tag at ON a.artwork_id = at.artwork_id
      LEFT JOIN Tag t ON at.tag_id = t.tag_id
      LEFT JOIN Rating_Tag rt ON at.tag_id = rt.tag_id
      LEFT JOIN Artist artist ON a.artist_id = artist.artist_id
      LEFT JOIN Gallery_Rating gr ON g.gallery_id = gr.gallery_id
      LEFT JOIN Rating grr ON gr.rating_id = grr.rating_id
    `;
    let conditions = [];
    let params = [];

    if (includeRatingIds.length > 0) {
      conditions.push(
        `gr.rating_id IN (${includeRatingIds.map(() => "?").join(",")})`,
      );
      params.push(...includeRatingIds);
    }

    if (includeTagIds.length > 0) {
      conditions.push(`a.artwork_id IN (
        SELECT artwork_id
        FROM Artwork_Tag
        WHERE tag_id IN (${includeTagIds.map(() => "?").join(",")})
      )`);
      params.push(...includeTagIds);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    console.log("Query:", query);
    console.log("Params:", params);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const groupedResults = results.reduce((acc, row) => {
      const {
        gallery_id,
        gallery_name,
        artwork_id,
        artwork_url,
        artwork_rating_id,
        artwork_rating_name,
        tag_id,
        tag_name,
        artist_id,
        artist_name,
        website,
        gallery_rating_id,
        gallery_rating_name,
        tag_rating_id,
      } = row;

      if (!acc[gallery_id]) {
        acc[gallery_id] = {
          gallery_id,
          gallery_name,
          artworks: [],
          rating: gallery_rating_id
            ? { rating_id: gallery_rating_id, rating_name: gallery_rating_name }
            : null,
        };
      }

      const artwork = acc[gallery_id].artworks.find(
        (a) => a.artwork_id === artwork_id,
      );
      if (artwork) {
        if (tag_id && !artwork.tags.some((tag) => tag.tag_id === tag_id)) {
          artwork.tags.push({ tag_id, tag_name, rating_id: tag_rating_id });
        }
      } else {
        acc[gallery_id].artworks.push({
          artwork_id,
          artwork_url,
          rating: artwork_rating_id
            ? { rating_id: artwork_rating_id, rating_name: artwork_rating_name }
            : null,
          tags: tag_id ? [{ tag_id, tag_name, rating_id: tag_rating_id }] : [],
          artist: artist_id ? { artist_id, artist_name, website } : null,
        });
      }

      return acc;
    }, {});

    return createResponse(JSON.stringify(Object.values(groupedResults)));
  } catch (error) {
    console.error("Error:", error);
    return createResponse(
      JSON.stringify({ error: "Database query failed" }),
      "application/json",
      500,
    );
  }
}

async function handleReferencesRequest(env, searchParams) {
  try {
    const includeGalleryNames = getMultipleQueryParams(
      searchParams,
      "include_reference_gallery_name",
    );
    const excludeGalleryNames = getMultipleQueryParams(
      searchParams,
      "exclude_reference_gallery_name",
    );

    let query = `
      SELECT rg.referencegallery_id, rg.reference_gallery_name, ri.referenceimage_id, ri.reference_imageurl
      FROM BodyReferenceGallery rg
      JOIN BodyReferenceImages_Gallery rig ON rg.referencegallery_id = rig.referencegallery_id
      JOIN BodyReferenceImages ri ON rig.referenceimage_id = ri.referenceimage_id
    `;
    let conditions = [];
    let params = [];

    if (includeGalleryNames.length > 0) {
      conditions.push(
        `LOWER(rg.reference_gallery_name) IN (${includeGalleryNames.map(() => "?").join(",")})`,
      );
      params.push(...includeGalleryNames);
    }

    if (excludeGalleryNames.length > 0) {
      conditions.push(
        `LOWER(rg.reference_gallery_name) NOT IN (${excludeGalleryNames.map(() => "?").join(",")})`,
      );
      params.push(...excludeGalleryNames);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    console.log("Query:", query);
    console.log("Params:", params);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const groupedResults = results.reduce((acc, row) => {
      const {
        referencegallery_id,
        reference_gallery_name,
        referenceimage_id,
        reference_imageurl,
      } = row;

      if (!acc[referencegallery_id]) {
        acc[referencegallery_id] = {
          referencegallery_id,
          reference_gallery_name,
          reference_images: [],
        };
      }

      acc[referencegallery_id].reference_images.push({
        referenceimage_id,
        reference_imageurl,
      });

      return acc;
    }, {});

    return createResponse(JSON.stringify(Object.values(groupedResults)));
  } catch (error) {
    console.error("Error:", error);
    return createResponse(
      JSON.stringify({ error: "Database query failed" }),
      "application/json",
      500,
    );
  }
}