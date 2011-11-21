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

Temperature sensors:

	* If you have 1-wire temperature sensors and want them to show up in the 
		status extension on the client side then you need to have w1_therm 
		kernel module loaded