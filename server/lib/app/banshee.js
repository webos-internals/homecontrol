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

var currentStatus = null; 

var limitedInterface = false;

var exec = require('child_process').exec;

var hcdata = require('../data-types.js');

exports.setup = function(cb) {
	var child = exec("banshee --help", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else {
			limitedInterface = true;

			currentStatus = new MusicPlayerStatus(true, false, true, false, false, null);

			cb("banshee", "Banshee", "Music Player");
		}
	});
};

exports.execute = function(req, res) {
	console.log("Executing banshee command: " + req.params[0]);

	res.header('Content-Type', 'text/javascript');

	if(req.params[0] != "close")
		var execute_string = "pgrep banshee";
	else
		var execute_string = "pkill banshee";

	var child = exec(execute_string, function(error, stdout, stderr) {
		if((stdout.length > 0) || (req.params[0] == "start")) {
			var execute_string = "";
		
			switch(req.params[0]) {
				case "output/mute":
					if(req.param("state") == "true") {
						var execute_string = "banshee --no-present --set-volume=0;";
					} else {
						var execute_string = "banshee --no-present --set-volume=" + 
							currentStatus.volume + ";";
					}
					break;

				case "output/volume":
					var execute_string = "banshee --no-present --set-volume=" + 
						req.param("level") + ";";
					break;

				case "playback/state":
					var execute_string = "banshee --no-present --" + req.param("action") + ";";
					break;

				case "playback/skip":
					if(req.param("action") == "prev")
						var execute_string = "banshee --no-present --previous;";
					else if(req.param("action") == "next")
						var execute_string = "banshee --no-present --next;";
					break;

				case "playback/seek":
					var execute_string = "banshee --no-present --query-position;";
					break;

				default:
					break;
			}
		
			var child = exec(execute_string, function(error, stdout, stderr) {
				var execute_string = "";

				if(error) {
					res.send(currentStatus.getStatus(req.socket.address().address, "error"));
					
					return;
				}

				if(req.params[0] == "playback/seek") {
					var pos = stdout.split(":")[1];
				
					if(req.param("action") == "bwd")
						var execute_string = "banshee --no-present --set-position=" + (pos - 10);
					else if(req.param("action") == "fwd")
						var execute_string = "banshee --no-present --set-position=" + (pos + 10);
				}

				execute_string += "banshee --no-present --query-current-state;";
				execute_string += "banshee --no-present --query-volume;";
				execute_string += "banshee --no-present --query-artist;";
				execute_string += "banshee --no-present --query-album;";
				execute_string += "banshee --no-present --query-title;";

				var child = exec(execute_string, function(error, stdout, stderr) {
					if(error) {
						res.send(currentStatus.getStatus(req.socket.address().address, "error"));
					
						return;
					}

					var output = stdout.split("\n");
				
					var state = output[0].split(": ");
					var volume = output[1].split(": ");
					var artist = output[2].split(": ");
					var album = output[3].split(": ");
					var title = output[4].split(": ");
					
					currentStatus.mute = false;
					
					if(volume[1] > 0)
						currentStatus.volume = volume[1];
					else
						currentStatus.mute = true;

					if((state[1] != "playing") || (state[1] != "paused")) {
						res.send(currentStatus.getStatus(req.socket.address().address, "stopped"));
					} else {
						currentStatus.current.artist = artist[1];
						currentStatus.current.album = album[1];
						currentStatus.current.title = title[1];

						res.send(currentStatus.getStatus(req.socket.address().address, state[1]));
					}
				});
			});
		} else {
			res.send(currentStatus.getStatus(req.socket.address().address, "closed"));		
		}
	});
};

