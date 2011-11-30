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

var storedInputVolume = 0; // Go around OS X having no mute for input

var os = null;

var exec = require('child_process').exec;

var applescript = require("applescript");

exports.setup = function(cb) {
	var child = exec("pactl --help", function(error, stdout, stderr) {
		if(error) {
			var child = exec("osascript -e 'help'", function(error, stdout, stderr) {
				if(error) {
					cb(false);
				} else {
					os = "OSX";
					
					cb("sound", "Mac OS X", "System Sound");
				}
			});				
		} else {
			os = "Linux";
			
			cb("sound", "PulseAudio", "System Sound");
		}
	});
};

exports.execute = function(req, res) {
	console.log("Executing sound command: " + req.params[0]);
	
	if(os == "Linux") {
		var execute_string = "";
		
		if(req.params[0] == "input") {
			if(req.param("mute"))
				execute_string += './data/bin/pulseaudio-control.sh input mute ' + req.param("mute") + ';';
			
			if(req.param("volume"))
				execute_string += './data/bin/pulseaudio-control.sh input volume ' + req.param("volume") + ';';
		} else if(req.params[0] == "output") {
			if(req.param("mute"))
				execute_string += './data/bin/pulseaudio-control.sh output mute ' + req.param("mute") + ';';
			
			if(req.param("volume"))
				execute_string += './data/bin/pulseaudio-control.sh output volume ' + req.param("volume") + ';';
		}
		
		execute_string += './data/bin/pulseaudio-control.sh status';
		
		var child = exec(execute_string, function(error, stdout, stderr) {
			res.header('Content-Type', 'text/javascript');
			
			if(error !== null) {
				res.send({"state": "unknown", "input": {"volume": 0, "mute": true}, 
					"output": {"volume": 0, "mute": true}});
			} else {
				var status = stdout.replace("\n", "").split(",");
				
				res.send({"state": "online", "input": {"volume": parseInt(status[0]), "mute": (status[1] == "true")}, 
					"output": {"volume": parseInt(status[2]), "mute": (status[3] == "true")}});
			}
		});		
	} else if(os == "OSX") {
		var script_string = "";
		
		if(req.params[0] == "input") {
			if(req.param("mute") == "true")
				var script_string = 'set volume input volume 0\n';
			else if(req.param("volume"))
				var script_string = 'set volume input volume ' + req.param("volume") + '\n';
			else
				var script_string = 'set volume input volume ' + storedInputVolume + '\n';
		} else if(req.params[0] == "output") {
			var script_string = 'set volume';
			
			if(req.param("volume"))
				script_string = 'set volume output volume ' + req.param("volume");
			
			if(req.param("mute") == "true")
				script_string += ' with output muted\n';
			else
				script_string += ' without output muted\n';
		}
		
		script_string += 'get volume settings\n';
		
		applescript.execString(script_string, function(error, result) {
			if(error) {
				res.send({"state": "unknown", "input": {"volume": 0, "mute": true}, 
					"output": {"volume": 0, "mute": true}});
			} else {
				var inputMuted = false;
				
				var inputVolume = result[1].split(":")[1];
				
				if(inputVolume != 0)
					storedInputVolume = inputVolume;
				else {
					inputMuted = true;
					
					inputVolume = storedInputVolume;
				}
				
				var state = "online";
				
				if(result[3].split(":")[1] == "true")
					state = "muted";
				
				res.send({"state": "online", "input": {"volume": inputVolume, "mute": inputMuted}, 
					"output": {"volume": result[0].split(":")[1], "mute": (result[3].split(":")[1] == "true")}});
			}
		});
	}	
};

