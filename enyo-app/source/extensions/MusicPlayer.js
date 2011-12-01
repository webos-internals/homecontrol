//
// Status: state, *(repeat & random), *(volume & mute), *views, *search, *current(id,*artist,*album,*title)
//

enyo.kind({
	name: "MusicPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",

	_state: "offline",

	_timeout: null,
	_opening: false,
	_keyboard: false,

	_clicked: 0,
	_playing: 0,

	_list: null,
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
				{name: "search", kind: "ToolButton", className: "tool-button", icon: "./images/button-search.png",
					onclick: "toggleKeyboard"}
			]},
			{name: "keyboardHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{name: "keyboardInput", kind: "ToolInput", alwaysLooksFocused: true, flex: 1, 
					inputClassName: "keyboard-input", autoCapitalize: "lowercase", autoWordComplete: false, 
					style: "margin: -5px 10px -5px 0px;", onchange: "searchMusic"},
				{kind: "ToolButton", className: "tool-button", icon: "./images/button-kbd.png", onclick: "toggleKeyboard"}
			]}					
		]},
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "musicStateInfo", kind: "DividerDrawer", caption: "Offline", className: "divider", open: true, components: [
				{layoutKind: "VFlexLayout", flex: 1, className: "divider-content", components: [
					{layoutKind: "HFlexLayout", className: "current-container", components: [
						{name: "musicCurrentSong", content: "Not playing...", flex: 1, className: "current-info"}
/*						{content: "--:--", className: "enyo-label", style: "color: gray;font-size: 12px;"}*/
					]}
				]}
			]},
			{name: "musicEmptyList", kind: "Spacer"},
			{name: "musicListDivider", kind: "DividerDrawer", caption: "Play Queue", open: true, onOpenChanged: "toggleList"},
			{name: "musicListViews", layoutKind: "VFlexLayout", flex: 1, className: "divider-container-box", components: [
				{name: "musicListView", kind: "VirtualList", flex: 1, onSetupRow: "setupListItem", components: [
					{kind: "Item", tapHighlight: true, style: "margin: 0px;padding: 0px;", onclick: "selectAction", components: [
						{layoutKind: "VFlexLayout", flex: 1, className: "list-view-item", components: [
							{name: "listItemTitle", content: "", flex: 1, className: "list-view-title"},
							{name: "listItemSubtitle", content: "", flex: 1, className: "list-view-subtitle"}
						]}
					]}
				]}
			]},
			{kind: "DividerDrawer", open: false, caption: "Controls", onOpenChanged: "toggleControls", components: [
				{layoutKind: "VFlexLayout", flex: 1, className: "divider-content", components: [
					{name: "musicRepeatRandom", layoutKind: "HFlexLayout", pack: "center", className: "divider-container",
						style: "margin: -5px auto 8px auto;", components: [
						{name: "musicRepeatToggle", kind: "ToggleButton", onLabel: "Repeat", offLabel: "Repeat", 
							className: "control-repeat", style: "width: 70px;", onChange: "controlMusic"},
						{kind: "Spacer"},
						{name: "musicRandomToggle", kind: "ToggleButton", onLabel: "Shuffle", offLabel: "Shuffle", 
							className: "control-random", style: "width: 70px;", onChange: "controlMusic"}
					]},
					{name: "musicVolumeControls", layoutKind: "VFlexLayout", components: [
						{layoutKind: "HFlexLayout", className: "divider-container", align: "center", components: [
							{content: "Volume:", flex: 1, style: "font-weight: bold;font-size: 18px;"},
							{name: "musicMuteToggle", kind: "ToggleButton", onLabel: "50", offLabel: "Mute", 
								className: "control-mute", style: "width: 70px;", onChange: "controlMusic"}
						]},
						{layoutKind: "HFlexLayout", style: "max-width: 290px;margin: auto auto;", components: [
							{name: "musicVolumeSlider", kind: "Slider", tapPosition: false, flex: 1, 
								onChanging: "updateVolume", onChange: "controlMusic", className: "control-volume"}
						]}
					]}
				]}
			]}
		]},
		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
			{kind: "Spacer"},
			{name: "musicSkipPrev", kind: "ToolButton", icon: "./images/ctl-prev.png", className: "control-first", 
				onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicSeekBwd", kind: "ToolButton", icon: "./images/ctl-bwd.png", className: "control-middle", 
				onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicPlayPause", kind: "ToolButton", icon: "./images/ctl-play.png", className: "control-middle", 
				onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicSeekFwd", kind: "ToolButton", icon: "./images/ctl-fwd.png", className: "control-middle", 
				onclick: "controlMusic"},
			{kind: "Spacer"},
			{name: "musicSkipNext", kind: "ToolButton", icon: "./images/ctl-next.png", className: "control-last", 
				onclick: "controlMusic"},
			{kind: "Spacer"},
		]},
		
		{name: "serverRequest", kind: "WebService", onSuccess: "updateStatus", onFailure: "unknownError"}
	],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.$.keyboardHeader.hide();
		
		this.$.musicEmptyList.hide();
		this.$.musicSeekBwd.hide();
		this.$.musicSeekFwd.hide();

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
			if((this._list == "queue") && (this._playlists))
				this._list = "playlists";
			else if((this._list == "current") && (this._playlists))
				this._list = "playlists";
			else if((this._keyboard) && (this._results) && (this._list != "results"))
				this._list = "results";
			else if(this._queue)
				this._list = "queue";
			else if(this._current)
				this._list = "current";

			this.$.musicListDivider.setCaption(this["_" + this._list].name);
			
			this.$.musicListView.refresh();
			
			this.checkStatus();
		} else {
			this._opening = true;

			this.$.musicListDivider.setOpen(false);
		}		
	},

	toggleControls: function(inSender) {
		if((!this.$.musicSeekBwd) || (!this.$.musicSeekFwd))
			return;

		if(inSender.open == true) {
			this.$.musicSeekBwd.show();
			this.$.musicSeekFwd.show();
		} else {
			this.$.musicSeekBwd.hide();
			this.$.musicSeekFwd.hide();
		}
	},

	toggleKeyboard: function() {
		if(this._keyboard) {
			this._keyboard = false;
			
			this.$.keyboardHeader.hide();
			this.$.normalHeader.show();

			if(this._list == "results") {
				if(this._queue)
					this._list = "queue";
				else if(this._current)
					this._list = "current";
				else if(this._playlists)
					this._list = "playlists";

				this.$.musicListDivider.setCaption(this["_" + this._list].name);
			}
		} else {
			this._keyboard = true;
			
			this.$.normalHeader.hide();
			this.$.keyboardHeader.show();
			this.$.keyboardInput.forceFocus();

			if((this._results) && (this._list != "results")) {
				this._list = "results";
			
				this.$.musicListDivider.setCaption(this._results.name);
			}
		}

		this.$.musicListView.refresh();
	},	
	
	setupListItem: function(inSender, inIndex) {
		if((this._list) && (this["_" + this._list]) && (this["_" + this._list].items) && 
			(inIndex >= 0) && (inIndex < this["_" + this._list].items.length))
		{
			if(this["_" + this._list].items[inIndex].name) {
				var title = this["_" + this._list].items[inIndex].name;

				if((!title) || (title.length == 0))
					title = "Unknown Playlist";

				var info = this["_" + this._list].items[inIndex].type;

				if((!info) || (info.length == 0))
					info = "Unknown Type";
			} else {
				var title = this["_" + this._list].items[inIndex].title;
			
				if((!title) || (title.length == 0))
					title = "Unknown Title";

				var info = this["_" + this._list].items[inIndex].artist;

				if((!info) || (info.length == 0))
					info = "Unknown Artist";

				if((this["_" + this._list].items[inIndex].album) && 
					(this["_" + this._list].items[inIndex].album.length > 0))
				{
					info += " - " + this["_" + this._list].items[inIndex].album
				}
			}
				
			if(((this._list == "queue") || (this._list == "current")) && 
				(this["_" + this._list].items[inIndex].id == this._playing))
			{
				this.$.listItemTitle.applyStyle("font-weight", "bold");
			} else {
				this.$.listItemTitle.applyStyle("font-weight", "normal");
			}
		
			this.$.listItemTitle.setContent(title);
			this.$.listItemSubtitle.setContent(info);
			
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
					this.module + "/library/select?id=" + this._results.items[this._clicked].id});
			} else if(inSelected.getValue() == "Add Song to Queue") {
				this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + 
					this.module + "/playqueue/append?id=" + this._results.items[this._clicked].id});
			}
		}
	}, 
	
	updateVolume: function(inSender, inEvent) {
		this.$.musicMuteToggle.setOnLabel(this.$.musicVolumeSlider.getPosition());
	},
	
	searchMusic: function() {
		var text = this.$.keyboardInput.getValue();

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
		} else if(inSender.name == "musicSkipNext")
			action = "playback/skip?action=next";
		else if(inSender.name == "musicSkipPrev")
			action = "playback/skip?action=prev";
		else if(inSender.name == "musicSeekFwd")
			action = "playback/seek?action=fwd";
		else if(inSender.name == "musicSeekBwd")
			action = "playback/seek?action=bwd";
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
					this.$.musicCurrentSong.applyStyle("text-overflow", "ellipsis");
					this.$.musicCurrentSong.applyStyle("overflow-x", "none");

					this.$.musicCurrentSong.setContent("Not playing...");
				} else {
					this.$.musicCurrentSong.applyStyle("text-overflow", "none");
					this.$.musicCurrentSong.applyStyle("overflow-x", "-webkit-marquee");
				
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
				this.$.musicEmptyList.show();
				this.$.musicListDivider.hide();
				this.$.musicListViews.hide();
			}
						
			if(inResponse.search != undefined) {			
				if(inResponse.search.items != undefined) {
					this._results = inResponse.search;
				
					if(this._keyboard == true) {
						this._list = "results";

						this.$.musicListDivider.setCaption(this._results.name);
		
						this.$.musicListView.refresh();
					}
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

