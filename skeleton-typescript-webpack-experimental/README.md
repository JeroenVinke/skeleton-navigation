# Aurelia Server Side Rendering

### Development
1. `npm install`
2. in one terminal run `npm run watch`. When the bundles have been created, run `npm run server` in another terminal.
3. Go to http://localhost:8080

### Prod
On a development machine (or CI server) follow the following steps:
1. Run `nps webpack.build.production.ssr`. This builds a client bundle and a server bundle
2. Copy the following files and folder to the server:
  - dist
  - static
  - package.json
3. run `npm install` or `yarn` on the server
4. launch `node dist/server.bundle.js` to start the server