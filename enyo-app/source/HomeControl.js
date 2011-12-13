enyo.kind({
	name: "HomeControl",
	kind: enyo.VFlexBox,

	_ui: "full",
	
	_off: {},

	_index: 0,

	_selected: -1,

	_config: [],
	
	_servers: [],
	
	_controllers: [],

// * Status Info: for showing 1-wire status info (ready for 0.7)
// * Surveillance: support for video/snapshots (ready for 0.7)
// * System Input: system mouse and keyboard controls (ready for 0.7)
// * System Sound: master sound and speaker controls (ready for 0.7)
// * Media Center: media boxes with d-pad controls (ready for 0.7)
// * Music Player: music player applications (ready for 1.0)
// * Video Player: video player applications (ready for 0.7)
/*
	{caption: "Status Info - 1-Wire", value: "StatusInfo:1-wire:hc"},
	{caption: "Surveillance - Cisco IP Cam", value: "Surveillance:cisco:dev"},
	{caption: "Surveillance - TouchPad Cam", value: "Surveillance:touchpad:hc"},
//	{caption: "Surveillance - Web Camera", value: "Surveillance:webcam:hc"},
	{caption: "System Sound - Mac OS X", value: "SystemSound:sound:hc"},
	{caption: "System Sound - Pulseaudio", value: "SystemSound:sound:hc"},
//	{caption: "System Sound - Windows", value: "SystemSound:sound:hc"},
	{caption: "System Input - Mac OS X", value: "SystemInput:input:hc"},
	{caption: "System Input - Linux X11", value: "SystemInput:input:hc"},
//	{caption: "System Input - Windows", value: "SystemInput:input:hc"},
	{caption: "Media Center - Front Row", value: "MediaCenter:frontrow:hc"},
	{caption: "Media Center - Boxee Box", value: "MediaCenter:boxee:dev"},
//	{caption: "Media Center - MythTV", value: "MediaCenter:mythtv:hc"},
	{caption: "Media Center - XBMC", value: "MediaCenter:xbmc:device"},
	{caption: "Music Player - Banshee", value: "MusicPlayer:banshee:hc"},
	{caption: "Music Player - iTunes", value: "MusicPlayer:itunes:hc"},
	{caption: "Music Player - MPD", value: "MusicPlayer:mpd:hc"},
	{caption: "Music Player - RhythmBox", value: "MusicPlayer:rhythmbox:hc"},
//	{caption: "Music Player - Winamp", value: "MusicPlayer:winamp:hc"},
	{caption: "Video Player - Quicktime", value: "VideoPlayer:quicktime:hc"},
	{caption: "Video Player - Totem", value: "VideoPlayer:totem:hc"},
	{caption: "Video Player - VLC", value: "VideoPlayer:vlc:app"},
//	{caption: "Video Player - WMP", value: "VideoPlayer:wmp:hc"},
//	{caption: "IR Device - DVD Player", value: "IRDevice:dvdplayer:dev"},
//	{caption: "IR Device - Projector", value: "IRDevice:projector:dev"},
//	{caption: "Audio Speaker - UPnP/DLNA", value: "UPnPSpeaker:speaker:dev"},
//	{caption: "Television - UPnP/DLNA", value: "UPnPTV:tv:dev"},
*/

	
	components: [
		{kind: "ApplicationEvents", onBack: "handleBackEvent"},

		{kind: "AppMenu", components: [
//			{caption: "Show Servers", onclick: "showAllServers"},
//			{caption: "Auto Discover", onclick: "autoDiscover"},
			{caption: "Add Server", onclick: "addNewServer"},
			{caption: "Help", onclick: "showHelpInfo"}
		]},

		{name: "hlpPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Help", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "For help you need to see the Home Control " +
				"<a href=http://www.webos-internals.org/wiki/Application:HomeControl>Wiki</a>. " +
				"It lists all the supported features and should answer all the questions you may have.", 
				className: "enyo-item-secondary", style: "margin: 5px;text-align: justify;"},
			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Close", onclick: "closeHelpPopup"}
			]}
		]},	


