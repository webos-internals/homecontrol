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
			cb("frontrow", "Front Row", "Media Center");
	});
};

exports.execute = function(req, res) {
	console.log("Executing frontrow command: " + req.params[0]);
	
	var script_string = "";
	
	if(req.params[0] == "start") {
		script_string = 'tell application "System Events" to key code 53 using command down\n';	
	} else if(req.params[0] == "close") {
		script_string = 'tell application "System Events" to key code 53 using {command down, option down}\n';	
	} else if(req.params[0] == "left") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 28)\n';
	} else if(req.params[0] == "right") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 29)\n';
	} else if(req.params[0] == "up") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 30)\n';
	} else if(req.params[0] == "down") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 31)\n';
	} else if(req.params[0] == "select") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 32)\n';
	} else if(req.params[0] == "back") {
		script_string = 'tell application "System Events" to key code 53\n';
	} else if(req.params[0] == "play-pause") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 32)\n';
	} else if(req.params[0] == "seek") {
		if(req.param("action") == "bwd")
			script_string = 'tell application "System Events" to keystroke (ASCII character 28)\n';
		else if(req.param("action") == "fwd")
			script_string = 'tell application "System Events" to keystroke (ASCII character 29)\n';
	} else if(req.params[0] == "prev") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 28) using command down\n';
	} else if(req.params[0] == "next") {
		script_string = 'tell application "System Events" to keystroke (ASCII character 29) using command down\n';
	} else if(req.params[0] == "mute") {
	} else if(req.params[0] == "volume") {
	}
	
	applescript.execString(script_string, function(error, info) {
		if(error) {
			res.send({"state": "unknown"});
		} else {
			res.send({"state": "online"});
		}
	});
};

