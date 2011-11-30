//
// Status: state, *artist, *title, *repeat, *random, *(volume & mute)
//

enyo.kind({
	name: "MusicPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_list: null,
	_state: "offline",
	
	_timeout: null,
	_opening: false,
	_keyboard: false,
	
	_clicked: 0,
	_playing: 0,
	
	_queue: null,
	_current: null,
	_selected: null,
	_results: null,
	_playlists: null,
	
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
			{value: "Play This Song"}, {value: "Remove from Queue"}
		]},

		{name: "currentPopup", kind: "PopupSelect", onSelect: "executeAction", items: [
			{value: "Play This Song"} /*, {value: "Load Songs to Queue"}*/
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
			{name: "musicListViews", layoutKind: "VFlexLayout", flex: 1, style: "margin: 0px -2px 0px 10px; border-style: groove;", components: [
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
								onChanging: "updateVolume", onChange: "controlMusic", style: "margin: -4px 0px -9px 0px;"}
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
		
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status?refresh=true"});

		this._timeout = setTimeout(this.checkStatus.bind(this), 5000);
	},
	
	selected: function(visible) {
		this.$.title.setContent(this.title);
		
		if(visible)
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/start?refresh=true"});
	},
	
	checkStatus: function() {
		if(this._list == "queue")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/playqueue/list?action=info"});
		else if(this._list == "current")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/playlists/list?id=current"});
		else if(this._list == "playlists")
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/playlists/list?id=*"});
		else
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status?refresh=false"});
		
		if(this._timeout)
			clearTimeout(this._timeout);
		
		this._timeout = setTimeout(this.checkStatus.bind(this), 5000);
	},

	toggleList: function(inSender) {
		if(this._opening) {
			this._opening = false;
				
			return;
		}

		if(!this.$.musicListDivider.open) {
			if((this._list == "queue") && (this._playlists)) {
				this._list = "playlists";
			
				this.$.musicListDivider.setCaption(this._playlists.name);
			} else if((this._list == "current") && (this._playlists)) {
				this._list = "playlists";
			
				this.$.musicListDivider.setCaption(this._playlists.name);
			} else if((this._keyboard) && (this._results) && (this._list != "results")) {
				this._list = "results";
			
				this.$.musicListDivider.setCaption("Search Results");
			} else if(this._queue) {
				this._list = "queue";
				
				this.$.musicListDivider.setCaption(this._queue.name);
			} else if(this._current) {
				this._list = "current";
				
				this.$.musicListDivider.setCaption(this._current.name);
			}
			
			this.$.musicListView.refresh();
			
			this.checkStatus();
		} else {
			this._opening = true;

			this.$.musicListDivider.setOpen(false);
		}		
	},

	toggleKeyboard: function() {
		if(this._keyboard) {
			this._keyboard = false;
			
			this.$.keyboardHeader.hide();
			this.$.normalHeader.show();

			if(this._list == "results") {
				if(this._queue) {
					this._list = "queue";
		
					this.$.musicListDivider.setCaption(this._queue.name);
				} else if(this._current) {
					this._list = "current";
		
					this.$.musicListDivider.setCaption(this._current.name);
				}
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
		if((this._list == "queue") && (this._queue) && (this._queue.items) && 
			(inIndex >= 0) && (inIndex < this._queue.items.length))
		{
			if(this._queue.items[inIndex].artist)
				var song = this._queue.items[inIndex].artist + " - " + this._queue.items[inIndex].title;
			else
				var song = this._queue.items[inIndex].title;
		
			if(this._queue.items[inIndex].id == this._playing)
				this.$.listItemName.applyStyle("font-weight", "bold");
			else
				this.$.listItemName.applyStyle("font-weight", "normal");
		
			this.$.listItemName.setContent(song);
			
			return true;
		} else if((this._list == "current") && (this._current) && (this._current.items) &&
			(inIndex >= 0) && (inIndex < this._current.items.length))
		{
			if(this._current.items[inIndex].artist)
				var song = this._current.items[inIndex].artist + " - " + this._current.items[inIndex].title;
			else
				var song = this._current.items[inIndex].title;
		
			if(this._current.items[inIndex].id == this._playing)
				this.$.listItemName.applyStyle("font-weight", "bold");
			else
				this.$.listItemName.applyStyle("font-weight", "normal");
		
			this.$.listItemName.setContent(song);
			
			return true;
		} else if((this._list == "playlists") && (this._playlists) && (this._playlists.items) &&
			(inIndex >= 0) && (inIndex < this._playlists.items.length))
		{
			var playlist = this._playlists.items[inIndex].name;
		
			this.$.listItemName.applyStyle("font-weight", "normal");		
		
			this.$.listItemName.setContent(playlist);
			
			return true;
		} else if((this._list == "results") && (this._results) &&
			(inIndex >= 0) && (inIndex < this._results.length))
		{
			var song = this._results[inIndex].artist + " - " + this._results[inIndex].title;

			this.$.listItemName.applyStyle("font-weight", "normal");
		
			this.$.listItemName.setContent(song);
			
			return true;
		}
	},
	
	selectAction: function(inSender, inEvent) {
		if(this.$.musicListDivider.open) {
			this._clicked = inEvent.rowIndex;
		
			if((this._list == "results") && (!this._queue))
				this.$.resultsPopup.items.splice(1);
		
			this.$[this._list + "Popup"].openAtEvent(inEvent);
		}
	},
	
	executeAction: function(inSender, inSelected) {
		if(this._list == "queue") {
			if(inSelected.getValue() == "Play This Song") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/select?id=" + this._queue.items[this._clicked].id});
				
				this._playing = this._queue.items[this._clicked].id;

				this.$.musicListView.refresh();
			} else if(inSelected.getValue() == "Remove from Queue") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/remove?id=" + this._queue.items[this._clicked].id});

				this._queue.items.splice(this._clicked, 1);
				
				this.$.musicListView.refresh();
			}
		} else if(this._list == "current") {
			if(inSelected.getValue() == "Play This Song") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playback/select?id=" + this._current.items[this._clicked].id});
			}
		} else if(this._list == "playlists") {
			if(inSelected.getValue() == "Select This Playlist") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playlists/select?id=" + this._playlists.items[this._clicked].name});
			}
		} else if(this._list == "results") {
			if(inSelected.getValue() == "Play Song Now") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/library/select?id=" + this._results[this._clicked].id});
			} else if(inSelected.getValue() == "Add Song to Queue") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/append?id=" + this._results[this._clicked].id});
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
			action = "playback/skip?action=next";
		else if(inSender.name == "musicPrevSong")
			action = "playback/skip?action=prev";
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
			} else if(inResponse.state == "paused") {
				this.$.musicStateInfo.setCaption("Paused");
			
				this.$.musicPlayPause.setIcon("./images/ctl-play.png");
			} else if(inResponse.state == "stopped") {
				this.$.musicStateInfo.setCaption("Stopped");
			
				this.$.musicPlayPause.setIcon("./images/ctl-play.png");
			}

			if(inResponse.current != undefined) {
				if(((this._list == "queue") || (this._list == "current")) && 
					(this._playing != inResponse.current.id))
				{
					this._playing = inResponse.current.id;
					
					this.$.musicListView.refresh();
				}
			
				this._playing = inResponse.current.id;
			
				if(inResponse.state == "stopped") {
					this.$.musicCurrentSong.setContent("Not playing...");
				} else {
					if(!inResponse.current.title)
						this.$.musicCurrentSong.setContent("Unknown Song");
					else if(!inResponse.current.artist)
						this.$.musicCurrentSong.setContent(unescape(inResponse.current.title));
					else {
						this.$.musicCurrentSong.setContent(unescape(inResponse.current.artist) + 
							" - " + unescape(inResponse.current.title));
					}
				}	
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

			if(inResponse.views != undefined) {
				if(inResponse.views.playqueue != undefined) {
					this._queue = inResponse.views.playqueue;

					if((!this._list) || (!this._queue)) {
						this._list = "queue";

						this.$.musicListDivider.setCaption(this._queue.name);
					}
				}

				if(inResponse.views.current != undefined) {
					this._current = inResponse.views.current;

					if((!this._list) || (!this._current)) {
						this._list = "current";
					
						this.$.musicListDivider.setCaption(this._current.name);
					}
				}

				if(inResponse.views.playlists != undefined) {
					this._playlists = inResponse.views.playlists;
				
					if(!this._list) {
						this._list = "playlists";
						
						this.$.musicListDivider.setCaption("All Playlists");
					}						
				}

				if(this._list)
					this.$.musicListView.refresh();

				if(!this.$.musicListDivider.open) {
					this._opening = true;

					this.$.musicListDivider.setOpen(true);
				}
			} else {
				this.$.musicListDivider.hide();
				this.$.musicListViews.hide();
			}
						
			if(inResponse.search != undefined) {			
				if(inResponse.search.results != undefined) {
					this._results = inResponse.search.results;
				
					if(this._list == "results")
						this.$.musicListView.refresh();
				}
			} else
				this.$.search.hide();
						
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

