function start(route) {
  console.log("Request handler 'start' was called.");
  var response = this.res;
  var request = this.req;
  var file = require("fs");
  file.readFile("public/static/nowjs.html", function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(data);
    response.end();
  });
}

var node_static = require("node-static");
var file = new node_static.Server("./public");

function staticFiles(route) {
  var request = this.req;
  var response = this.res;
  file.serve(request, response);
}

exports.start = start;
exports.staticFiles = staticFiles;
