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

*Neither the name of the Enlightened Linux Solutions nor the names of its 
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

var exec = require('child_process').exec;

var applescript = require("applescript");

exports.setup = function(cb) {
	var child = exec("osascript -e 'help'", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else
			cb("quicktime", "QuickTime", "Video Player");
	});
};

exports.execute = function(req, res) {
	console.log("Executing quicktime command: " + req.params[0]);

	var script_string = "";

	if(req.params[0] == "play") {
		var script_string = 'tell application "QuickTime Player" to play document frontmost\n';
	} else if(req.params[0] == "pause") {
		var script_string = 'tell application "QuickTime Player" to pause document frontmost\n';
	} else if(req.params[0] == "seek") {
		if(req.param("action") == "fwd")
			var script_string = 'tell application "QuickTime Player" to step forward document frontmost\n';
		else if(req.param("action") == "bwd")
			var script_string = 'tell application "QuickTime Player" to step backward document frontmost\n';
	} else if(req.params[0] == "fullscreen") {
		var script_string = 'tell application "QuickTime Player"\n';
		
		script_string += 'if presenting of document frontmost is true\n';
		
		script_string += 'set present of document frontmost to false\nelse\n';
		
		script_string += 'set present of document frontmost to true\nend if\nend tell\n';
	} else if(req.params[0] == "mute") {
		var script_string = 'tell application "QuickTime Player" to set muted of document frontmost to ' + 
			req.param("state") + '\n';
	} else if(req.params[0] == "volume") {
		var script_string = 'tell application "QuickTime Player" to set audio volume of document frontmost to ' + 
			(req.param("value") / 100) + "\n";
	}

	script_string += 'tell application "QuickTime Player" to get ' +
		'{playing, name, presenting, audio volume, muted} of document frontmost';

	applescript.execString(script_string, function(error, result) {
		if(error) {
			res.send({"state": "stopped", "fullscreen": false, "volume": 0, "mute": true});
		} else {
			var state = "paused";
			
			if(result[0] == "true")
				state = "playing";
			
			res.send({"state": state, "title": result[1], "fullscreen": (result[2] == "true"), 
				"volume": Math.round(result[3] * 100), "mute": (result[4] == "true")});
		}
	});
};

