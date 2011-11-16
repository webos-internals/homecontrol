enyo.kind({
	name: "MediaCenter",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",

	_keyboard: false,
	
	events: {
		onUpdate: ""
	},
	
	published: {
		title: "",
		module: "",
		address: ""
	},
	
	components: [
		{name: "actionPopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			{value: "Play Now"}, {value: "Add to Queue"}
		]},
	
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Media Center", style: "margin-top: 0px;font-weight: bold;"},
				{kind: "Spacer", flex: 1},
				{kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-kbd.png", onclick: "toggleKeyboard"}			
			]},
			{name: "keyboardHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{name: "keyboardInput", kind: "ToolInput", alwaysLooksFocused: true, flex: 1, 
					inputClassName: "keyboard-input", autoCapitalize: "lowercase", autoWordComplete: false, style: "margin: -5px 10px -5px 0px;", onkeypress: "handleKeypress"},
				{kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-kbd.png", onclick: "toggleKeyboard"}
			]}			
		]}, 
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "playbackStatus", kind: "DividerDrawer", open: false, caption: "Playback", components: [
				{layoutKind: "VFlexLayout", pack: "center", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", components: [
						{name: "controlPlayback", kind: "Slider", flex: 1, onChanging: "updateSlider", onChange: "controlDevice", tapPosition: false, style: "margin: -15px 0px -10px 0px;"},
					]}
				]}
			]},
			{name: "volumeStatus", kind: "DividerDrawer", caption: "Volume", open: false, style: "margin-top: -5px;", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", components: [					
						{name: "controlVolume", kind: "Slider", flex: 1, onChanging: "updateSlider", onChange: "controlDevice", tapPosition: false, style: "margin: -15px 0px -10px 0px;"},
					]}
				]}
			]},
			{layoutKind: "VFlexLayout", flex: 1, pack: "center", components: [
				{layoutKind: "HFlexLayout", style: "max-width: 320px; margin: auto auto;", components: [	
					{name: "controlMute", kind: "ToolButton", className: "control-mute", icon: "./images/ctl-mute.png", onclick: "controlDevice"},				
					{layoutKind: "VFlexLayout", flex: 1, pack: "center", components: [
						{layoutKind: "VFlexLayout", pack: "center", style: "margin: -10px auto 5px auto;max-height: 150px; max-width: 150px;position:relative;", components: [
							{name: "controlOk", kind: "ToolButton", className: "control-ok", icon: "./images/ctl-ok.png", onclick: "controlDevice"},
							{name: "controlUp", kind: "ToolButton", className: "control-up", icon: "./images/ctl-up.png", onclick: "controlDevice"},
							{name: "controlLeft", kind: "ToolButton", className: "control-left", icon: "./images/ctl-left.png", onclick: "controlDevice"},
							{name: "controlRight", kind: "ToolButton", className: "control-right", icon: "./images/ctl-right.png", onclick: "controlDevice"},
							{name: "controlDown", kind: "ToolButton", className: "control-down", icon: "./images/ctl-down.png", onclick: "controlDevice"}
						]}
					]},
					{name: "controlBack", kind: "ToolButton", className: "control-back", icon: "./images/ctl-back.png", onclick: "controlDevice"}				
				]}
			]}
		]},
		{kind: "Toolbar", className: "enyo-toolbar-light", components: [
			{name: "controlPrev", kind: "ToolButton", icon: "./images/ctl-prev.png", style: "margin: -1px -6px -1px 0px;", onclick: "controlDevice"},
			{kind: "Spacer"},
			{name: "controlRwd", kind: "ToolButton", icon: "./images/ctl-rewind.png", style: "margin: -1px 0px -1px 0px;", onclick: "controlDevice"},
			{kind: "Spacer"},
			{name: "controlPlayPause", kind: "ToolButton", icon: "./images/ctl-playpause.png", style: "margin: -1px 0px -1px 0px;", onclick: "controlDevice"},
			{kind: "Spacer"},
			{name: "controlFwd", kind: "ToolButton", icon: "./images/ctl-forward.png", style: "margin: -1px 0px -1px 0px;", onclick: "controlDevice"},
			{kind: "Spacer"},
			{name: "controlNext", kind: "ToolButton", icon: "./images/ctl-next.png", style: "margin: -1px 0px -1px -6px;", onclick: "controlDevice"},
		]},
		
		{name: "serverRequest", kind: "WebService", onFailure: "handleServerError"}		
	],

	rendered: function() {
		this.inherited(arguments);

		this.$.keyboardHeader.hide();

		if(enyo.fetchDeviceInfo().modelNameAscii.toLowerCase() == "touchpad") {
			this.$.playbackStatus.toggleOpen();
			this.$.volumeStatus.toggleOpen();
		}

		this.updateStatus(true);
	},

	selected: function() {
		this.$.title.setContent(this.title);

		this.updateStatus(false);
	},
	
	updateStatus: function(poll) {
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/xbmcCmds/xbmcHttp?command=GetPercentage", 
			onSuccess: "handlePlaybackStatus"});

		if(poll)
			setTimeout(this.updateStatus.bind(this, true), 5000);	
	},
	
	updateSlider: function(inSender, inEvent) {
		if(inSender.name == "controlPlayback")
			this.$.playbackStatus.setCaption("Playback (" + this.$.controlPlayback.getPosition() + "%)");
		else if(inSender.name == "controlVolume")
			this.$.volumeStatus.setCaption("Volume (" + this.$.controlVolume.getPosition() + "%)");
	},
	
	toggleKeyboard: function() {
		if(this._keyboard) {
			this._keyboard = false;
		
			this.$.keyboardHeader.hide();
			this.$.normalHeader.show();
		} else {
			this._keyboard = true;
			
			this.$.normalHeader.hide();
			this.$.keyboardHeader.show();
			this.$.keyboardInput.forceFocus();
		}
	},	
	
	handleKeypress: function(inSender, inEvent) {
		this.$.keyboardInput.setValue("");

		var action = "SendKey(" + (61696 + inEvent.keyCode) + ")";		

		this.$.serverRequest.call({}, {url: "http://" + this.address + "/xbmcCmds/xbmcHttp?command=" + action, 
			onSuccess: "handleDeviceStatus"});		
	},
	
	controlDevice: function(inSender, inEvent) {
		if(inSender.name == "controlPlayPause")
			var action = "Pause";		
		else if(inSender.name == "controlNext")
			var action = "PlayNext";
		else if(inSender.name == "controlPrev")
			var action = "PlayPrev";
		else if(inSender.name == "controlFwd")
			var action = "SeekPercentageRelative(2)";
		else if(inSender.name == "controlRwd")
			var action = "SeekPercentageRelative(-2)";
		else if(inSender.name == "controlOk")
			var action = "SendKey(61453)";
		else if(inSender.name == "controlLeft")
			var action = "SendKey(272)";
		else if(inSender.name == "controlRight")
			var action = "SendKey(273)";
		else if(inSender.name == "controlUp")
			var action = "SendKey(270)";
		else if(inSender.name == "controlDown")
			var action = "SendKey(271)";
		else if(inSender.name == "controlMute")
			var action = "Mute";
		else if(inSender.name == "controlBack")
			var action = "SendKey(275)";
		else if(inSender.name == "controlPlayback") {
			this.$.playbackStatus.setCaption("Playback");
	
			var action = "SeekPercentage(" + this.$.controlPlayback.getPosition() + ")";
		} else if(inSender.name == "controlVolume") {
			this.$.volumeStatus.setCaption("Volume");

			var action = "SetVolume(" + this.$.controlVolume.getPosition() + ")";
		}
			
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/xbmcCmds/xbmcHttp?command=" + action, 
			onSuccess: "handleDeviceStatus"});
	},

	handleDeviceStatus: function(inSender, inResponse) {
		enyo.error("DEBUG: " + enyo.json.stringify(inResponse));
	
		if(inResponse) {
			this.doUpdate("online");
		} else
			this.doUpdate("offline");
	},	

	handlePlaybackStatus: function(inSender, inResponse) {
		if(inResponse) {
			this.doUpdate("online");

			this.$.serverRequest.call({}, {url: "http://" + this.address + "/xbmcCmds/xbmcHttp?command=GetVolume", 
				onSuccess: "handleVolumeStatus"});

			var position = inResponse.replace(/<.*?>/g, '');
			
			if(position != "Error")
				this.$.controlPayback.setPosition(position);
		} else
			this.doUpdate("offline");
	},

	handleVolumeStatus: function(inSender, inResponse) {
		if(inResponse) {
			var position = inResponse.replace(/<.*?>/g, '');
			
			if(position != "Error")
				this.$.controlVolume.setPosition(position);
		}
	},

	handleServerError: function(inSender, inResponse) {
		this.doUpdate("error");
	}
});

