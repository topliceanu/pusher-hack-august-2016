var server = require("http-server");

var instance = new server.createServer({
  root: "./public"
});

var port = process.env.PORT || 3000;
instance.listen(port, function() {
  console.log('Node app is running on port', port);
});
