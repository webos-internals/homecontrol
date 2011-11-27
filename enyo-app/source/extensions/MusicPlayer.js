//
// Status: state, *artist, *title, *repeat, *random, *(volume & mute)
//

enyo.kind({
	name: "MusicPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_state: "offline",
	_timeout: null,
	
//	_selected: 0,
//	_favorites: [],
	
	events: {
		onUpdate: ""
	},
	
	published: {
		title: "",
		module: "",
		address: ""
	},
	
	components: [
/*		{name: "actionPopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			{value: "Play Now"}, {value: "Add to Queue"}
		]},
		*/
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Music Player", style: "margin-top: 0px; font-weight: bold;"},
				{kind: "Spacer", flex: 1}
//				{name: "search", kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-search.png"}
			]}
		]},
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "musicStateInfo", kind: "DividerDrawer", caption: "Offline", open: true, components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", align: "center", style: "max-width: 290px; margin: -6px auto 0px auto;", components: [
						{name: "musicCurrentSong", content: "Not playing...", flex: 1, style: "font-weight: bold; font-size: 18px;"}
/*						{content: "--:--", className: "enyo-label", style: "color: gray;font-size: 12px;"}*/
					]}
				]}
			]},
			{/*name: "listDivider", */kind: "DividerDrawer", caption: "Favorites", open: true, style: "margin-top: -5px;"/*, 
				onOpenChanged: "toggleList"*/},
			{layoutKind: "VFlexLayout", flex: 1, style: "margin: 0px -2px 0px 10px; border-style: groove;", components: [
/*				{name: "favorites", kind: "VirtualList", flex: 1, onSetupRow: "setupFavorite", components: [
					{kind: "Item", tapHighlight: true, style: "margin: 0px;padding: 0px;", onclick: "selectAction", components: [
						{layoutKind: "HFlexLayout", flex: 1, align: "center", style: "margin: 0px;padding: 0px;", components: [
							{name: "favoriteName", content: "", flex: 1, style: "margin: 8px 5px;font-size: 14px;"},
							{name: "favoriteType", content: "", className: "enyo-label", style: "color: gray;font-size: 10px;margin: 0px 15px;"}
						]}
					]}
				]}*/
			]},
			{kind: "DividerDrawer", open: false, caption: "Controls", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{name: "musicRepeatRandom", layoutKind: "HFlexLayout", pack: "center", 
						style: "max-width: 290px; margin: -5px auto 8px auto;", components: [
						{name: "musicRepeatToggle", kind: "ToggleButton", onLabel: "Repeat", offLabel: "Repeat", 
							className: "control-repeat", style: "width: 70px;", onChange: "controlMusic"},
						{kind: "Spacer"},
						{name: "musicRandomToggle", kind: "ToggleButton", onLabel: "Shuffle", offLabel: "Shuffle", 
							className: "control-random", style: "width: 70px;", onChange: "controlMusic"}
					]},
					{name: "musicVolumeControls", layoutKind: "VFlexLayout", components: [
						{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", align: "center", components: [
							{content: "Volume:", flex: 1, style: "font-weight: bold;font-size: 18px;"},
							{name: "musicMuteToggle", kind: "ToggleButton", onLabel: "50", offLabel: "Mute", className: "control-mute", 
								style: "width: 70px;", onChange: "controlMusic"}
						]},
						{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", components: [
							{name: "musicVolumeSlider", kind: "Slider", tapPosition: false, flex: 1, 
								onChanging: "updateVolume", onChange: "controlMusic", style: "margin: -3px 0px -8px 0px;"}
						]}
					]}
				]}
			]}
		]},
		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
			{kind: "Spacer"},
			{name: "musicPrevSong", kind: "ToolButton", icon: "./images/ctl-prev.png", onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicPlayPause", kind: "ToolButton", icon: "./images/ctl-play.png", onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicNextSong", kind: "ToolButton", icon: "./images/ctl-next.png", onclick: "controlMusic"},
			{kind: "Spacer"}
		]},
		
		{name: "serverRequest", kind: "WebService", onSuccess: "updateStatus", onFailure: "unknownError"}
	],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.checkStatus();
	},
	
	selected: function(visible) {
		this.$.title.setContent(this.title);
		
		if(visible)
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/start"});
	},
	
	checkStatus: function() {
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status"});
		
		this._timeout = setTimeout(this.checkStatus.bind(this, true), 5000);	
	},
