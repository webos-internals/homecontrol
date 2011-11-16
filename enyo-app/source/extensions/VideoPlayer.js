enyo.kind({
	name: "VideoPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_volume: 0,
	
	events: {
		onUpdate: ""
	},
	
	published: {
		title:"",
		module: "",
		address: ""
	},
	
	components: [
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Video Player", style: "margin-top: 0px;font-weight: bold;"},
				{kind: "Spacer", flex: 1},
				{name: "search", kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-search.png"}			
			]}
		]}, 
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "videoInfo", kind: "DividerDrawer", caption: "Stopped", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 0px 15px;", components: [
					{layoutKind: "HFlexLayout", align: "center", style: "max-width: 290px; margin: -6px auto 4px auto;", components: [
						{name: "currentVideo", content: "Not playing...", flex: 1, style: "font-weight: bold;font-size: 18px;"},
						{content: "--:--", className: "enyo-label", style: "color: gray;font-size: 12px;"}
					]}
				]}
			]},
			{kind: "DividerDrawer", caption: "History", style: "margin-top: -8px;", },
			{layoutKind: "VFlexLayout", flex: 1, style: "margin: 0px -2px 0px 10px;border-style: groove;", components: [
				{kind: "Scroller", flex: 1, components: [
					{kind: "Item", tapHighlight: true, style: "margin: 0px;padding: 0px;", components: [
						{layoutKind: "HFlexLayout", flex: 1, align: "center", style: "margin: 0px;padding: 0px;", components: [
							{content: "", flex: 1, style: "margin: 8px 5px;font-size: 14px;"},
							{content: "", className: "enyo-label", style: "color: gray;font-size: 10px;margin: 0px 15px;"}
						]}
					]}
				]},
			]},
			{kind: "DividerDrawer", open: false, caption: "Controls", components: [
				{name: "controlsVLC", layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", pack: "center", style: "max-width: 290px;margin: -1px auto 12px auto;", components: [
						{name: "videoFullscreen", kind: "Button", caption: "Toggle Fullscreen", flex: 1, className: "enyo-button-dark", style: "margin: -3px 0px -3px 0px;", onclick: "controlVideo"},
					]},
					{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: -1px auto 3px auto;", align: "center", components: [
						{content: "Volume:", flex: 1, style: "font-weight: bold;font-size: 18px;"},
						{name: "muteToggle", kind: "ToggleButton", onLabel: "50", offLabel: "Mute", className: "control-mute", style: "width: 70px;", onChange: "controlVideo"}
					]},
					{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", components: [					
						{name: "volumeSlider", kind: "Slider", onChanging: "updateVolume", onChange: "controlVideo", tapPosition: false, flex: 1, style: "margin: -6px 0px -6px 0px;"}
					]}
				]},
				{name: "controlsOther", layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", pack: "center", style: "max-width: 290px;margin: 0px auto 12px auto;", components: [
						{name: "videoSize", kind: "Button", caption: "Fullscreen", flex: 1, className: "enyo-button-dark", style: "margin: 0px 5px -8px 0px;", onclick: "controlVideo"},
						{name: "videoMute", kind: "Button", caption: "Mute", flex: 1, className: "enyo-button-dark",style: "margin: 0px 0px -8px 5px;", onclick: "controlVideo"}
					]},
					{layoutKind: "HFlexLayout", pack: "center", style: "max-width: 290px;margin: 10px auto 6px auto;", components: [
						{content: "Volume:", flex: 1, style: "font-weight: bold;padding-left:2px;font-size: 18px;padding-top: 4px;"},
						{layoutKind: "HFlexLayout", flex: 1, style: "padding-left: 10px", components: [
							{name: "videoVolDown", kind: "Button", caption: "-", flex: 1, className: "enyo-button-dark",style: "margin: 0px -1px;", onclick: "controlVideo"},
							{kind: "Spacer"},
							{name: "videoVolUp", kind: "Button", caption: "+", flex: 1, className: "enyo-button-dark",style: "margin: 0px -1px;", onclick: "controlVideo"}
						]}
					]},					
				]}
			]}
		]},
		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
			{kind: "Spacer"},
			{name: "videoRewind", kind: "ToolButton", icon: "./images/ctl-rewind.png", onclick: "controlVideo"},
			{kind: "Spacer"},
			{name: "videoPlayPause", kind: "ToolButton", icon: "./images/ctl-playpause.png", onclick: "controlVideo"},
			{kind: "Spacer"},
			{name: "videoForward", kind: "ToolButton", icon: "./images/ctl-forward.png", onclick: "controlVideo"},
			{kind: "Spacer"}
		]},
		
		{name: "serverRequest", kind: "WebService", onFailure: "handleServerError"}		
	],

	rendered: function() {
		this.inherited(arguments);
		
		if(this.module != "vlc") {
			this.$.videoInfo.hide();
			this.$.controlsVLC.hide();
		} else
			this.$.controlsOther.hide();
		
		this.updateStatus(true);
	},
	
	selected: function() {
		this.$.search.hide();
	
		this.$.title.setContent(this.title);

		this.updateStatus(false);
	},

	updateStatus: function(poll) {
		if(this.module == "vlc")	
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml", onSuccess: "handleVideoStatus"});
		else
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status", onSuccess: "handleVideoStatus"});

		if(poll)
			setTimeout(this.updateStatus.bind(this, true), 5000);	
	},

	updateVolume: function(inSender, inEvent) {
		this.$.muteToggle.setOnLabel(this.$.volumeSlider.getPosition());
	},
		
	controlVideo: function(inSender, inEvent) {
		var action = "status";

		if(this.module == "vlc") {
			if(inSender.name == "videoPlayPause") {
				action = "pl_pause";
			} else if(inSender.name == "videoRewind") {
				action = "seek&val=-1M";
			} else if(inSender.name == "videoForward") {
				action = "seek&val=+1M";
			} else if(inSender.name == "videoFullscreen") {
				action = "fullscreen";
			} else if(inSender.name == "muteToggle") {
				if(this.$.muteToggle.getState())
					action = "volume&val=" + (this._volume * 256 / 100);	
				else
					action = "volume&val=0";	
			} else if(inSender.name == "volumeSlider") {
				action = "volume&val=" + (this.$.volumeSlider.getPosition() * 256 / 100);	
			}

			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml?command=" + action});

			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml", 
				onSuccess: "handleVideoStatus"});
		} else {
			if(inSender.name == "videoPlayPause") {
				action = "play-pause";
			} else if(inSender.name == "videoRewind") {
				action = "seek-bwd";
			} else if(inSender.name == "videoForward") {
				action = "seek-fwd";
			} else if(inSender.name == "videoSize") {
				action = "fullscreen";
			} else if(inSender.name == "videoMute") {
				action = "mute";
			} else if(inSender.name == "videoVolUp") {
				action = "volume?volume=up";
			} else if(inSender.name == "videoVolDown") {
				action = "volume?volume=down";
			}
	
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/" + action, 
				onSuccess: "handleVideoStatus"});	
		}		
	},
	
	handleVideoStatus: function(inSender, inResponse) {
		enyo.error("DEBUG: " + enyo.json.stringify(inResponse));

		if(inResponse) {
			if(this.module == "vlc") {
				var regexp = new RegExp("<state>([\\s\\S]*?)<\\/state>");

				var state = regexp.exec(inResponse);

				if(state.length > 0) {
					this.doUpdate(state[1]);
					
					this.$.videoInfo.setCaption(enyo.cap(state[1]));
					
					var regexp = new RegExp("<info name='title'>([\\s\\S]*?)<\\/info>");

					var info = regexp.exec(inResponse);

					if(info.length > 0)
						this.$.currentVideo.setContent(info[1]);
					else
						this.$.currentVideo.setContent("Unknown Video");
				} else
					this.doUpdate("offline");
			
				var regexp = new RegExp("<volume>([\\s\\S]*?)<\\/volume>");

				var volume = regexp.exec(inResponse);
				
				if((volume.length < 2) || (volume[1] == 0)) {
					this.$.muteToggle.setOnLabel("0");

					this.$.muteToggle.setState(false);
					this.$.volumeSlider.setPosition(0);
				} else {
					this._volume = Math.round(volume[1] / 256 * 100);
			
					this.$.muteToggle.setOnLabel(this._volume);

					this.$.muteToggle.setState(true);
					this.$.volumeSlider.setPosition(this._volume);
				}
			} else {
				this.doUpdate(inResponse.status);		
			}
		} else
			this.doUpdate("offline");
	},

	handleServerError: function() {
		this.doUpdate("error");
	}		
});

