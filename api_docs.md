# Gallery API Documentation

## Introduction

The Gallery API provides endpoints to retrieve information about galleries, artworks, tags, and references. It is designed to help applications fetch structured data related to galleries, artworks, and reference images.

## Base URL

The base URL for the API is: `https://api.example.com/`.  
All endpoints are relative to this base URL.

## Endpoints

### 1. Get Galleries with Artworks

- **Description**: Retrieves galleries with their associated artworks. The response includes details about the artworks, their ratings, tags, and the artist who created the artwork.
- **Method**: `GET`
- **Endpoint**: `/gallery`
- **Query Parameters**:
- `include_rating_id` (optional): A comma-separated list of rating IDs to filter galleries that contain artworks with these ratings.
- `include_tag_id` (optional): A comma-separated list of tag IDs to filter galleries that contain artworks with these tags.

**Example Request**:

```sh
curl https://api.example.com/gallery?include_rating_id=1&include_tag_id=12
```

**Response Structure**:

```json
[
  {
    "gallery_id": 3,
    "gallery_name": "Impressionism in the 1900s",
    "artworks": [
      {
        "artwork_id": 6,
        "artwork_url": "https://example.com/impressionism/1900/example.jpg",
        "rating": {
          "rating_id": 1,
          "rating_name": "example_rating"
        },
        "tags": [
          {
            "tag_id": 11,
            "tag_name": "example_tag_1",
            "rating_id": 1
          },
          {
            "tag_id": 12,
            "tag_name": "example_tag_2",
            "rating_id": 1
          }
        ],
        "artist": {
          "artist_id": 7,
          "artist_name": "Impressionist Artist",
          "website": "https://example.com/impressionist_artist/"
        }
      },
]
```

- **Errors**:
  - `500 Internal Server Error`: If there is an issue with the database query.

### 2. Get Artworks

- **Description**: Retrieves information about specific artworks, including the artist's name and website.
- **Method**: `GET`
- **Endpoint**: `/artworks`
- **Query Parameters**:
- `artwork_id` (required): A comma-separated list of artwork IDs.
- **Example Request**:

```sh
curl https://api.example.com/artworks?artwork_id=101,102
```

- **Response Structure**:

```json
[
  {
    "artwork_url": "https://api.example.com/",
    "artist_name": "Realist Artist",
    "artist_website": "https://example.com/realist_artist/realism/1900/example.jpg"
  },
  {
    "artwork_url": "https://api.example.com/",
    "artist_name": "Modernist Artist",
    "artist_website": "https://example.com/modernist_artist/modernism/1900/example.jpg"
  }
]
```

- **Errors**:
  - `400 Bad Request`: If `artwork_id` is missing.
  - `404 Not Found`: If the requested artworks are not found.
  - `500 Internal Server Error`: If there is an issue with the database query.

### 3. Get Tags

- **Description**: Retrieves tags and their associated ratings.
- **Method**: `GET`
- **Endpoint**: `/tags`
- **Query Parameters**:
- `rating_id` (optional): Filter the tags by a specific rating ID.
- `tag_id` (optional): Filter the tags by a specific tag ID.
- **Example Request**:

```sh
curl https://api.example.com/tags?rating_id=1
```

**Response Structure**:

```json
[
  {
    "tag_id": 6,
    "tag_name": "unfinished",
    "rating_id": 1
  },
  {
    "tag_id": 7,
    "tag_name": "lost",
    "rating_id": 1
  }
]
```

**Errors**:

- `500 Internal Server Error`: If there is an issue with the database query.

### 4. Get References

- **Description**: Retrieves reference galleries and their associated reference images.
- **Method**: `GET`
- **Endpoint**: `/references`
- **Query Parameters**:
- `include_reference_gallery_name` (optional): A comma-separated list of gallery names to include in the results.
- `exclude_reference_gallery_name` (optional): A comma-separated list of gallery names to exclude from the results.

**Example Request**:

```sh
curl https://api.example.com/references?include_reference_gallery_name=Impressionism%20model%20references
```

**Response Structure**:

```json
[
  {
    "referencegallery_id": 6,
    "reference_gallery_name": "Impressionism model references",
    "reference_images": [
      {
        "referenceimage_id": 24,
        "reference_imageurl": "https://example.com/references/hairstyles/one/1.avif"
      },
            {
        "referenceimage_id": 24,
        "reference_imageurl": "https://example.com/references/hairstyles/two/1.avif"
      }
    ]
  }
]
```

**Errors**:

- `500 Internal Server Error`: If there is an issue with the database query.

## Error Handling

The API responds with standard HTTP status codes to indicate the success or failure of the request:

- **200 OK**: The request was successful, and the response contains the expected data.
- **400 Bad Request**: The request was invalid, usually because required parameters were missing or malformed.
- **404 Not Found**: The requested resource was not found.
- **500 Internal Server Error**: There was an issue processing the request on the server side, such as a database error.

## Security

The Gallery API does not currently require authentication. All endpoints are publicly accessible.

## Rate Limiting

No rate limiting is currently enforced by the API.
