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

var timeout = null;

var exec = require('child_process').exec;

var update = function(cb) {
	if(!cb)
		console.log("Reading 1-wire sensors");
	
	var execute_string = "./data/bin/temperatures-update.sh";
	
	var child = exec(execute_string, function(error, stdout, stderr) {
		if((error) && (cb))
			cb(null);
		else if(cb) {
			cb("1-wire", "1-Wire", "Status Info");
			
			timeout = setTimeout(update, 60000);
		}
	});
};

exports.setup = function(cb) {
	return update(cb);
};

exports.execute = function(req, res) {
	console.log("Executing 1-wire command: " + req.params[0]);
	
	var execute_string = "./data/bin/temperatures-fetch.sh";
	
	var child = exec(execute_string, function(error, stdout, stderr) {
		if(error !== null) {
			res.send('null');
		} else {
			var sensors = new Array();
			
			var info = stdout.split('\n');
			
			for(var i = 0; i < info.length; i++) {
				var tmp = info[i].split(" ");
				
				if(tmp.length == 4) {
					sensors.push({"sensor": tmp[0], "current": tmp[1], 
						"lowest": tmp[2], "highest": tmp[3]});
				}
			}
			
			res.send({"sensors": sensors});
		}
	});			
};

