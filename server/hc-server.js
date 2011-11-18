var express = require('express');

var module = {};

var modules = ["computer", "itunes", "mpd", "rhythmbox", "temperatures", "totem"];

console.log("Home Control server: starting");

var app = express.createServer();

for(var i = 0; i < modules.length; i++) {
	module[modules[i]] = require("./lib/" + modules[i]);

	module[modules[i]].setup(function(moduleName, load) {
		if(load) {
			console.log("Loading supported module: " + moduleName);

			app.get("/" + moduleName + "/*", module[moduleName].execute);
		} else {
			console.log("Skipping unsupported module: " + moduleName);
		}	
	}.bind(this, modules[i]));
}

app.listen(3000);

