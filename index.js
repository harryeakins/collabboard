var server = require("./server");
var requestHandlers = require("./requestHandlers");
var director = require("director");

var router = new director.http.Router({
  "/": { get: requestHandlers.start },
  "/session/.*": { get: requestHandlers.start },
  "/static/.*": { get: requestHandlers.staticFiles },
  "/static/.*/.*": { get: requestHandlers.staticFiles },
});

server.start(router);

