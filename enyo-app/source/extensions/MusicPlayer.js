//
// Status: state, *artist, *title, *repeat, *random, *(volume & mute)
//

enyo.kind({
	name: "MusicPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_list: "queue",
	_state: "offline",
	
	_timeout: null,
	_keyboard: false,
	_selected: 0,
	
	_queue: [],
	_results: [],
	_playlists: [],

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
		{name: "queuePopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			/*{value: "Play This Song Now"},*/ {value: "Remove from Queue"}
		]},

		{name: "playlistsPopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			{value: "Select This Playlist"} /*, {value: "Load Songs to Queue"}*/
		]},

		{name: "resultsPopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			{value: "Play Song Now"} , {value: "Add Song to Queue"}
		]},
		
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Music Player", style: "margin-top: 0px; font-weight: bold;"},
				{kind: "Spacer", flex: 1},
				{name: "search", kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-search.png",
					onclick: "toggleKeyboard"}
			]},
			{name: "keyboardHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{name: "keyboardInput", kind: "ToolInput", alwaysLooksFocused: true, flex: 1, 
					inputClassName: "keyboard-input", autoCapitalize: "lowercase", autoWordComplete: false, 
						style: "margin: -5px 10px -5px 0px;", onchange: "searchMusic"},
				{kind: "ToolButton", style: "margin: -13px -10px;", icon: "./images/button-kbd.png", onclick: "toggleKeyboard"}
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
			{name: "musicListDivider", kind: "DividerDrawer", caption: "Play Queue", open: true, style: "margin-top: -5px;", 
				onOpenChanged: "toggleList"},
			{layoutKind: "VFlexLayout", flex: 1, style: "margin: 0px -2px 0px 10px; border-style: groove;", components: [
				{name: "musicListView", kind: "VirtualList", flex: 1, onSetupRow: "setupListItem", components: [
					{kind: "Item", tapHighlight: true, style: "margin: 0px;padding: 0px;", onclick: "selectAction", components: [
						{layoutKind: "HFlexLayout", flex: 1, align: "center", style: "margin: 0px;padding: 0px;", components: [
							{name: "listItemName", content: "", flex: 1, style: "margin: 8px 5px;font-size: 14px;"}
							
//							{name: "listItemType", content: "", className: "enyo-label", style: "color: gray;font-size: 10px;margin: 0px 15px;"}
						]}
					]}
				]}
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
		
		this.$.keyboardHeader.hide();
		
		this.checkStatus();
	},
	
	selected: function(visible) {
		this.$.title.setContent(this.title);
		
		if(visible)
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/start"});
	},
	
	checkStatus: function() {
		if(this._list == "queue")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/playqueue/list?action=info"});
		else if(this._list == "playlists")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/playlists/list?id=*"});
		else
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status"});
		
		this._timeout = setTimeout(this.checkStatus.bind(this), 5000);	
	},

	toggleList: function(inSender) {
		if(!this.$.musicListDivider.open) {
			if(this._list == "queue") {
				this._list = "playlists";
			
				this.$.musicListDivider.setCaption("Playlists");
			} else {
				this._list = "queue";
			
				this.$.musicListDivider.setCaption("Play Queue");
			}
			
			this.$.musicListView.refresh();
		}
	},

	toggleKeyboard: function() {
		if(this._keyboard) {
			this._keyboard = false;
			
			this.$.keyboardHeader.hide();
			this.$.normalHeader.show();

			if(this._list == "results") {
				this._list = "queue";
		
				this.$.musicListDivider.setCaption("Play Queue");
			}
		} else {
			this._keyboard = true;
			
			this.$.normalHeader.hide();
			this.$.keyboardHeader.show();
			this.$.keyboardInput.forceFocus();

			if(this._list != "results") {
				this._list = "results";
			
				this.$.musicListDivider.setCaption("Search Results");
			}
		}

		this.$.musicListView.refresh();
	},	
	
	setupListItem: function(inSender, inIndex) {
		if((this._list == "queue") && 
			(inIndex >= 0) && (inIndex < this._queue.length))
		{
			var song = this._queue[inIndex].artist + " - " + this._queue[inIndex].title;
		
			this.$.listItemName.setContent(song);
			
			return true;
		} else if((this._list == "playlists") && 
			(inIndex >= 0) && (inIndex < this._playlists.length))
		{
			var playlist = this._playlists[inIndex].name;
		
			this.$.listItemName.setContent(playlist);
			
			return true;
		} else if((this._list == "results") && 
			(inIndex >= 0) && (inIndex < this._results.length))
		{
			var song = this._results[inIndex].artist + " - " + this._results[inIndex].title;
		
			this.$.listItemName.setContent(song);
			
			return true;
		} else
			this.$.musicListDivider.setOpen(true);
	},
	
	selectAction: function(inSender, inEvent) {
		if(this.$.musicListDivider.open) {
			this._selected = inEvent.rowIndex;
		
			this.$[this._list + "Popup"].openAtEvent(inEvent);
		}
	},
	
	executeAction: function(inSender, inSelected) {
		if(this._list == "queue") {
			if(inSelected.getValue() == "Remove from Queue") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/remove?id=" + this._queue[this._selected].id});

				this._queue.splice(this._selected, 1);
				
				this.$.musicListView.refresh();
			}
		} else if(this._list == "playlists") {
			if(inSelected.getValue() == "Select This Playlist") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playlists/select?id=" + this._playlists[this._selected].name});
			}
		} else if(this._list == "results") {
			if(inSelected.getValue() == "Play Song Now") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/library/select?id=" + this._results[this._selected].id});
			} else if(inSelected.getValue() == "Add Song to Queue") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/append?id=" + this._results[this._selected].id});
			}
		}
	}, 
	
	updateVolume: function(inSender, inEvent) {
		this.$.musicMuteToggle.setOnLabel(this.$.musicVolumeSlider.getPosition());
	},
	
	searchMusic: function() {
		var text = this.$.keyboardInput.getValue();

		this._results = [];

		this._list = "results";
			
		this.$.musicListDivider.setCaption("Search Results");

		this.$.musicListView.refresh();

	
		if(text.length > 0)
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/library/search?filter=" + text});			
	},
	
	controlMusic: function(inSender, inEvent) {
		var action = "status";
		
		if(inSender.name == "musicPlayPause") {
			if(this._state == "playing")
				action = "playback/state?action=pause";
			else
				action = "playback/state?action=play";
		} else if(inSender.name == "musicNextSong")
			action = "playback/song?action=next";
		else if(inSender.name == "musicPrevSong")
			action = "playback/song?action=prev";
		else if(inSender.name == "musicRepeatToggle")
			action = "playmode/repeat?state=" + this.$.musicRepeatToggle.getState();
		else if(inSender.name == "musicRandomToggle")
			action = "playmode/random?state=" + this.$.musicRandomToggle.getState();
		else if(inSender.name == "musicMuteToggle") {
			if(!this.$.musicMuteToggle.getState())
				action = "output/mute?state=true";
			else
				action = "output/mute?state=false";
		} else if(inSender.name == "musicVolumeSlider")
			action = "output/volume?level=" + this.$.musicVolumeSlider.getPosition();
		
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

			if(inResponse.queue != undefined) {
				this._queue = inResponse.queue;
				
				if(this._list == "queue")
					this.$.musicListView.refresh();
			}

			if(inResponse.playlists != undefined) {
				this._playlists = inResponse.playlists;
				
				if(this._list == "playlists")
					this.$.musicListView.refresh();
			}

			if(inResponse.results != undefined) {
				this._results = inResponse.results;
				
				if(this._list == "results")
					this.$.musicListView.refresh();
			}
			
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

