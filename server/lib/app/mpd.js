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

// TODO: when selecting track / playlist should refresh play queue info and not just empty it out...
//			maybe also when skipping tracks if consume is on...
//			i.e. server should make sure that all changed statuses are in the 
//			status info which is send as a response

var mpd = null;

var exec = require('child_process').exec;

var hcdata = require('../data-types.js');

var currentStatus = new MusicPlayerStatus(true, true, true, true, true, 
	["playlists", "playqueue", "selected"]);

exports.setup = function(cb) {
	var child = exec("mpd --help", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else {
			require("../misc/mpd-pre-release");

			mpd = new MPD();

			mpd.addListener("error", function (error) {
			  console.log("Got mpd error: " + error.toString());    
			});

			cb("mpd", "MPD", "Music Player");
		}
	});
};

exports.execute = function(req, res) {
	console.log("Executing mpd command: " + req.params[0]);

	res.header('Content-Type', 'text/javascript');

	mpd.connect(function (error) {
		if(error) {
			res.send(currentStatus.getStatus(req.socket.address().address, "closed"));
			
			return;
		}
		
		var command = "", args = [];

		switch(req.params[0]) {
			case "start":
			case "close":
			case "status":
				if(req.param("refresh")) {
					currentStatus.reset(req.socket.address().address);

					command = "playlistinfo";
				}
				break;

			case "output/mute":
				command = "setvol";

				if(req.param("state") == "true")
					args.push(0);
				else
					args.push(currentStatus.volume);
				break;

			case "output/volume":
				command = "setvol";
				args.push(req.param("level"));
				break;

			case "library/search":
				command = "search";

				var words = req.param("filter").split(" ");
				
				for(var i = 0; i < words.length; i++) {
					args.push("any");
					args.push(words[i]);
				}
				
//				args.push("any");
//				args = args.concat(req.param("filter").split(" "));
//				console.log("AAA " + args.length);
//				args.push(req.param("filter"));
				break;

			case "library/select":
				command = "addid";
				args.push('"' + req.param("id") + '"');
				break;

			case "playback/state":
				command = req.param("action");
				break;

			case "playback/skip":
				if(req.param("action") == "prev")
					command = "previous";
				else if(req.param("action") == "next")
					command = "next";
				break;

			case "playback/seek":
				command = "status";
				break;

			case "playmode/random":
				command = "random";

				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
				break;

			case "playmode/repeat":
				command = "repeat";

				if(req.param("state") == "true")
					args.push(1);
				else
					args.push(0);
				break;

			case "playlists/list":
				if(req.param("id") == "*")
					command = "listplaylists";
				else {
					command = "listplaylistinfo";
					args.push(req.param("id"));
				}
				break;

			case "playlists/select":
				command = "clear";
				break;

			case "playqueue/list":
				if(req.param("action") == "info")
					command = "playlistinfo";
				else if(req.param("action") == "clear")
					command = "clear";
				break;

			case "playqueue/append":
				command = "add";
				args.push(req.param("id"));
				break;

			case "playqueue/remove":
				command = "deleteid";
				args.push(req.param("id"));
				break;

			case "playqueue/select":
				command = "playid";
				args.push(req.param("id"));
				break;

			default:
				res.send({});
				return;
		}

		mpd.cmd(command, args, function (error, result) {
			if((error) && (command != "")) {
				res.send(currentStatus.getStatus(req.socket.address().address, "error"));
				
				return;
			}
			
			switch(req.params[0]) {
				case "library/select":
					command = "playid";
					args = [result.id];
					break;

				case "playlists/select":
					currentStatus.views.playqueue.items = [];

					command = "load";
					args = [req.param("id")];
					break;

				case "library/search":
					command = ""; args = [];

					currentStatus.search.items = [];

					for(var i = 0; i < result.length; i++) {
						currentStatus.search.items.push({
							artist: result[i].artist,
							title: result[i].title,
							album: result[i].album,
							id: result[i].file});
					}
					break;

				case "playlists/list":
					if(req.param("id") == "*") {
						command = ""; args = [];

						currentStatus.views.playlists.items = [];
			
						for(var i = 0; i < result.length; i++) {
							currentStatus.views.playlists.items.push({
								name: result[i].playlist,
								type: "User Created",
								id: result[i].playlist });
						}
					} else {
						command = ""; args = [];

						currentStatus.views.selected.name = req.param("id");
						currentStatus.views.selected.items = [];

						for(var i = 0; i < result.length; i++) {
							currentStatus.views.selected.items.push({
								artist: result[i].artist,
								title: result[i].title,
								album: result[i].album,
								id: result[i].id});
						}
					}				
					break;

				case "playback/seek":
					var time = result.time.split(":");
					
					command = "seekid";
					args = [result.songid];
					
					if(req.param("action") == "bwd")
						args.push(parseInt(time[0]) - 10);
					else if(req.param("action") == "fwd")
						args.push(parseInt(time[0]) + 10);
					else if(!isNaN(parseInt(req.param("action"))))
						args.push(parseInt(req.param("action")));
					break;

				case "start":
				case "close":
				case "status":
				case "playqueue/list":
					command = ""; args = [];

					if(result) {
						currentStatus.views.playqueue.items = [];

						for(var i = 0; i < result.length; i++) {
							currentStatus.views.playqueue.items.push({
								artist: result[i].artist,
								title: result[i].title,
								album: result[i].album,
								id: result[i].id});
						}
					}
					break;

				default:
					command = ""; args = [];
					break;
			}
		
			mpd.cmd(command, args, function (error, result) {
				if((error) && (command != "")) {
					res.send(currentStatus.getStatus(req.socket.address().address, "error"));

					return;
				}

				mpd.cmd("status", [], function (error, status) {
					if(error) {
						res.send(currentStatus.getStatus(req.socket.address().address, "error"));

						return;
					}

					var state = "stopped";

					if(status.state == "play")
						state = "playing";
					else if(status.state == "pause")
						state = "paused";

					// Go around having no mute / unmute (0 = mute)
				
					if(req.params[0] != "playback/state") {
						if(status.volume > 0) {
							currentStatus.mute = false;
							currentStatus.volume = status.volume;
						} else if(currentStatus.state == "playing") {
							currentStatus.mute = true;
						}
					}

					if(status.repeat == 1)
						currentStatus.repeat = true;
					else
						currentStatus.repeat = false;
			
					if(status.random == 1)
						currentStatus.random = true;
					else
						currentStatus.random = false;

					if(status.time) {
						var position = status.time.split(":");

						currentStatus.position.elapsed = position[0];

						currentStatus.position.duration = position[1];
					} else {
						currentStatus.position.elapsed = 0;

						currentStatus.position.duration = 0;
					}
					
					mpd.cmd("currentsong", [], function (error, current) {
						if(error) {
							res.send(currentStatus.getStatus(req.socket.address().address, "error"));

							return;
						}

						currentStatus.current.id = current.id;

						currentStatus.current.artist = current.artist;

						currentStatus.current.album = current.album;
				
						currentStatus.current.title = current.name || current.title;

						res.send(currentStatus.getStatus(req.socket.address().address, state));
				
						mpd.disconnect();
					});
				});
			});
		});
	});
};

