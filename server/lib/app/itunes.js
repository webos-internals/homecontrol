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

var hcdata = require('../data-types.js');

var currentStatus = new MusicPlayerStatus(true, true, true, true, 
	["playlists", "current", "selected"]);

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

	switch(req.params[0]) {
		case "start":
		case "close":
		case "status":
			if(req.param("refresh")) {
				currentStatus.reset(req.socket.address().address);

				script_string = 'set tracklist to {}\n' + 'tell application "iTunes"\n' + 
					'if player state is playing then\n' + 
					'copy name of current playlist to the end of tracklist\n' +
					'repeat with i from 1 to (count of tracks of current playlist)\n' + 
					'set trackinfo to {}\n' + 
					'copy id of track i of current playlist to the end of trackinfo\n' + 
					'copy artist of track i of current playlist to the end of trackinfo\n' + 
					'copy album of track i of current playlist to the end of trackinfo\n' + 
					'copy name of track i of current playlist to the end of trackinfo\n' + 
					'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 'else\n' +
					'copy name of view of front window to the end of tracklist\n' +
					'repeat with i from 1 to (count of tracks of view of front window)\n' + 
					'set trackinfo to {}\n' + 
					'copy id of track i of view of front window to the end of trackinfo\n' + 
					'copy artist of track i of view of front window to the end of trackinfo\n' + 
					'copy album of track i of view of front window to the end of trackinfo\n' + 
					'copy name of track i of view of front window to the end of trackinfo\n' + 
					'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 
					'end if\n' + 'end tell\n' + 'return tracklist\n';
			}
			break;

		case "output/mute":
			script_string = 'tell application "iTunes" to set mute to ' + req.param("state") + '\n';
			break;

		case "output/volume":
			script_string = 'tell application "iTunes" to set sound volume to ' + req.param("level") + "\n";
			break;

		case "library/search":
			script_string = 'set searchresults to {}\n' + 'tell application "iTunes"\n' + 
				'set results to (search playlist "Library" for "' + req.param("filter") + '")\n' + 
				'repeat with result in results\n' + 
				'set trackinfo to {}\n' + 'tell result\n' + 
				'copy database ID to the end of trackinfo\n' + 
				'copy artist to the end of trackinfo\n' + 
				'copy album to the end of trackinfo\n' + 
				'copy name to the end of trackinfo\n' + 
				'end tell\n' + 
				'copy trackinfo to the end of searchresults\n' + 
				'end repeat\n' + 
				'return searchresults\n' + 
				'end tell\n';
			break;

		case "library/select":
			script_string = 'tell application "iTunes"\n' + 
				'set selectedtrack to (first track of library playlist 1 whose database ID is ' +
				req.param("id") + ')\n' + 'play selectedtrack\n' + 'end tell\n';
			break;

		case "playback/state":
			script_string = 'tell application "iTunes" to ' + req.param("action") + '\n';
			break;

		case "playback/skip":
			if(req.param("action") == "prev")
				script_string = 'tell application "iTunes" to previous track\n';
			else if(req.param("action") == "next")
				script_string = 'tell application "iTunes" to next track\n';
			break;

		case "playback/seek":
			if(req.param("action") == "bwd") {
				script_string = 'tell application "iTunes"\n' +
					'if player state is playing then\n' +
					'set currTime to get player position\n' +
					'set currSkip to currTime - 10\n' +
					'if currSkip < 0 then\n' +
					'set currSkip to 0\n' + 
					'end if\n' +
    				'set player position to currSkip\n' +
					'end if\n' +
					'end tell\n';
			} else if(req.param("action") == "fwd") {
				script_string = 'tell application "iTunes"\n' +
					'if player state is playing then\n' +
					'set trackTime to duration of current track\n' +
					'set currTime to get player position\n' +
					'set currSkip to currTime + 10\n' +
					'if currSkip > trackTime then\n' +
					'set currSkip to trackTime\n' + 
					'end if\n' +
    				'set player position to currSkip\n' +
					'end if\n' +
					'end tell\n';
			}
			break;

		case "playback/select":
			script_string = 'tell application "iTunes"\n' + 
				'if player state is playing then\n' + 
				'set selectedtrack to (first track of current playlist whose id is ' +
				req.param("id") + ')\n' + 'play selectedtrack\n' + 'else\n' +
				'set selectedtrack to (first track of view of front window whose id is ' +
				req.param("id") + ')\n' + 'play selectedtrack\n' + 'end if\n' + 'end tell\n';
			break;

		case "playmode/random":
			script_string = 'tell application "iTunes"\n' +
				'if player state is playing or player state is paused then\n' +
				'set shuffle of current playlist to ' + req.param("state") + '\n' +
				'end if\nend tell\n';
			break;

		case "playmode/repeat":
			script_string = 'tell application "iTunes"\n' +
				'if player state is playing or player state is paused then\n';
		
			if(req.param("state") == "true")
				script_string += 'set song repeat of current playlist to all\n';
			else
				script_string += 'set song repeat of current playlist to off\n';

			script_string += 'end if\nend tell\n';
			break;

		case "playlists/list":
			if(req.param("id") == "*") {
				script_string = 'set plnames to {}\n' + 'tell application "iTunes"\n' +
					'repeat with i from 1 to (count of playlists)\n' + 
					'copy name of playlist i to end of plnames\n' +
					'end repeat\n' + 'end tell\n' + 'return plnames\n';
			} else if(req.param("id") == "current") {
				script_string = 'set tracklist to {}\n' + 'tell application "iTunes"\n' + 
					'if player state is playing then\n' + 
					'copy name of current playlist to the end of tracklist\n' +
					'repeat with i from 1 to (count of tracks of current playlist)\n' + 
					'set trackinfo to {}\n' + 
					'copy id of track i of current playlist to the end of trackinfo\n' + 
					'copy artist of track i of current playlist to the end of trackinfo\n' + 
					'copy album of track i of current playlist to the end of trackinfo\n' + 
					'copy name of track i of current playlist to the end of trackinfo\n' + 
					'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 'else\n' +
					'copy name of view of front window to the end of tracklist\n' +
					'repeat with i from 1 to (count of tracks of view of front window)\n' + 
					'set trackinfo to {}\n' + 
					'copy id of track i of view of front window to the end of trackinfo\n' + 
					'copy artist of track i of view of front window to the end of trackinfo\n' + 
					'copy album of track i of view of front window to the end of trackinfo\n' + 
					'copy name of track i of view of front window to the end of trackinfo\n' + 
					'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 
					'end if\n' + 'end tell\n' + 'return tracklist\n';
			} else {
				script_string = 'set tracklist to {}\n' + 'tell application "iTunes"\n' +
					'repeat with i from 1 to (count of tracks of playlist "' + 
					req.param("id") + '")\n' + 
					'set trackinfo to {}\n' + 
					'copy id of track i of playlist "' + req.param("id") + 
					'" to the end of trackinfo\n' +
					'copy artist of track i of playlist "' + req.param("id") + 
					'" to the end of trackinfo\n' +
					'copy album of track i of playlist "' + req.param("id") + 
					'" to the end of trackinfo\n' +
					'copy name of track i of playlist "' + req.param("id") + 
					'" to the end of trackinfo\n' +
					'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 'end tell\n' + 
					'return tracklist\n';
			}
			break;

		case "playlists/select":
			script_string = 'set tracklist to {}\n' + 'tell application "iTunes"\n' + 
				'set view of front browser window to playlist named "' +
				req.param("id") + '"\n' + 
				'play the playlist named "' + 
				req.param("id") + '"\n' + 
				'if player state is playing then\n' + 
				'copy name of current playlist to the end of tracklist\n' +
				'repeat with i from 1 to (count of tracks of current playlist)\n' + 
				'set trackinfo to {}\n' + 
				'copy id of track i of current playlist to the end of trackinfo\n' + 
				'copy artist of track i of current playlist to the end of trackinfo\n' + 
				'copy album of track i of current playlist to the end of trackinfo\n' + 
				'copy name of track i of current playlist to the end of trackinfo\n' + 
				'copy trackinfo to the end of tracklist\n' + 'end repeat\n' + 'end if\n' + 
				'end tell\n' + 'return tracklist\n';
			break;

		default:
			break;
	}

	applescript.execString(script_string, function(error, result) {
		if((!error) && (result) && (result.length > 0)) {
			switch(req.params[0]) {
				case "library/search":
					currentStatus.search.items = [];

					for(var i = 0; i < result.length; i++) {
						currentStatus.search.items.push({
							id: result[i][0],
							artist: result[i][1],
							album: result[i][2],
							title: result[i][3]});
					}
					break;
				
				case "playlists/list":
					if(req.param("id") == "*") {
						currentStatus.views.playlists.items = [];
					
						for(var i = 1; i < result.length; i++) {
							currentStatus.views.playlists.items.push({
								name: result[i],
								type: "User Created",
								id: result[i] });
						}
					} else if(req.param("id") == "current") {
						currentStatus.views.current.name = result[0];
						currentStatus.views.current.items = [];

						for(var i = 1; i < result.length; i++) {
							currentStatus.views.current.items.push({
								id: result[i][0],
								artist: result[i][1],
								album: result[i][2],
								title: result[i][3]});
						}
					} else {
						currentStatus.views.selected.name = result[0];
						currentStatus.views.selected.items = [];

						for(var i = 1; i < result.length; i++) {
							currentStatus.views.selected.items.push({
								id: result[i][0],
								artist: result[i][1],
								album: result[i][2],
								title: result[i][3]});
						}
					}
					break;
			
				case "status":
				case "playlists/select":
					currentStatus.views.current.name = result[0];
					currentStatus.views.current.items = [];

					for(var i = 1; i < result.length; i++) {
						currentStatus.views.current.items.push({
							id: result[i][0],
							artist: result[i][1],
							album: result[i][2],
							title: result[i][3]});
					}
					break;
			
				default:
					break;
			}
		}
		
		var script_string = 'tell application "iTunes" to get player state & sound volume & mute\n';
	
		applescript.execString(script_string, function(error, info) {
			if(error) {
				res.send(currentStatus.getStatus(req.socket.address().address, "unknown"));
				
				return;
			}
			
			currentStatus.volume = parseInt(info[1]);
			currentStatus.mute = (info[2] == "true");
			
			if((info[0] != "playing") && (info[0] != "paused")) {
				currentStatus.current.artist = "";
				currentStatus.current.title = "";

				res.send(currentStatus.getStatus(req.socket.address().address, "stopped"));
			} else { 
				script_string = 'tell application "iTunes" to get song repeat of current playlist & ' +
					'shuffle of current playlist & {id, artist, name} of current track';
			
				applescript.execString(script_string, function(error, status) {
					if(error) {
						res.send(currentStatus.getStatus(req.socket.address().address, "stopped"));
						
						return;
					}
					
					currentStatus.repeat = (status[0] != "off");
					currentStatus.random = (status[1] == "true");
					
					currentStatus.current.id = status[2];
					currentStatus.current.artist = status[3];
					currentStatus.current.title = status[4];

					res.send(currentStatus.getStatus(req.socket.address().address, info[0]));
				});
			}
		});
	});
};

