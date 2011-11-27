/*

BSD LICENSED

Copyright (c) 2011, Janne Julkunen
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this 
list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, 
this list of conditions and the following disclaimer in the documentation 
and/or other materials provided with the distribution.

* Neither the name of the Enlightened Linux Solutions nor the names of its 
contributors may be used to endorse or promote products derived from this 
software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var express = require('express');

var form = require('connect-form');

var loaded = [];

var modules = ["app-frontrow", "app-itunes", "app-mpd", "app-quicktime", "app-rhythmbox", "app-totem",
	"sys-1-wire", "sys-input", "sys-sound", "sys-surveillance"];

console.log("Home Control server: starting");

var srv = express.createServer(
	form({ keepExtensions: true })
);

srv.get("/status", function(req, res) {
	res.send(loaded);
});

for(var i = 0; i < modules.length; i++) {
	var module = require("./lib/" + modules[i]);

	module.setup(function(module, moduleID, moduleName, moduleCategory) {
		if((moduleID) && (moduleName) && (moduleCategory)) {
			console.log("Loading " + moduleCategory + " module: " + moduleName);

			srv.get("/" + moduleID + "/*", module.execute);

			srv.post("/" + moduleID + "/*", module.execute);

			loaded.push({id: moduleID, name: moduleName, category: moduleCategory});
		}	
	}.bind(this, module));
}

srv.listen(3000);

