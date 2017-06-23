/// <reference types="jquery" />

import * as path from 'path';
import 'aurelia-polyfills';
import {Options, NodeJsLoader} from 'aurelia-loader-nodejs';
import {PLATFORM, DOM} from 'aurelia-pal';
import {globalize} from 'aurelia-pal-nodejs';
import {Aurelia} from 'aurelia-framework';
import * as http from 'http'
import * as webpack from 'webpack'
import * as ecstatic from 'ecstatic'
import * as ejs from 'ejs';

// ignore importing '.css' files, useful only for Webpack codebases that do stuff like require('./file.css'):
require.extensions['.css'] = function (m, filename) {
  return
}

// set the root directory where the aurelia loader will resolve to
// this is the 'src' dir in case of skeleton
Options.relativeToDir = path.resolve(__dirname, '..', 'src')

process.on('unhandledRejection', function(reason, p) {
  console.log('Possibly unhandled Rejection at: Promise ', p, ' reason: ', reason)
})

// initialize PAL and set globals (window, document, etc.)
globalize()

// needed by bootstrap:
;(global as any).$ = (global as any).jQuery = require('jquery')
;(global as any).server = true

// aurelia expects console.debug
console.debug = console.log

// const compiler = webpack(require('../webpack.config'))

// const watcher = compiler.watch({}, (err, stats) => {
//   const info = stats.toJson({chunks: true})
//   console.log(`ready to serve`, info)
//   if (err) {
//     console.error(err)
//   }
// })

const staticHandler = ecstatic({ root: path.resolve(__dirname, '..', 'dist'), handleError: true })

const server = http.createServer((request, response) => {
  if (request.url.match(/\.(js|css|ico|woff2|woff|ttf)$/)) {
    const ret = staticHandler(request, response)
    // console.log(ret)
    return
    // if (response.finished) {
    //   return
    // } else {
    //   response.statusCode = 404
    //   response.end()
    // }
  }

  if (request.url.endsWith('.ico')) {
    response.statusCode = 404
    response.end()
  }

  response.statusCode = 200

  console.log(`serving: ${request.url}`)

  // set the path you want to load:
  // document.location.pathname = request.url
  document.location.hash = request.url //'/users';

  const aurelia = new Aurelia(new NodeJsLoader())
  aurelia.host = document.body
  ;(aurelia as any).configModuleId = 'main' // parse html template and find the aurelia-app="" ?

  // note: this assumes your configure method awaits or returns the value of aurelia.setRoot(...)
  // skeletons currently don't do that so you need to adjust
  require('../src/main').configure(aurelia).then(() => {
    const attribute = document.createAttribute('aurelia-app')
    attribute.value = 'main'
    document.body.attributes.setNamedItem(attribute)

    var template = ejs.compile(require('fs').readFileSync('./index.ejs', 'utf-8'));

    response.end(template({ 
      htmlWebpackPlugin : {
        options: {
          metadata: {
            baseUrl: '',
            title: 'Aurelia Skeleton Navigation',
            ssr: document.body.outerHTML,
            scripts: '<script src="dist/vendor.bundle.js"></script><script src="dist/app.bundle.js"></script>'
          }
        }
      }
    }))
  });
})

server.listen(8765)
console.log(`Listening server-side-rendered at http://localhost:8765/`)
