// set up our app with express
var express = require('express');
var app = express();

// configuration
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// listen (start app with node server.js)
app.listen(8080);
console.log("App listening on port 8080");
