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
			cb(false);
		else
			cb(true);
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
		var script_string = 'tell application "iTunes" next track\n';
	} else if(req.params[0] == "prev") {
		var script_string = 'tell application "iTunes" previous track\n';
	} else if(req.params[0] == "mute") {
		var script_string = 'tell application "iTunes" to set mute to true\n';
	} else if(req.params[0] == "unmute") {
		var script_string = 'tell application "iTunes" to set mute to false\n';
	} else if(req.params[0] == "volume") {
		var script_string = 'tell application "iTunes" to set sound volume to ' + req.param("volume") + "\n";
	}

	script_string += 'tell application "iTunes" to mute & sound volume & player state';

	applescript.execString(script_string, function(error, info) {
		if(error) {
			res.send('{"status": "error"}');
		} else {
			if((info[2] != "playing") && (info[2] != "paused")) {
				res.send('{"status": "stopped", "mute": "' + info[0] + '","volume": "' + info[1] + '"}');
			} else {
				script_string = 'tell application "iTunes" to get {artist, name} of current track';

				applescript.execString(script_string, function(error, track) {
					if(error) {
						res.send('{"status": "error"}');
					} else {
						res.send('{"status": "' + info[2] + '", "mute": "' + info[0] + '","volume": "' + info[1] + 
							'", "artist": "' + track[0] + '", "title": "' + track[1] + '"}');
					}
				});
			}
		}
	});
};

