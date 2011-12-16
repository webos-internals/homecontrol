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

var timestamp = null;

var currentStatus = null;

var fs = require('fs');
var util = require('util');

exports.setup = function(cb, os) {
	currentStatus = new SystemSurveillanceStatus();

	cb("surveillance", "Surveillance", "TouchPad Cam");
};

exports.execute = function(cb, url, addr) {
	console.log("Executing surveillance command: " + url.command);

	if(url.command == "status") {
		cb("surveillance", "online", currentStatus);
	} else if(url.command == "latest") {
		if(timestamp)
			res.sendfile('./data/surveillance/capture-' + timestamp + ".jpg"); 
		else
			res.send("No captures...");
	} else if((url.command == "upload") && (req.method.toLowerCase() == 'get')) {
	  res.send('<form method="post" enctype="multipart/form-data">' +
   		'<p>Image: <input type="file" name="image" /></p>' +
		   '<p><input type="submit" value="Upload" /></p>' +
		   '</form>');
	} else if((url.command == "upload") && (req.method.toLowerCase() == 'post')) {
		var date = new Date();
	
		timestamp = date.getTime();
	
		if(req.form) {
			req.form.complete(function(err, fields, files) {
			 if(err) {
				next(err);
			 } else {
				ins = fs.createReadStream(files.image.path);
				ous = fs.createWriteStream('./data/surveillance/capture-' + timestamp + ".jpg");
				
				util.pump(ins, ous, function(err) {
				  if(err) {
				    next(err);
				  }
				});
				
				console.log('Uploaded surveillance image: capture-%s.jpg', timestamp);
				
				res.send('Uploaded image file: capture-' + timestamp + ".jpg");
			 }
		  });
		} else {
			cb("surveillance", "error", currentStatus);
		}
	}

	return;
};
