enyo.kind({
	name: "HomeControl",
	kind: enyo.VFlexBox,

	_ui: "full",

	_index: 0,

	_selected: 0,

	_config: [],

// Status info = 1-wire stuff
// Surveillance = support for video/picture + motion detection
// Computer Input = mouse & keyboard control
// Media Center = media boxes with d-pad controls
// Music Player = music players
// Video Player = video players
	
	components: [
		{kind: "ApplicationEvents", onBack: "handleBackEvent"},

		{name: "newPopup", lazy: false, kind: "Popup", showKeyboardWhenOpening: true, style: "width: 80%;max-width: 500px;", components: [
			{content: "Setup New Controller", flex: 1, style: "text-align: center;"},
			{name: "controllerType", kind: "ListSelector", value: "StatusInfo", flex: 1, style: "margin: 10px 5px;", items: [
				{caption: "Status Info - Everything", value: "StatusInfo"},
				{caption: "Surveillance - Cisco IP Cam", value: "Surveillance:cisco"},
				{caption: "Surveillance - TouchPad Cam", value: "Surveillance:touchpad"},
//				{caption: "Sound Control - Pulseaudio", value: "SoundControl:pulseaudio"},
				{caption: "Computer Input - Linux", value: "ComputerInput:linux"},
				{caption: "Media Center - Boxee Box", value: "MediaCenter:boxeebox"},
				{caption: "Media Center - XBMC", value: "MediaCenter:xbmc"},
				{caption: "Music Player - iTunes", value: "MusicPlayer:itunes"},
				{caption: "Music Player - MPD", value: "MusicPlayer:mpd"},
				{caption: "Music Player - RhythmBox", value: "MusicPlayer:rhythmbox"},
				{caption: "Speaker - UPnP/DLNA", value: "UPnPSpeaker:speaker"},
				{caption: "Video Player - Totem", value: "VideoPlayer:totem"},
				{caption: "Video Player - VLC", value: "VideoPlayer:vlc"},
				{caption: "TV - UPnP/DLNA", value: "UPnPTV:tv"},
			]},
			{name: "controllerName", kind: "Input", hint: "Name for the controller...", autoCapitalize: "title", 
				autocorrect: false, spellcheck: false, alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
			{name: "controllerAddr", kind: "Input", hint: "Device / Server address...",  
				autocorrect: false, spellcheck: false, autoCapitalize: "lowercase", alwaysLooksFocused: true, style: "margin: 5px 0px;", onclick: "showKeyboard"},
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
		
		{name: "getTemperatures", kind: "WebService", url: "http://rantsis.dyndns.info/temperatures/server.php", 
			onSuccess: "updateTemperatures"}
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
			
			for(var i = 0; i < this._config.length; i++) {
				if(this._config[i].extension == "HomeTheater")
					this._config[i].extension = "MediaCenter";
			}

			localStorage["controllers"] = enyo.json.stringify(this._config);
		}

		// Some weird bug with calling webserver on rendered if the server is down,
		// causes white card on launch, with small delay no problems...
		
		setTimeout(this.setupExtensions.bind(this), 100);
//		this.setupExtensions();
	},

	handleStartupDone: function() {
		this.$.leftPane.selectViewByIndex(1);
	},

	handleBackEvent: function(inSender, inEvent) {
		if((this._ui == "compact") && (this.$.appPane.getViewIndex() > 0)) {
			enyo.stopEvent(inEvent);

			this.$.appPane.back();
		}
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
	
	showKeyboard: function() {
		enyo.keyboard.show();
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
						{kind: "Image", src: this._config[i].icon, style: "margin: 0px 18px -3px 5px;"},
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
		
		this.$["extensionView" + this._selected].selected(false);
	
		this._selected = inSender.view;
	
		this.$.middlePane.selectViewByIndex(inSender.view);
		this.$.appPane.selectViewByIndex(1);

		if(this._ui != "full") {
			this.$.tag.show();

			this.$.tag.setPosition(this.$[inSender.name].getOffset().top + ((inSender.hasNode().clientHeight - 50) / 2) + 2);
		}
			
		this.$["extensionView" + inSender.view].selected(true);
	},
	
	updateStatus: function(inSender, inStatus) {
		if(inStatus)
			this.$[inSender.name.replace("View", "Status")].setContent(inStatus);
	},
	
	addNewController: function() {
		this.$.controllerName.setValue("");
		this.$.controllerAddr.setValue("");

		this.$.newPopup.openAtCenter();
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
	}	
});