/*		{name: "lstPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "Server List", flex: 1, style: "text-decoration: underline;text-align: center;"},
			{name: "srvList", kind: "VirtualList", style: "height: 250px;border-style: groove;", 
				onSetupRow: "setupServerRow", components: [
				{kind: "Item", tapHighlight: false, components: [
					{layoutKind: "HFlexLayout", components: [
						{name: "itemAddr", content: "", style: "font-size: 16px;", flex: 1},
						{name: "itemType", content: "", className: "enyo-label"}
					]}
				]}
			]},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "OK", onclick: "closeAllServers"}
			]}
		]},	
*/

		{name: "srvPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{content: "No Controllers Found", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{content: "No servers or supported devices found. You can try the automatic discovery again or " +
				"add server / device manually if they don't support automatic discovery.", className: "enyo-item-secondary",
				style: "margin: 5px;text-align: justify;"},

			{layoutKind: "VFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Auto Discover", onclick: "autoDiscover"},
				{kind: "Button", flex: 1, caption: "Add Manually", onclick: "addNewServer"}
			]}
		]},	

		{name: "addPopup", lazy: false, kind: "Popup", showKeyboardWhenOpening: true, style: "width: 80%;max-width: 500px;", components: [
			{content: "Add New Server", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server Type", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "serverType", kind: "ListSelector", value: "HC", flex: 1, style: "margin: 5px 5px;", items: [
				{caption: "Home Control Server", value: "HC"},
				{caption: "Boxee App / Device", value: "Boxee"},
				{caption: "XBMC App / Device", value: "XBMC"},
				{caption: "VLC Video Player", value: "VLC"}
			]},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server / Device", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "serverAddr", kind: "Input", hint: "Device / Server address...",  
				autocorrect: false, spellcheck: false, autoCapitalize: "lowercase", alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddServer"},
				{kind: "Button", flex: 1, caption: "OK", className: "enyo-button-affirmative", onclick: "handleAddServer"}
			]}
		]},	

		{name: "newPopup", lazy: false, kind: "Popup", showKeyboardWhenOpening: true, style: "width: 80%;max-width: 500px;", components: [
			{content: "Setup New Controller", flex: 1, style: "text-decoration: underline;text-align: center;margin-bottom: 5px;"},
			{layoutKind: "HFlexLayout", components: [
				{content: "Controller Type", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerType", kind: "ListSelector", value: "", flex: 1, style: "margin: 5px 5px;", 
				onChange: "updateAddController", items: []},
			{layoutKind: "HFlexLayout", components: [
				{content: "Server / Device", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerAddr", kind: "ListSelector", value: "", flex: 1, style: "margin: 5px 5px;", items: []},
			{layoutKind: "HFlexLayout", components: [
				{content: "Controller Name", style: "font-size: 16px;color: gray;"},
				{flex: 1, className: "custom-divider", style: "margin-left: 5px;margin-bottom: -5px;"}
			]},
			{name: "controllerName", kind: "Input", hint: "Name for the controller...", autoCapitalize: "title", 
				autocorrect: false, spellcheck: false, alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "cancelAddController"},
				{kind: "Button", flex: 1, caption: "OK", className: "enyo-button-affirmative", onclick: "handleAddController"}
			]}
		]},	
	
		{name: "appPane", kind: "SlidingPane", multiViewMinWidth: 300, flex: 1, style: "background: #666666;", 
			onSlideComplete: "adjustSlidingTag", components: [
			{name: "left", width: "320px", components: [
				{name: "leftPane", kind: "Pane", transitionKind: enyo.transitions.Simple, flex: 1, components: [
					{name: "startup", kind: "Startup", onDone: "handleStartupDone"},
					{layoutKind: "VFlexLayout", flex: 1, components: [
						{kind: "CustomPageHeader", taglines: [{weight: 100, text: "One remote to rule them all!"}], onclick: "handleBackEvent"},

						{name: "controlItems", layoutKind: "VFlexLayout", flex: 1, components: []},

						{name: "leftToolbar", kind: "Toolbar", pack: "left", className: "enyo-toolbar-light", components: [
							{name: "moreLeft", kind: "ToolButton", icon: "./images/button-more.png", onclick: "updateControls"},
							{kind: "Spacer", flex: 1},
							{name: "addButton", kind: "Button", caption: "Add New Controller", onclick: "addNewController"},
							{kind: "Spacer", flex: 1},
							{name: "moreRight", kind: "ToolButton", icon: "./images/button-nomore.png"},
						]}
					]},
				]}
			]},
			{name: "middle", fixedWidth: true, dragAnywhere: false, peekWidth: 64, width: "704px", components: [
				{name: "tag", kind: "CustomSlidingTag"}, 

				{name: "middlePane", kind: "Pane", transitionKind: "enyo.transitions.Simple", flex: 1, components: []}
			]},
			{name: "right", fixedWidth: true, dragAnywhere: false, peekWidth: 672, width: "352px", components: [
				{name: "rightPane", kind: "Pane", transitionKind: "enyo.transitions.Simple", flex: 1, components: []}
			]}
		]},
		
		{name: "queryServerControllers", kind: "WebService", onSuccess: "handleServerResponse", onFailure: "handleServerError"}
	],

	rendered: function() {
		this.inherited(arguments);

		enyo.keyboard.setResizesWindow(false);

		this.$.moreLeft.hide();
		this.$.moreRight.hide();

		this.adjustSliding();
		
		this.$.tag.hide();

		if((localStorage) && (localStorage["version"])) {
			version = localStorage["version"];

			if(version != enyo.fetchAppInfo().version) {
				this.$.startup.hideWelcomeText();
			} else {
				this.$.leftPane.selectViewByIndex(1);
			}
		}

		localStorage["version"] = enyo.fetchAppInfo().version;

		if((localStorage) && (localStorage["controllers"])) {
			this._config = enyo.json.parse(localStorage["controllers"]);

		// TODO: poista joskus!!!
			
			for(var i = 0; i < this._config.length; i++) {
				if(this._config[i].extension == "HomeTheater")
					this._config[i].extension = "MediaCenter";

				if((this._config[i].extension == "Computer") ||
					(this._config[i].extension == "ComputerInput"))
				{
					this._config[i].extension = "SystemInput";
					this._config[i].module = "input";
				}

				if(this._config[i].extension == "StatusInfo")
					this._config[i].module = "1-wire";

				if(this._config[i].module == "boxeebox")
					this._config[i].module = "boxee";
			}

			localStorage["controllers"] = enyo.json.stringify(this._config);
		}

		if((localStorage) && (localStorage["servers"])) {
			this._servers = enyo.json.parse(localStorage["servers"]);
		}

		// Some weird bug with calling webserver on rendered if the server is down,
		// causes white card on launch, with small delay no problems...
		
		setTimeout(this.queryServers.bind(this), 100);
//		this.queryServers();
	},

	resizeHandler: function() {
		this.adjustSliding();
	},
	
	adjustSliding: function() {
		var size = enyo.fetchControlSize(this);

		if(size.w <= 768) {
			this._ui = "compact";
		
			if(size.w < 768) {
				enyo.setAllowedOrientation("up");

				this.$.middle.applyStyle("width", (size.w - 64) + "px");
			} else {
				this.$.middle.applyStyle("width", (size.w - 320) + "px");

				this.$.middle.setPeekWidth(320);			
			}
		} else {	
			this.$.middle.applyStyle("width", "352px");

			this.$.middle.setPeekWidth(320);
		
//			this.$.right.setPeekWidth(size.w - 320 + 64);
		}
	},
	
	adjustSlidingTag: function() {
		if(this.$.appPane.getViewIndex() == 0)
			this.$.tag.hide();
		
	},

	handleBackEvent: function(inSender, inEvent) {
		if((this._ui == "compact") && (this.$.appPane.getViewIndex() > 0)) {
			if(inEvent)
				enyo.stopEvent(inEvent);

			this._selected = -1;

			this.$.appPane.back();
		}
	},

	handleStartupDone: function() {
		this.$.leftPane.selectViewByIndex(1);
	},

	showKeyboard: function() {
		enyo.keyboard.show();
	},

	queryServers: function() {
		for(var i = 0; i < this._servers.length; i++)
			this.addControllerServer(this._servers[i]);
		
		this.setupExtensions();
	},

	setupExtensions: function() {
		var size = enyo.fetchControlSize(this);

		var maxItems = Math.round((size.h - 188) / 34);

		if(this._config.length <= maxItems) {
			this.$.moreLeft.hide();
			this.$.moreRight.hide();
		} else {
			this.$.moreLeft.show();
			this.$.moreRight.show();
		}
		
		for(var i = 0; i < this._config.length; i++) {
			if(this.$["extensionItem" + i])
				this.$["extensionItem" + i].destroy();

			if(this.$["extensionView" + i])
				this.$["extensionView" + i].destroy();

			if(this.$["altExtensionView" + i])
				this.$["altExtensionView" + i].destroy();
		}

		for(var i = 0; i < this._config.length; i++) {
			this.$.controlItems.createComponent(
				{name: "extensionItem" + i, kind: "SwipeableItem", layoutKind: "HFlexLayout", tapHighlight: true, view: i, align: "center", 
					style: "padding: 0px 10px; min-height: 24px; max-height: 56px;", flex: 1, 
					onConfirm: "handleDelController", onclick: "updateView", components: [
						{name: "extensionIcon" + i, kind: "Image", src: this._config[i].icon, style: "margin: 0px 18px -3px 5px;"},
						{content: this._config[i].title, flex: 1, style: "text-transform: capitalize; margin-top: -1px;line-height:13px;"},
						{name: "extensionStatus" + i, content: this._config[i].status, className: "enyo-label", style: "color: gray;margin-right: 10px;"}
				]}, {owner: this});

			if(i >= maxItems)
				this.$["extensionItem" + i].hide();

			this.$.middlePane.createComponent({name: "extensionView" + i, kind: this._config[i].extension, 
				title: this._config[i].title, module: this._config[i].module, address: this._config[i].address,
				flex: 1, onUpdate: "updateStatus"}, {owner: this});

			if(this._ui == "full") {
				this.$.rightPane.createComponent({name: "altExtensionView" + i, kind: this._config[i].extension, 
					title: this._config[i].title, module: this._config[i].module, address: this._config[i].address,
					flex: 1}, {owner: this});
			}
		}
		
		this.$.controlItems.render();

		this.$.middlePane.render();
		this.$.rightPane.render();
	},

	updateControls: function() {
		var size = enyo.fetchControlSize(this);
			
		var maxItems = Math.round((size.h - 188) / 34);

		if(this._index == 0) {
			this._index = this._config.length % maxItems;
		} else {
			this._index = 0;
		}

		for(var i = 0; i < this._config.length; i++) {
			if((i < this._index) || (i >= (this._index + maxItems)))
				this.$["extensionItem" + i].hide();
			else
				this.$["extensionItem" + i].show();			
		}
		
		if(this.$.appPane.getViewIndex() == 1) {
			if((this._ui == "full") || (this._selected < this._index) || (this._selected >= (this._index + maxItems)))
				this.$.tag.hide();
			else {
				this.$.tag.show();
							
				var item = this.$["extensionItem" + this._selected];
			
				this.$.tag.setPosition(item.getOffset().top + ((item.hasNode().clientHeight - 50) / 2) + 2);
			}
		}
	},
	
	updateView: function(inSender) {
		if((this._ui == "full") && (inSender.view != this._selected))
			this.$.rightPane.selectViewByIndex(this._selected);
		
		if(inSender.view == this._selected) {
			this.handleBackEvent();

			this._off["extensionView" + inSender.view] = true;
		
			this.$["extensionView" + inSender.view].selected(null);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "0.5");
		} else {
			this._off["extensionView" + inSender.view] = false;
			
			if(this._selected != -1)
				this.$["extensionView" + this._selected].selected(false);
			
			this.$["extensionView" + inSender.view].selected(true);

			this.$["extensionIcon" + inSender.view].applyStyle("opacity", "1.0");

			this._selected = inSender.view;
	
			this.$.middlePane.selectViewByIndex(inSender.view);
			this.$.appPane.selectViewByIndex(1);

			if(this._ui != "full") {
				this.$.tag.show();

				this.$.tag.setPosition(this.$[inSender.name].getOffset().top + ((inSender.hasNode().clientHeight - 50) / 2) + 2);
			}
		}
	},
	
	updateStatus: function(inSender, inStatus) {
		if((inStatus) && (!this._off[inSender.name])) {
			this.$[inSender.name.replace("View", "Status")].setContent(inStatus);
		}			
	},
	
/*	setupServerRow: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._servers.length)) {
			this.$.itemAddr.setContent(this._servers[inIndex].addr);

			this.$.itemType.setContent(this._servers[inIndex].type);
			
			return true;
		}
	},
	
	showAllServers: function() {
		this.$.srvList.refresh();
	
		this.$.lstPopup.openAtCenter();
	},

	closeAllServers: function() {
		this.$.lstPopup.close();
	},
*/	

	showHelpInfo: function() {
		this.$.hlpPopup.openAtCenter();
	},
	
	closeHelpPopup: function() {
		this.$.hlpPopup.close();
	},

	autoDiscover: function() {
		this.$.srvPopup.close();
	},

	addNewServer: function() {
		this.$.srvPopup.close();

		this.$.serverAddr.setValue("");

		this.$.addPopup.openAtCenter();
	},
	
	cancelAddServer: function() {
		this.$.addPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
	},
	
	handleAddServer: function() {
		var date = new Date();
	
		this.$.addPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);

		var type = this.$.serverType.getValue();
		var addr = this.$.serverAddr.getValue();

		for(var i = 0; i < this._servers.length; i++) {
			if(this._servers[i].addr == addr)
				this._servers.splice(i--, 1);
		}

		this._servers.push({addr: addr, type: type, timestamp: date.getTime()});

		this.addControllerServer({addr: addr, type: type});

		localStorage["servers"] = enyo.json.stringify(this._servers);
	},
	
	addNewController: function() {
		if(this._controllers.length == 0) {
			this.$.srvPopup.openAtCenter();		
		} else {
			this.$.controllerName.setValue("");

			this._controllers.sort(this.sortControllerOptions);

			this.$.controllerType.setItems(this._controllers);
		
			this.$.controllerType.setValue(this._controllers[0].value);

			this.$.controllerAddr.setItems(this._controllers[0].servers);

			this.$.controllerAddr.setValue(this._controllers[0].servers[0]);

			this.$.newPopup.openAtCenter();
		}
	},

	updateAddController: function() {
		for(var i = 0; i < this._controllers.length; i++) {
			if(this._controllers[i].value == this.$.controllerType.getValue()) {
				this.$.controllerAddr.setItems(this._controllers[i].servers);
		
				this.$.controllerAddr.setValue(this._controllers[i].servers[0]);
				
				break;
			}
		}
	},

	cancelAddController: function() {
		this.$.newPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
	},
	
	handleAddController: function() {
		this.$.newPopup.close();

		enyo.keyboard.hide();

		enyo.keyboard.setManualMode(false);
		
		var controller = this.$.controllerType.getValue().split(":");
	
		this._config.push({extension: controller[0], module: controller[1], icon: "./images/icon-" + 
			controller[0].toLowerCase() +".png", title: this.$.controllerName.getValue(), 
			address: this.$.controllerAddr.getValue(), status: "offline"});

		localStorage["controllers"] = enyo.json.stringify(this._config);
			
		this.setupExtensions();
	},
	
	handleDelController: function(inSender) {
		this._config.splice(inSender.view, 1);

		localStorage["controllers"] = enyo.json.stringify(this._config);

		this.$["extensionItem" + inSender.view].destroy();

		this.$["extensionView" + inSender.view].destroy();

		this.$["altExtensionView" + inSender.view].destroy();
	},
	
	addControllerServer: function(inServer) {
		if(inServer.type == "HC")
			this.$.queryServerControllers.call({}, {url: "http://" + inServer.addr + "/modules?id=" + inServer.addr});
		else if(inServer.type == "VLC")
			this.addControllerOption("app", "any", "vlc", "VLC", "Video Player", inServer.addr);
		else if(inServer.type == "XBMC")
			this.addControllerOption("app", "any", "xbmc", "XBMC", "Media Center", inServer.addr);
		else if(inServer.type == "Boxee")
			this.addControllerOption("app", "any", "boxee", "Boxee", "Media Center", inServer.addr);
	},

	addControllerOption: function(inCategory, inPlatform, inID, inName, inType, inAddr) {
		var controllerAdded = false;
	
		var value = inType.replace(" ", "") + ":" + inID + ":" + inPlatform;
	
		for(var i = 0; i < this._controllers.length; i++) {
			if(this._controllers[i].value == value) {
				controllerAdded = true;
				
				if(this._controllers[i].servers.indexOf(inAddr) == -1)
					this._controllers[i].servers.push(inAddr);
				
				break;
			}
		}
		
		if(!controllerAdded) {
			this._controllers.push({caption: inType + " - " + inName, 
				category: inCategory, servers: [inAddr], value: value});		
		}
	},
	
	handleServerResponse: function(inSender, inResponse) {
		enyo.error("Server query - " + enyo.json.stringify(inResponse));
		
		if((inResponse) && (inResponse.request) && (inResponse.modules)) {
			for(var i = 0; i < inResponse.modules.length; i++) {
				var category = inResponse.modules[i].category;
				var platform = inResponse.modules[i].platform;

				var id = inResponse.modules[i].id;
				var name = inResponse.modules[i].name;
				var type = inResponse.modules[i].type;

				this.addControllerOption(category, platform, id, name, type, inResponse.request);
			}
		}
	},

	handleServerError: function(inSender, inResponse) {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
	},
	
	sortControllerOptions: function(inOptionA, inOptionB) {
		if(inOptionA.category == inOptionB.category) {
			var a = inOptionA.caption.toLowerCase();
			var b = inOptionB.caption.toLowerCase();
		} else {
			var a = inOptionB.category.toLowerCase();
			var b = inOptionA.category.toLowerCase();
		}
		
		return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	}
});

