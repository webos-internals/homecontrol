Here you find very limited info how to set this up. More detailed information
coming later. If you have questions then see the official thread of Home
Control application: 

	http://forums.precentral.net/enlightened-linux-solutions/305887-app-home-control.html

Installation / requirements:

	* Node.js, refer to your distributions documentation how to install node.js
	
	* For mouse/keyboard control in linux you need to install xdotool:

		apt-get install xdotool (might be with different name)

Running the server:

	* To run the server just run the following command in this directory:

		node server.js

Configuration:

	* On the client app use the computers ip address where the server.js was
		started and port 3000 (e.g. 192.168.0.100:3000)

	* Boxee Box control won't need this server app, instead configure it with
		the Boxee Box ip and port (default port is 8800)

VLC control:

	* VLC needs to have the LUA interface enabled from the preferences, or
		start VLC with following command from command line:

		vlc --extraintf=luaintf --lua-intf=http

Temperature sensors:

	* If you have wire-1 temperature sensors and want them to show up in the 
		status extension on the client side then you need to have w1_therm 
		kernel module loaded