/*	
	toggleList: function(inSender) {
		this.$.listDivider.open();
	},
	
	setupFavorite: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._favorites.length)) {
			this.$.favoriteName.setContent(this._favorites[inIndex].name);
			this.$.favoriteType.setContent(this._favorites[inIndex].type);
			
			return true;
		}
	},
	
	selectAction: function(inSender, inEvent) {
		this._selected = inEvent.rowIndex;
		
		this.$.actionPopup.openAtEvent(inEvent);
	},
	
	executeAction: function(inSender, inSelected) {
		if(inSelected.getValue() == "Play Now") {
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/url?url=" + this._favorites[this._selected].url, 
				});
		} else if(inSelected.getValue() == "Add to Queue") {
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/queue?url=" + this._favorites[this._selected].url, 
				});
		}		
	}, */
	
	updateVolume: function(inSender, inEvent) {
		this.$.musicMuteToggle.setOnLabel(this.$.musicVolumeSlider.getPosition());
	},
	
	controlMusic: function(inSender, inEvent) {
		var action = "status";
		
		if(inSender.name == "musicPlayPause") {
			if(this._state == "playing")
				action = "pause";
			else
				action = "play";
		} else if(inSender.name == "musicNextSong")
			action = "next";
		else if(inSender.name == "musicPrevSong")
			action = "prev";
		else if(inSender.name == "musicRepeatToggle")
			action = "repeat?state=" + this.$.musicRepeatToggle.getState();
		else if(inSender.name == "musicRandomToggle")
			action = "random?state=" + this.$.musicRandomToggle.getState();
		else if(inSender.name == "musicMuteToggle") {
			if(!this.$.musicMuteToggle.getState())
				action = "mute?state=true";
			else
				action = "mute?state=false";
		} else if(inSender.name == "musicVolumeSlider")
			action = "volume?value=" + this.$.musicVolumeSlider.getPosition();
		
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/" + action});	
	},
	
	updateStatus: function(inSender, inResponse) {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
		
		if((inResponse) && (inResponse.state)) {
			this._state = inResponse.state;
			
			this.doUpdate(inResponse.state);
			
			if(inResponse.state == "playing") {
				this.$.musicStateInfo.setCaption("Playing");
				
				this.$.musicPlayPause.setIcon("./images/ctl-pause.png");
				
				if(!inResponse.title)
					this.$.musicCurrentSong.setContent("Unknown Song");
				else if(!inResponse.artist)
					this.$.musicCurrentSong.setContent(unescape(inResponse.title));
				else
					this.$.musicCurrentSong.setContent(unescape(inResponse.artist) + " - " + unescape(inResponse.title));
			} else if(inResponse.state == "paused") {
				this.$.musicStateInfo.setCaption("Paused");
				
				this.$.musicPlayPause.setIcon("./images/ctl-play.png");
				
				if(!inResponse.title)
					this.$.musicCurrentSong.setContent("Unknown Song");
				else if(!inResponse.artist)
					this.$.musicCurrentSong.setContent(unescape(inResponse.title));
				else
					this.$.musicCurrentSong.setContent(unescape(inResponse.artist) + " - " + unescape(inResponse.title));
			} else if(inResponse.state == "stopped") {
				this.$.musicStateInfo.setCaption("Stopped");
				
				this.$.musicPlayPause.setIcon("./images/ctl-play.png");
								
				this.$.musicCurrentSong.setContent("Not playing...");
			} else {
				this.$.musicStateInfo.hide();
				
				this.$.musicPlayPause.setIcon("./images/ctl-playpause.png");
			}
			
			if(inResponse.repeat != undefined)
				this.$.musicRepeatToggle.setState(inResponse.repeat);
			else
				this.$.musicRepeatRandom.hide();
			
			if(inResponse.random != undefined)
				this.$.musicRandomToggle.setState(inResponse.random);
			else
				this.$.musicRepeatRandom.hide();
			
			if(inResponse.volume != undefined) {
				this._volume = inResponse.volume;
				
				this.$.musicMuteToggle.setOnLabel(inResponse.volume);
				
				this.$.musicVolumeSlider.setPosition(inResponse.volume);
				
				if(inResponse.mute == true)
					this.$.musicMuteToggle.setState(false);
				else
					this.$.musicMuteToggle.setState(true);
			} else {
				this.$.musicVolumeControls.hide();
			}
/*			
			if(inResponse.favorites) {
				this._favorites = inResponse.favorites;
				
				this.$.favorites.refresh();
			} */
		} else {
			this.doUpdate("offline");
			
			this.$.musicStateInfo.setCaption("Offline");
		}
	},
	
	unknownError: function() {
		enyo.error("DEBUG - " + enyo.json.stringify(inResponse));
		
		this.doUpdate("error");
		
		this.$.musicStateInfo.setCaption("Error");
	}	
});

