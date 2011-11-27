//
// Status: state, *title, *fullscreen, *(volume & mute)
//

enyo.kind({
	name: "VideoPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_state: "stopped",
	_volume: 0,
	_timeout: null,
	
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
				{name: "title", content: "Video Player", style: "margin-top: 0px; font-weight: bold;"},
				{kind: "Spacer", flex: 1}
//				{name: "search", kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-search.png"}			
			]}
		]},
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "videoStateInfo", kind: "DividerDrawer", caption: "Offline", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", align: "center", style: "max-width: 290px; margin: -6px auto 0px auto;", components: [
						{name: "videoCurrentVideo", content: "Not playing...", flex: 1, style: "font-weight: bold; font-size: 18px;"}
//						{content: "--:--", className: "enyo-label", style: "color: gray;font-size: 12px;"}
					]}
				]}
			]},
			{kind: "DividerDrawer", caption: "History", open: true, style: "margin-top: -5px;", },
			{layoutKind: "VFlexLayout", flex: 1, style: "margin: 0px -2px 0px 10px; border-style: groove;", components: [
/*				{kind: "Scroller", flex: 1, components: [
					{kind: "Item", tapHighlight: true, style: "margin: 0px;padding: 0px;", components: [
						{layoutKind: "HFlexLayout", flex: 1, align: "center", style: "margin: 0px;padding: 0px;", components: [
							{content: "", flex: 1, style: "margin: 8px 5px;font-size: 14px;"},
							{content: "", className: "enyo-label", style: "color: gray;font-size: 10px;margin: 0px 15px;"}
						]}
					]}
				]}*/
			]},
			{kind: "DividerDrawer", open: false, caption: "Controls", components: [
				{name: "videoButtonControls", layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", style: "max-width: 290px; margin: -3px auto 12px auto;", components: [
						{name: "videoToggleSize", kind: "Button", caption: "Fullscreen", flex: 1, 
							className: "control-key enyo-button-dark", style: "margin: 0px 0px -4px 0px;", onclick: "controlVideo"},
						{name: "videoToggleSeparator", kind: "Spacer", style: "max-width: 10px;"},
						{name: "videoToggleMute", kind: "Button", caption: "Mute", flex: 1, 
							className: "control-key enyo-button-dark", style: "margin: 0px 0px -4px 0px;", onclick: "controlVideo"}
					]},
					{name: "videoVolBtnControls", layoutKind: "VFlexLayout", components: [
						{layoutKind: "HFlexLayout", pack: "center", style: "max-width: 290px; margin: 5px auto 8px auto;", components: [
							{content: "Volume:", flex: 1, style: "font-weight: bold; padding: 2px 2px 0px 0px; font-size: 18px;"},
							{layoutKind: "HFlexLayout", flex: 1, style: "padding-left: 10px", components: [
								{name: "videoVolumeDown", kind: "Button", caption: "-", flex: 1, 
									className: "control-key enyo-button-dark", style: "margin: 0px -1px;", onclick: "controlVideo"},
								{kind: "Spacer"},
								{name: "videoVolumeUp", kind: "Button", caption: "+", flex: 1, 
									className: "control-key enyo-button-dark", style: "margin: 0px -1px;", onclick: "controlVideo"}
							]}
						]}
					]},
					{name: "videoVolumeControls", layoutKind: "VFlexLayout", components: [
						{layoutKind: "HFlexLayout", style: "max-width: 290px; margin: auto auto;", align: "center", components: [
							{content: "Volume:", flex: 1, style: "font-weight: bold; font-size: 18px;"},
							{name: "videoMuteToggle", kind: "ToggleButton", onLabel: "50", offLabel: "Mute", className: "control-mute", 
								style: "width: 70px;", onChange: "controlVideo"}
						]},
						{layoutKind: "HFlexLayout", style: "max-width: 290px; margin: auto auto;", components: [
							{name: "videoVolumeSlider", kind: "Slider", tapPosition: false, flex: 1, 
								onChanging: "updateVolume", onChange: "controlVideo", style: "margin: -3px 0px -8px 0px;"}
						]}
					]}
				]}
			]}
		]},
		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
			{kind: "Spacer"},
			{name: "videoSeekBwd", kind: "ToolButton", icon: "./images/ctl-rewind.png", onclick: "controlVideo"},
			{kind: "Spacer"},
			{name: "videoPlayPause", kind: "ToolButton", icon: "./images/ctl-play.png", onclick: "controlVideo"},
			{kind: "Spacer"},
			{name: "videoSeekFwd", kind: "ToolButton", icon: "./images/ctl-forward.png", onclick: "controlVideo"},
			{kind: "Spacer"}
		]},
		
		{name: "serverRequest", kind: "WebService", onSuccess: "updateStatus", onFailure: "unknownError"}
	],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.$.videoVolBtnControls.hide();
		
		this.$.videoToggleMute.hide();
		this.$.videoToggleSeparator.hide();
		
		this.$.videoToggleSize.setCaption("Toggle Fullscreen");
		
		this.checkStatus();
	},
	
	selected: function(visible) {
		this.$.title.setContent(this.title);
		
		if(visible) {
			if(this.module == "vlc")
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml"});
			else
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/start"});
		}
	},
	
	checkStatus: function() {
		if(this.module == "vlc")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml"});
		else
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status"});
		
		this._timeout = setTimeout(this.checkStatus.bind(this, true), 5000);	
	},
	
	updateVolume: function(inSender, inEvent) {
		this.$.videoMuteToggle.setOnLabel(this.$.videoVolumeSlider.getPosition());
	},
	
	controlVideo: function(inSender, inEvent) {
		var action = "status";
		
		if(this.module == "vlc") {
			if(inSender.name == "videoPlayPause") {
				action = "pl_pause";
			} else if(inSender.name == "videoSeekBwd") {
				action = "seek&val=-1M";
			} else if(inSender.name == "videoSeekFwd") {
				action = "seek&val=+1M";
			} else if(inSender.name == "videoToggleSize") {
				action = "fullscreen";
			} else if(inSender.name == "videoMuteToggle") {
				if(!this.$.videoMuteToggle.getState())
					action = "volume&val=0";
				else
					action = "volume&val=" + (this._volume * 256 / 100);
			} else if(inSender.name == "videoVolumeSlider") {
				action = "volume&val=" + (this.$.videoVolumeSlider.getPosition() * 256 / 100);
			}
			
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml?command=" + action, 
				onSuccess: "doNothing"});
			
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/requests/status.xml"});
		} else {
			if(inSender.name == "videoPlayPause") {
				if(this._state == "running")
					action = "play-pause";
				else if(this._state == "playing")
					action = "pause";
				else
					action = "play";
			} else if(inSender.name == "videoSeekBwd")
				action = "seek?action=bwd";
			else if(inSender.name == "videoSeekFwd")
				action = "seek?action=fwd";
			else if(inSender.name == "videoToggleSize")
				action = "fullscreen";
			else if(inSender.name == "videoToggleMute")
				action = "mute";
			else if(inSender.name == "videoMuteToggle") {
				if(!this.$.videoMuteToggle.getState())
					action = "mute?state=true";
				else
					action = "mute?state=false";
			} else if(inSender.name == "videoVolumeUp")
				action = "volume?action=up";
			else if(inSender.name == "videoVolumeDown")
				action = "volume?action=down";
			else if(inSender.name == "videoVolumeSlider")
				action = "volume?value=" + this.$.videoVolumeSlider.getPosition();
			
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/" + action});	
		}
	},
	
	updateStatus: function(inSender, inResponse) {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
		
		if((inResponse) && ((inResponse.state) || (this.module == "vlc"))) {
			if(this.module == "vlc") {
				var regexp = new RegExp("<state>([\\s\\S]*?)<\\/state>");
				
				var state = regexp.exec(inResponse);
				
				if(state.length > 0) {
					this._state = state[1].replace("stop", "stopped");
					
					this.doUpdate(state[1].replace("stop", "stopped"));
					
					this.$.videoPlayPause.setIcon("./images/ctl-playpause.png");
					
					this.$.videoStateInfo.setCaption(enyo.cap(state[1].replace("stop", "stopped")));
					
					if(state[1] != "stop") {
						var regexp = new RegExp('<title><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/title>');
					
						var info = regexp.exec(inResponse);
					
						if((info) && (info.length > 0))
							this.$.videoCurrentVideo.setContent(info[1]);
						else
							this.$.videoCurrentVideo.setContent("Unknown Video");
					}
				} else
					this.doUpdate("offline");
				
				var regexp = new RegExp("<volume>([\\s\\S]*?)<\\/volume>");
				
				var volume = regexp.exec(inResponse);
				
				if((volume.length < 2) || (volume[1] == 0)) {
					this.$.videoMuteToggle.setOnLabel("0");
					
					this.$.videoMuteToggle.setState(false);
					this.$.videoVolumeSlider.setPosition(0);
				} else {
					this._volume = Math.round(volume[1] / 256 * 100);
					
					this.$.videoMuteToggle.setOnLabel(this._volume);
					
					this.$.videoMuteToggle.setState(true);
					this.$.videoVolumeSlider.setPosition(this._volume);
				}
			} else {
				this._state = inResponse.state;
				
				this.doUpdate(inResponse.state);
				
				this.$.videoStateInfo.setCaption(enyo.cap(inResponse.state));
				
				if(inResponse.state == "running") {
					this.$.videoStateInfo.hide();
					
					this.$.videoPlayPause.setIcon("./images/ctl-playpause.png");
				} else if(inResponse.state == "playing") {
					this.$.videoPlayPause.setIcon("./images/ctl-pause.png");
				} else if(inResponse.state == "paused") {
					this.$.videoPlayPause.setIcon("./images/ctl-play.png");
				}
				
				if(inResponse.title)
					this.$.videoCurrentVideo.setContent(inResponse.title);
				else
					this.$.videoCurrentVideo.setContent("Unknown Video");
				
				if(inResponse.volume != undefined) {
					this.$.videoMuteToggle.setOnLabel(inResponse.volume);
					
					this.$.videoVolumeSlider.setPosition(inResponse.volume);
					
					if(inResponse.mute == true)
						this.$.videoMuteToggle.setState(false);
					else
						this.$.videoMuteToggle.setState(true);
				} else {
					this.$.videoVolBtnControls.show();
					this.$.videoVolumeControls.hide();
					
					this.$.videoToggleMute.show();
					this.$.videoToggleSeparator.show();
					
					this.$.videoToggleSize.setCaption("Fullscreen");
				}
			}
		} else {
			this.doUpdate("offline");
			
			this.$.videoStateInfo.setCaption("Offline");			
		}
	},

	unknownError: function() {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
		
		this.doUpdate("error");
		
		this.$.videoStateInfo.setCaption("Error");
	}		
});

