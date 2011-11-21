var express = require('express');

var form = require('connect-form');

var module = {};

var modules = ["computer", "itunes", "mpd", "rhythmbox", "surveillance", "temperatures", "totem"];

console.log("Home Control server: starting");

var srv = express.createServer(
	form({ keepExtensions: true })
);

for(var i = 0; i < modules.length; i++) {
	module[modules[i]] = require("./lib/" + modules[i]);

	module[modules[i]].setup(function(moduleName, load) {
		if(load) {
			console.log("Loading supported module: " + moduleName);

			srv.get("/" + moduleName + "/*", module[moduleName].execute);

			srv.post("/" + moduleName + "/*", module[moduleName].execute);
		} else {
			console.log("Skipping unsupported module: " + moduleName);
		}	
	}.bind(this, modules[i]));
}

srv.listen(3000);

