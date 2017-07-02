# Aurelia Server Side Rendering

### Development
1. `npm install`
2. in one terminal run `npm run watch`. When the bundles have been created, run `npm run server` in another terminal.
3. Go to http://localhost:8080

### Prod
On a development machine (or CI server) follow the following steps:
1. Client bundle: `webpack --progress -p --env.production --env.extractCss`
2. Server bundle: `webpack --config webpack.server.config.js --progress -p --env.production --env.extractCss`
3. Copy the following files and folder to the server:
  - dist
  - static
  - package.json
4. run `npm install` or `yarn` on the server
5. launch `node dist/server.bundle.js` to start the server