/* Create Tables */
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS Artist;
CREATE TABLE Artist (
    artist_id INTEGER PRIMARY KEY,
    artist_name TEXT NOT NULL,
    website TEXT
);
DROP TABLE IF EXISTS Artwork;
CREATE TABLE Artwork (
    artwork_id INTEGER PRIMARY KEY,
    artist_id INTEGER,
    artwork_url TEXT,
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id)
);
DROP TABLE IF EXISTS Tag;
CREATE TABLE Tag (
    tag_id INTEGER PRIMARY KEY,
    tag_name TEXT NOT NULL
);
DROP TABLE IF EXISTS Rating;
CREATE TABLE Rating (
    rating_id INTEGER PRIMARY KEY,
    rating_name TEXT NOT NULL
);
DROP TABLE IF EXISTS Gallery;
CREATE TABLE Gallery (
    gallery_id INTEGER PRIMARY KEY,
	gallery_name TEXT NOT NULL
);
/* */
DROP TABLE IF EXISTS Artwork_Tag;
CREATE TABLE Artwork_Tag (
    artwork_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (artwork_id, tag_id),
    FOREIGN KEY (artwork_id) REFERENCES Artwork(artwork_id),
    FOREIGN KEY (tag_id) REFERENCES Tag(tag_id)
);
DROP TABLE IF EXISTS Artwork_Rating;
CREATE TABLE Artwork_Rating (
    artwork_id INTEGER,
    rating_id INTEGER,
    PRIMARY KEY (artwork_id, rating_id),
    FOREIGN KEY (artwork_id) REFERENCES Artwork(artwork_id),
    FOREIGN KEY (rating_id) REFERENCES Rating(rating_id)
);
DROP TABLE IF EXISTS Gallery_Artwork;
CREATE TABLE Gallery_Artwork (
	gallery_id INTEGER,
	artwork_id INTEGER,
	PRIMARY KEY (gallery_id, artwork_id),
	FOREIGN KEY (gallery_id) REFERENCES Gallery(gallery_id),
	FOREIGN KEY (artwork_id) REFERENCES Artwork(artwork_id)
);
DROP TABLE IF EXISTS Rating_Tag;
CREATE TABLE Rating_Tag (
    rating_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (rating_id, tag_id),
    FOREIGN KEY (rating_id) REFERENCES Rating(rating_id),
    FOREIGN KEY (tag_id) REFERENCES Tag(tag_id)
);
DROP TABLE IF EXISTS Gallery_Rating;
CREATE TABLE Gallery_Rating (
    gallery_id INTEGER,
    rating_id INTEGER,
    PRIMARY KEY (rating_id, gallery_id),
    FOREIGN KEY (rating_id) REFERENCES Rating(rating_id),
    FOREIGN KEY (gallery_id) REFERENCES Gallery(gallery_id)
);
/* */
DROP TABLE IF EXISTS BodyReferenceImages;
CREATE TABLE BodyReferenceImages (
    referenceimage_id INTEGER PRIMARY KEY,
    reference_imageurl TEXT NOT NULL UNIQUE
);
DROP TABLE IF EXISTS BodyReferenceGallery;
CREATE TABLE BodyReferenceGallery (
    referencegallery_id INTEGER PRIMARY KEY,
    reference_gallery_name TEXT NOT NULL
);
DROP TABLE IF EXISTS BodyReferenceImages_Gallery;
CREATE TABLE BodyReferenceImages_Gallery (
    referencegallery_id INTEGER,
    referenceimage_id INTEGER,
    PRIMARY KEY (referencegallery_id, referenceimage_id),
    FOREIGN KEY (referencegallery_id) REFERENCES BodyReferenceGallery(referencegallery_id),
    FOREIGN KEY (referenceimage_id) REFERENCES BodyReferenceImages(referenceimage_id)
);