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

var savedVolume = 0; // Go around a bug in rhythmbox-client

var currentState = "paused"; // Go around having no paused info

//var favorites = '[{"name": "Goth Metal World", "type": "Radio", "url": "http://85.200.99.56:7999/listen.pls"},' +
//	'{"name": "Amorphis - Skyforger", "type": "Song", "url": "/home/sconix/Music/Amorphis/Skyforger/01 - Sampo.mp3"}]';

exports.setup = function(cb) {
	var child = exec("rhythmbox-client --help", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else
			cb("rhythmbox", "Rhythmbox", "Music Player");
	});
};

exports.execute = function(req, res) {
	console.log("Executing rhythmbox command: " + req.params[0]);
	
	if(req.params[0] != "close")
		var execute_string = "pgrep rhythmbox";
	else
		var execute_string = "rhythmbox-client --quit";
	
	var child = exec(execute_string, function(error, stdout, stderr) {
		if((stdout.length > 0) || (req.params[0] == "start")) {
			var execute_string = "";
			
			if(req.params[0] == "play") {
				var execute_string = "rhythmbox-client --play;";

				currentState = "playing";
			} else if(req.params[0] == "pause") {
				var execute_string = "rhythmbox-client --pause;";
				
				currentState = "paused";
			} else if(req.params[0] == "next") {
				var execute_string = "rhythmbox-client --next;";
			} else if(req.params[0] == "prev") {
				var execute_string = "rhythmbox-client --previous;";
			} else if(req.params[0] == "mute") {
				if(req.param("state") == "true") {
					var execute_string = "rhythmbox-client --mute;";
				} else {
					var execute_string = "rhythmbox-client --unmute; rhythmbox-client --set-volume " + 
						(savedVolume / 100) + ";";
				}
		/*	} else if(req.params[0] == "url") {
				var execute_string = "rhythmbox-client --play-uri=" + req.param("url") + ";";
			} else if(req.params[0] == "queue") {
				var execute_string = "rhythmbox-client --enqueue \"" + req.param("url") + "\";";*/
			} else if(req.params[0] == "volume") {
				var execute_string = "rhythmbox-client --unmute; rhythmbox-client --set-volume " + 
					(req.param("value") / 100) + ";";
			}

			execute_string += "rhythmbox-client --print-volume;";
			
			execute_string += "rhythmbox-client --print-playing-format='%ta;%tt;%td;%te'";
			
			var child = exec(execute_string, function(error, stdout, stderr) {
				res.header('Content-Type', 'text/javascript');
				
				if(error !== null) {
					res.send({"state": "unknown", "volume": 0, "mute": true});
				} else {
					var output = stdout.split("\n");
					
					if(output[0].slice(0, 17) == "Playback is muted") {
						var mute = true;
						
						var volume = Math.round(output[1].slice(19, 27) * 100);
						
						var status = output[2].split(";");
					} else {
						var mute = false;
						
						var volume = Math.round(output[0].slice(19, 27) * 100);
						
						var status = output[1].split(";");
						
						savedVolume = volume;
					}
					
					if(status[0].slice(0, 11) == "Not playing") {
						res.send({"state": "stopped", "volume": volume, "mute": mute});
					} else {
						res.send({"state": currentState, "artist": escape(status[0]), 
							"title": escape(status[1]), "duration": escape(status[2]), 
							"elapsed": escape(status[3]), "volume": volume, "mute": mute});
					}
				}
			});
		} else {
			res.send({"state": "closed", "volume": 0, "mute": true});
		}
	});
};

