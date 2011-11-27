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

var os = null;

var x11 = require('x11');

var exec = require('child_process').exec;

var applescript = require("applescript");

exports.setup = function(cb) {
	var child = exec("xdotool --help", function(error, stdout, stderr) {
		if(error) {
			var child = exec("osascript -e 'help'", function(error, stdout, stderr) {
				if(error) {
					cb(false);
				} else {
					os = "OSX";
					
					cb("input", "Mac OS X", "System Input");
				}
			});				
		} else {
			os = "Linux";
			
			cb("input", "Linux X11", "System Input");
		}
	});
};

exports.execute = function(req, res) {
	console.log("Executing input command: " + req.params[0]);

	if(os == "Linux") {
		var execute_string = "";

		if(req.params[0] == "keyboard") {
			if(req.param("up")) {
				var key = req.param("up");

				execute_string += "xdotool keyup " + key + "; ";
			}		

			if(req.param("down")) {
				var key = req.param("down");

				execute_string += "xdotool keydown " + key + "; ";
			}

			if(req.param("key")) {
				var key = req.param("key");

				execute_string += "xdotool key " + key;
			}

			console.log(execute_string);
		} else if(req.params[0] == "mouse") {
			if(req.param("move")) {
				var pos = req.param("move").split(",");

				execute_string = "xdotool mousemove_relative -- " + pos[0] + " " + pos[1];
			} else if(req.param("down")) {
				var btn = req.param("down");
		
				execute_string = "xdotool mousedown " + btn;
			} else if(req.param("up")) {
				var btn = req.param("up");
		
				execute_string = "xdotool mouseup " + btn;
			}
		}

		var child = exec(execute_string, function(error, stdout, stderr) {
			res.header('Content-Type', 'text/javascript');

			if(error !== null) {
				res.send({status: "offline"});
			} else {
				res.send({status: "online"});
			}
		});
	} else if(os == "OSX") {
		var script_string = "";
		
//		tell application "System Events" to keystroke "o"

//  with {shift down}

		
		if(req.params[0] == "mouse") {
			if(req.param("move")) {
				var pos = req.param("move").split(",");

				script_string = "set mypoint to (get position of the mouse)\n";
				
				script_string += "move mouse {(item 1 of mypoint) + " + pos[0] + 
					", (item 2 of mypoint) + " + pos[1] + "}\n";
			} else if(req.param("down")) {
				// Do nothing...
			} else if(req.param("up")) {
				var btn = req.param("up");
				
				var buttons = ["primary", "middle", "secondary"];

				script_string = "set mypoint to (get position of the mouse)\n";
		
				script_string += "click mouse {(item 1 of mypoint), (item 2 of mypoint)}" + 
					" using " + buttons[btn - 1] + " button\n";
			}
		}

		applescript.execString(script_string, function(error, result) {
			res.header('Content-Type', 'text/javascript');
			
			if(error)
				res.send({"state": "offline"});
			else
				res.send({"state": "online"});
		});
	}
};
