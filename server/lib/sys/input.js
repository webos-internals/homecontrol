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

var debug = false;

var osType = null;

var modifiers = {};

var currenStatus = null;

var X = null;

var x11 = null;

var applescript = null;

var fs = require('fs');

var keycodes = require('../misc/x11-keycodes.js').keycodes;

exports.setup = function(cb, os) {
/*	if(os == "darwin") {
		var applescript = require("applescript");

		cb("input", "Mac OS X", "System Input");
	} else 
*/	
	if(os == "linux") {
		try { 
			stats = fs.lstatSync("/tmp/.X0-lock"); 

			x11 = require('x11');

			x11.createClient(function(display) {
				if((display) && (display.client) && (display.client.display) && 
					(display.client.display.screen[0]) && (display.client.display.screen[0].root))
				{
					X = display.client;

					X.require('xtest', function(ext) {
						X.Test = ext;

						// Reset modifiers...

						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Shift_L"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Shift_R"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Control_L"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Control_R"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Super_L"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Multi_key"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Alt_L"].keycode, 0, X.display.screen[0].root, 0, 0);
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["ISO_Level3_Shift"].keycode, 0, X.display.screen[0].root, 0, 0);

						osType = "linux";

						currentStatus = new SystemInputStatus();

						cb("input", "Linux X11", "System Input");
					});
				}
			});		
		} catch (error) {
			if(debug)
				console.log("Error: Unable to connect to X!");
		}
	}	
};

exports.execute = function(cb, url, addr) {
	console.log("Executing input command: " + url.command);
/*
	if(osType == "darwin") {
		var script_string = "";
		
//		tell application "System Events" to keystroke "o"

//  with {shift down}

		if(url.command == "mouse") {
			if(url.arguments("move")) {
				var pos = url.arguments("move").split(",");

				script_string = "set mypoint to (get position of the mouse)\n";
				
				script_string += "move mouse {(item 1 of mypoint) + " + pos[0] + 
					", (item 2 of mypoint) + " + pos[1] + "}\n";
			} else if(url.arguments("down")) {
				// Do nothing...
			} else if(url.arguments("up")) {
				var btn = url.arguments("up");
				
				var buttons = ["primary", "middle", "secondary"];

				script_string = "set mypoint to (get position of the mouse)\n";
		
				script_string += "click mouse {(item 1 of mypoint), (item 2 of mypoint)}" + 
					" using " + buttons[btn - 1] + " button\n";
			}
		}

		applescript.execString(script_string, function(error, result) {
			if(error) {
				cb("input", "error", currentStatus);
				
				return;
			}

			cb("input", "online", currentStatus);
			
			return;
		});
	} else 
	*/
	
	if(osType == "linux") {
		if(url.command == "mouse") {
			if(url.arguments("move")) {
				var pos = url.arguments("move").split(",");

				X.QueryPointer(X.display.screen[0].root, function(pointer) {
					X.WarpPointer(0,X.display.screen[0].root, 0, 0, 0, 0, 
						(parseInt(pointer[2]) + parseInt(pos[0])), 
						(parseInt(pointer[3]) + parseInt(pos[1])));
				});
			} else if(url.arguments("down")) {
				var btn = url.arguments("down");

				if(btn != 0) { // Current x11 has a bug that it crashes if btn id is 0
					X.QueryPointer(X.display.screen[0].root, function(pointer) {
						X.Test.FakeInput(X.Test.ButtonPress, btn, 0, X.display.screen[0].root,
							parseInt(pointer[2]), parseInt(pointer[3]));
					});
				}
			} else if(url.arguments("up")) {
				var btn = url.arguments("up");
		
				if(btn != 0) { // Current x11 has a bug that it crashes if btn id is 0
					X.QueryPointer(X.display.screen[0].root, function(pointer) {
						X.Test.FakeInput(X.Test.ButtonRelease, btn, 0, X.display.screen[0].root,
							parseInt(pointer[2]), parseInt(pointer[3]));
					});
				}
			}
		} else if(url.command == "keyboard") {
			if((url.arguments("key")) || (url.arguments("down"))) {
				var key = url.arguments("key") || url.arguments("down");

				if(keycodes[key]) {
					if(key == "Shift_L")
						modifiers.shift = true;
					else if(key == "ISO_Level3_Shift")
						modifiers.altgr = true;

					if((keycodes[key].modifier == "shift") && (!modifiers.shift))
						X.Test.FakeInput(X.Test.KeyPress, keycodes["Shift_L"].keycode, 0, X.display.screen[0].root, 0, 0);
					else if((keycodes[key].modifier == "altgr") && (!modifiers.altgr))
						X.Test.FakeInput(X.Test.KeyPress, keycodes["ISO_Level3_Shift"].keycode, 0, X.display.screen[0].root, 0, 0);
									
//					console.log("Key press: " + key + " " + keycodes[key].keycode);

					X.Test.FakeInput(X.Test.KeyPress, keycodes[key].keycode, 0, X.display.screen[0].root, 0, 0);
				}
			}

			if((url.arguments("key")) || (url.arguments("up"))) {
				var key = url.arguments("key") || url.arguments("up");

				if(keycodes[key]) {
					if(key == "Shift_L")
						modifiers.shift = false;
					else if(key == "ISO_Level3_Shift")
						modifiers.altgr = false;

//					console.log("Key release: " + key + " " + keycodes[key].keycode);
					
					X.Test.FakeInput(X.Test.KeyRelease, keycodes[key].keycode, 0, X.display.screen[0].root, 0, 0);

					if((keycodes[key].modifier == "shift") && (!modifiers.shift))
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["Shift_L"].keycode, 0, X.display.screen[0].root, 0, 0);
					else if((keycodes[key].modifier == "altgr") && (!modifiers.altgr))
						X.Test.FakeInput(X.Test.KeyRelease, keycodes["ISO_Level3_Shift"].keycode, 0, X.display.screen[0].root, 0, 0);
				}
			}
		}

		cb("input", "online", currentStatus);
		
		return;
	}
};

