var express = require('express');

var module = {};

var modules = ["computer", "mpd", "rhythmbox", "temperatures", "totem"];

console.log("Server started...");

var app = express.createServer();

for(var i = 0; i < modules.length; i++) {
	console.log("Loading module: " + modules[i]);

	module[modules[i]] = require(modules[i]);

	module[modules[i]].setup();

	app.get("/" + modules[i] + "/*", module[modules[i]].execute);
}

app.listen(3000);

