# Astro applet: Image gallery

Open-sourced with the code owner blessing, a simple and performant image gallery that utilizes `fetch()`.  

## Notes

- The API and the database are meant to be hosted on Cloudflare using Workers and D1.  
- The [main astro component](GalleryComponent.astro) was made with no TypeScript compatibility in mind. If the project is set to `strict` typing, the Astro compiler will yell at you for `any` implicit types among other things.  
