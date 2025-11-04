const functions = require('firebase-functions');
const next = require('next');

const dev = false;
const app = next({ dev, conf: { distDir: '../.next' } });
const handle = app.getRequestHandler();

exports.nextServer = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
