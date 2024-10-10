# Applet: Gallery

>[!NOTE]
> Open-sourced with the code owner blessing.

## Notes

- The code is as is; no new changes will be done.
- The API and the database are meant to be hosted on Cloudflare via Workers and D1.

>[!WARNING]
> No other providers will be set up. No preview will be set up.

>[!TIP]
> The API is NodeJS compatible.

- [GalleryComponent](GalleryComponent.astro) was made with no TypeScript compatibility. If set to `strict`, the Astro compiler will yell at you for `any` implicit types among other things.

>[!TIP]
> You may bypass all alerts and type checks on build adding `// @ts-nocheck` at the beginning of the `<script>` tag.
