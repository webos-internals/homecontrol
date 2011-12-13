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
	var child = exec("rhythmbox --help", function(error, stdout, stderr) {
		if(error)
			cb(null);
		else {
//			var child = exec("dbus-send --help", function(error, stdout, stderr) {
//				if(error) {
					var child = exec("rhythmbox-client --help", function(error, stdout, stderr) {				
						if(error)
							cb(null);
						else {
							limitedInterface = true;
	
							currentStatus = new MusicPlayerStatus(true, false, true, false, false, null);

							cb("rhythmbox", "Rhythmbox", "Music Player");
						}
					});
/*				} else {
					currentStatus = new MusicPlayerStatus(true, false, true, false, false, null);

					cb("rhythmbox", "Rhythmbox", "Music Player");
				}
			});
*/
		}
	});
};

exports.execute = function(req, res) {
	console.log("Executing rhythmbox command: " + req.params[0]);
	
	res.header('Content-Type', 'text/javascript');

	//dbus-send --print-reply --dest=org.gnome.Rhythmbox /org/gnome/Rhythmbox/PlaylistManager org.gnome.Rhythmbox.PlaylistManager.getPlaylists
	//			var execute_string = "rhythmbox-client --play-uri=" + req.param("url") + ";";
	//			var execute_string = "rhythmbox-client --enqueue \"" + req.param("url") + "\";";*/

	if(req.params[0] != "close")
		var execute_string = "pgrep rhythmbox";
	else
		var execute_string = "rhythmbox-client --quit";

	var child = exec(execute_string, function(error, stdout, stderr) {
		if((stdout.length > 0) || (req.params[0] == "start")) {
			var execute_string = "";
		
			switch(req.params[0]) {
				case "output/mute":
					if(req.param("state") == "true") {
						var execute_string = "rhythmbox-client --mute;";
					} else {
						// Go around a bug in rhythmbox-client by setting volume
			
						var execute_string = "rhythmbox-client --unmute; rhythmbox-client --set-volume " + 
							(currentStatus.volume / 100) + ";";
					}
					break;

				case "output/volume":
					var execute_string = "rhythmbox-client --unmute; rhythmbox-client --set-volume " + 
						(req.param("level") / 100) + ";";
					break;

				case "playback/state":
					var execute_string = "rhythmbox-client --" + req.param("action") + ";";
					break;

				case "playback/skip":
					if(req.param("action") == "prev")
						var execute_string = "rhythmbox-client --previous;";
					else if(req.param("action") == "next")
						var execute_string = "rhythmbox-client --next;";
					break;

				case "playback/seek":
					break;

				default:
					break;
			}

			execute_string += "rhythmbox-client --print-volume;";
		
			execute_string += "rhythmbox-client --print-playing-format='%ta;%at;%tt;%td;%te'";
		
			var child = exec(execute_string, function(error, stdout, stderr) {
				if(error) {
					res.send(currentStatus.getStatus(req.socket.address().address, "error"));
					
					return;
				}

				var output = stdout.split("\n");
			
				if(output[0].slice(0, 17) == "Playback is muted") {
					currentStatus.mute = true;
				
					currentStatus.volume = Math.round(output[1].slice(19, 27) * 100);
				
					var status = output[2].split(";");
				} else {
					currentStatus.mute = false;
				
					currentStatus.volume = Math.round(output[0].slice(19, 27) * 100);
				
					var status = output[1].split(";");
				}
			
				if(status[0].slice(0, 11) == "Not playing") {
					res.send(currentStatus.getStatus(req.socket.address().address, "stopped"));
				} else {
					currentStatus.current.artist = escape(status[0]);
					currentStatus.current.album = escape(status[1]);
					currentStatus.current.title = escape(status[2]);

					var execute_string = "dbus-send --print-reply --dest=org.gnome.Rhythmbox /org/gnome/Rhythmbox/Player org.gnome.Rhythmbox.Player.getPlaying";
	
					var child = exec(execute_string, function(error, stdout, stderr) {
						var playing = stdout.replace(/\n/g, "").split(" ");

						if((error) || (!playing) || (playing.length < 10)) {
							if(req.param("action") == "play")
								res.send(currentStatus.getStatus(req.socket.address().address, "playing"));
							else
								res.send(currentStatus.getStatus(req.socket.address().address, "paused"));
							
							return;
						}

						if(playing[9] == "true")
							res.send(currentStatus.getStatus(req.socket.address().address, "playing"));
						else
							res.send(currentStatus.getStatus(req.socket.address().address, "paused"));
					});
				}
			});
		} else {
			res.send(currentStatus.getStatus(req.socket.address().address, "closed"));		
		}
	});
};

