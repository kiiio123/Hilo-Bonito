# Hilo Bonito 2.0

## Development

Requires Node.js 20 or 22 and npm.

```sh
npm install
npm run dev
npm run check
npm run build
npx playwright install chromium
npm test
```

The site uses native JavaScript modules and separate CSS files. Vite is optional for local development and builds. The unbundled files remain compatible with static hosting over HTTP.

## Structure

- `index.html`: document structure and content.
- `src/styles/`: stylesheets in original cascade order.
- `src/scripts/`: navigation, delivery, locations, activities, budget, risk and goals.
- `src/main.js`: feature initialization.
- `assets/logos/`: shared SVG logo.
- `tests/`: browser smoke tests.

## Release

The original revision is preserved in `backup/original`. Run the syntax checks, build and browser tests, then compare the desktop and mobile visuals with the original before merging `refactor/v2` into `main`. The existing GitHub Pages deployment is unchanged.
