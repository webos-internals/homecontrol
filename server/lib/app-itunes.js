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

var exec = require('child_process').exec;

var applescript = require("applescript");

exports.setup = function(cb) {
	var child = exec("osascript -e 'help'", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else
			cb("itunes", "iTunes", "Music Player");
	});
};

exports.execute = function(req, res) {
	console.log("Executing itunes command: " + req.params[0]);
	
	var script_string = "";
	
	if(req.params[0] == "play") {
		var script_string = 'tell application "iTunes" to play\n';
	} else if(req.params[0] == "pause") {
		var script_string = 'tell application "iTunes" to pause\n';
	} else if(req.params[0] == "next") {
		var script_string = 'tell application "iTunes" to next track\n';
	} else if(req.params[0] == "prev") {
		var script_string = 'tell application "iTunes" to previous track\n';
	} else if(req.params[0] == "repeat") {
		var script_string = 'tell application "iTunes"\n';

		script_string += 'if player state is playing or player state is paused then\n';
		
		if(req.param("state") == "true")
			script_string += 'set song repeat of current playlist to all\n';
		else
			script_string += 'set song repeat of current playlist to off\n';
		
		script_string += 'end if\nend tell\n';
	} else if(req.params[0] == "random") {
		var script_string = 'tell application "iTunes"\n';

		script_string += 'if player state is playing or player state is paused then\n';

		script_string += 'set shuffle of current playlist to ' + req.param("state") + '\n';
		
		script_string += 'end if\nend tell\n';
	} else if(req.params[0] == "mute") {
		var script_string = 'tell application "iTunes" to set mute to ' +
			req.param("state") + '\n';
	} else if(req.params[0] == "volume") {
		var script_string = 'tell application "iTunes" to set sound volume to ' + 
			req.param("value") + "\n";
	}
	
	script_string += 'tell application "iTunes" to get player state & sound volume & mute';
	
	applescript.execString(script_string, function(error, info) {
		if(error) {
			res.send({"state": "unknown", "repeat": false, "random": false, "volume": 0, "mute": true});
		} else {
			if((info[0] != "playing") && (info[0] != "paused")) {
				res.send({"state": "stopped", "repeat": false, "random": false, "volume": parseInt(info[1]), 
					"mute": (info[2] == "true")});
			} else {
				script_string = 'tell application "iTunes" to get song repeat of current playlist & ' +
					'shuffle of current playlist & {artist, name} of current track';
				
				applescript.execString(script_string, function(error, status) {
					if(error) {
						res.send({"state": "stopped", "repeat": false, "random": false, "volume": parseInt(info[1]), 
							"mute": (info[2] == "true")});
					} else {
						res.send({"state": info[0], "repeat": (status[0] != "off"), "random": (status[1] == "true"), 
							"volume": parseInt(info[1]), "mute": (info[2] == "true"), "artist": status[2], "title": status[3]});
					}
				});
			}
		}
	});
};

