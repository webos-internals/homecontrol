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

var node_mpd = require("./mpd-pre-release");

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
	
	mpd.connect(function (error) {
		if(error) {
			res.send({"state": "closed", "repeat": false, "random": false, "volume": 0, "mute": true});
		} else {
			var args = [];
			var preargs = [];
			
			var command = "status";
			var precommand = "";
			
			if(req.params[0] == "output/mute") {
				if(req.param("state") == "true") {
					command = "setvol";
					args.push(0);
				} else {
					command = "setvol";
					args.push(savedVolume);
				}
			} else if(req.params[0] == "output/volume") {
				command = "setvol";
				args.push(req.param("level"));
			} else if(req.params[0] == "library/search") {
				command = "search";
				args.push("any");
				args.push(req.param("filter"));
			} else if(req.params[0] == "library/select") {
				precommand = "addid";
				preargs.push(req.param("id"));
			} else if(req.params[0] == "playback/state") {
				command = req.param("action");
			} else if(req.params[0] == "playback/song") {
				if(req.param("action") == "prev")
					command = "previous";
				else if(req.param("action") == "next")
					command = "next";
			} else if(req.params[0] == "playmode/random") {
				command = "random";
				
				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
			} else if(req.params[0] == "playmode/repeat") {
				command = "repeat";
				
				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
			} else if(req.params[0] == "playlists/list") {
				if(req.param("id") == "*")
					command = "listplaylists";
				else {
					command = "listplaylistinfo";
					args.push(req.param("id"));
				}
			} else if(req.params[0] == "playlists/select") {
				precommand = "clear";
				command = "load";
				args.push(req.param("id"));
			} else if(req.params[0] == "playqueue/list") {
				if(req.param("action") == "info")
					command = "playlistinfo";
				else if(req.param("action") == "clear")
					command = "clear";
			} else if(req.params[0] == "playqueue/append") {
				command = "add";
				args.push(req.param("id"));
			} else if(req.params[0] == "playqueue/remove") {
				command = "deleteid";
				args.push(req.param("id"));
			}

			mpd.cmd(precommand, preargs, function (error, result) {
				if(req.params[0] == "library/select") {
					command = "playid";
					args.push(result.id);
				}
			
				mpd.cmd(command, args, function (error, result) {
					if(error) {
						res.send({"state": "unknown", "repeat": false, "random": false, "volume": 0, "mute": true});
					} else {
						mpd.cmd("status", [], function (error, status) {
							if(error) {
								res.send({"state": "error", "repeat": false, "random": false, "volume": 0, "mute": true});
							} else {
								var response = {"state": "stopped", "repeat": false, "random": false, "volume": 0, "mute": false};
							
								if(status.state == "play")
									response.state = "playing";
								else if(status.state == "pause")
									response.state = "paused";
							
								response.artist = "";
								response.title = "";
								response.duration = "";
								response.elapsed = "";

								if(status.repeat == 1)
									response.repeat = true;
							
								if(status.random == 1)
									response.random = true;
							
								if((status.volume < 0) || (req.params[0] == "play")) {
									response.volume = savedVolume;
								} else if(status.volume > 0) {
									savedVolume = status.volume;
								
									response.volume = status.volume;
								} else {
									response.mute = true;
								}
							
								if((result) && (command == "listplaylists")) {
									response.playlists = [];
								
									for(var i = 0; i < result.length; i++) {
										response.playlists.push({
											name: result[i].playlist,
											id: result[i].playlist});
									}
								} else if((result) && ((command == "search") ||
									(command == "playlistinfo") || (command == "listplaylistinfo")))
								{
									var songs = [];

									for(var i = 0; i < result.length; i++) {
										songs.push({
											artist: result[i].artist,
											title: result[i].title,
											album: result[i].album,
											id: result[i].id || result[i].file});
									}

									if(command == "search")
										response.results = songs;
									else if(command == "playlistinfo")
										response.queue = songs;
									else if(command == "listplaylistinfo") {
										response.playlist = {
											name: req.param("id"),
											songs: songs};									
									}
								}
							
								mpd.cmd("currentsong", [], function (error, current) {
									response.artist = current.artist;
								
									if(current.name)
										response.title = current.name;
									else
										response.title = current.title;
								
									res.send(response);
								
									mpd.disconnect();
								});
							}
						});
					}
				});
			});
		}
	});
};

