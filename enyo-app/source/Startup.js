enyo.kind({
	name: "Startup",
	kind: enyo.VFlexBox,
	flex: 1,
	className: "basic-back",
	
	events: {
		onDone: ""
	},
	
	components: [
		{name: "startupView", layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "startupHeader", kind: "CustomPageHeader", taglines: [{weight: 100, text: "Welcome to Home Controller!"}]},

			{layoutKind: "VFlexLayout", flex: 1, align: "left", style: "padding-right: 10px; font-size: 14px;", components: [
				{name: "startupScroller", kind: "Scroller", height: "613px", components: [
					{name: "instructions", content: "<br><center><b>Here is some basic information for new users:</b></center><ul>" +
						"<li>Some of the controllers can control devices directly, some need a server side application</li>" +
						"<li>Refer to the wiki on how to configure the required device/server side for the controllers</li>" +
						"</ul><br>"},

					{kind: "Divider", caption: "0.7.3"},
					{content: "<ul><li>Added seek fwd/bwd support for MPD and iTunes</li>" +
						"<li>Fine tuned the music player user interface</li></ul>"},

					{kind: "Divider", caption: "0.7.2"},
					{content: "<ul><li>Added showing of current song in play queue</li>" +
						"<li>Added queue / playlists / search features for iTunes</li></ul>"},

					{kind: "Divider", caption: "0.7.1"},
					{content: "<ul><li>Added queue / playlists / search features for MPD</li></ul>"},

					{kind: "Divider", caption: "0.7.0"},
					{content: "<ul><li>Added support for controlling QuickTime on OS X</li>" +
						"<li>Added experimental support for touchpad surveillance</li>" +
						"<li>Added experimental support for controlling mouse on OS X</li>" +
						"<li>Added support for controlling front row application on OS X</li>" + 
						"<li>Added support for controlling system volume on Linux / OS X</li></ul>"},

					{kind: "Divider", caption: "0.6.0"},
					{content: "<ul><li>Added support for controlling VLC media player</li>" +
						"<li>Added surveillance extension with support for Cisco IP camera</li>" +
						"<li>Added support for controlling iTunes on a OS X operating system</li>" +
						"<li>Added support for controlling mouse and keyboard on Linux</li></ul>"},

					{kind: "Divider", caption: "0.5.2"},
					{content: "<ul><li>Small changes / fixes for the user interface</li></ul>"},

					{kind: "Divider", caption: "0.5.1"},
					{content: "<ul><li>Fixed the application and package ID to be correct</li></ul>"},
					
					{kind: "Divider", caption: "0.5.0"},
					{content: "<ul><li>First beta release with basic controlling support</li></ul>"},
				]}
			]},
		
			{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
				{kind: "Button", caption: "Ok, I've read this. Let's continue ...", onclick: "handleDoneReading"}
			]}
		]}
	],

	adjustInterface: function(inSize) {
		this.$.startupScroller.applyStyle("height", (inSize.h - 87) + "px");
	},
	
	hideWelcomeText: function() {
		this.$.instructions.hide();

		this.$.startupHeader.setTagLine("Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=7A4RPR9ZX3TYS&lc=FI&item_name=For%20Home%20Control&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted\">donated</a>?");
	},
	
	handleDoneReading: function(inSender, inEvent) {
		this.doDone();
	}
});

