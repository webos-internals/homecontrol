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

var savedVolume = 0; // Go around having no mute / unmute

var node_mpd = require("mpd");

var exec = require('child_process').exec;

exports.setup = function(cb) {
	var child = exec("mpd --help", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else
			cb("mpd", "MPD", "Music Player");
	});
};

exports.execute = function(req, res) {
	console.log("Executing mpd command: " + req.params[0]);
	
	var mpd = new MPD();
	
	mpd.addListener("error", function (error) {
	  console.log("Got mpd error: " + inspect(error.toString()));    
	});
	
	mpd.connect(function (error, result) {
		if(error) {
			res.send({"state": "closed", "repeat": false, "random": false, "volume": 0, "mute": true});
		} else {
			var args = [];
			
			var command = "status";
			
			if(req.params[0] == "play")
				command = "play";
			else if(req.params[0] == "pause")
				command = "pause";
			else if(req.params[0] == "prev")
				command = "previous";
			else if(req.params[0] == "next")
				command = "next";
			else if(req.params[0] == "repeat") {
				command = "repeat";
				
				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
			} else if(req.params[0] == "random") {
				command = "random";
				
				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
			} else if(req.params[0] == "mute") {
				if(req.param("state") == "true") {
					command = "setvol";
					args.push(0);
				} else {
					command = "setvol";
					args.push(savedVolume);
				}
			} else if(req.params[0] == "volume") {
				command = "setvol";
				args.push(req.param("value"));
			}
			
			mpd.cmd(command, args, function (error, result) {
				if(error) {
					res.send({"state": "unknown", "repeat": false, "random": false, "volume": 0, "mute": true});
				} else {
					mpd.cmd("status", [], function (error, result) {
						if(error) {
							res.send({"state": "error", "repeat": false, "random": false, "volume": 0, "mute": true});
						} else {
							var response = {"state": "stopped", "repeat": false, "random": false, "volume": 0, "mute": false};
							
							if(result.state == "play")
								response.state = "playing";
							else if(result.state == "pause")
								response.state = "paused";
							
							response.artist = "";
							response.title = "";
							response.duration = "";
							response.elapsed = "";

							if(result.repeat == 1)
								response.repeat = true;
							
							if(result.random == 1)
								response.random = true;
							
							if((result.volume < 0) || (req.params[0] == "play")) {
								response.volume = savedVolume;
							} else if(result.volume > 0) {
								savedVolume = result.volume;
								
								response.volume = result.volume;
							} else {
								response.mute = true;
							}
							
							mpd.cmd("currentsong", [], function (error, result) {
								response.artist = result.Artist;
								
								if(result.Name)
									response.title = result.Name;
								else
									response.title = result.Title;
								
								res.send(response);
								
								mpd.disconnect();
							});
						}
					});
				}
			});
		}
	});
};

