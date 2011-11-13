enyo.kind({
	name: "VideoPlayer",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
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
/*			{kind: "DividerDrawer", caption: "Watching", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
					{layoutKind: "HFlexLayout", align: "center", style: "max-width: 290px; margin: -5px auto;", components: [
						{name: "currentSong", content: "Not playing...", flex: 1, style: "font-weight: bold;font-size: 18px;"},
						{content: "--:--", className: "enyo-label", style: "color: gray;font-size: 12px;"}
					]}
				]}
			]},*/
			{kind: "DividerDrawer", caption: "History"},
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
				{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
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
		
		{name: "serverRequest", kind: "WebService", url: "http://" + this.address + "/" + this.module + "/status"}		
	],

	rendered: function() {
		this.inherited(arguments);
		
		this.updateStatus(true);
	},
	
	selected: function() {
		this.$.search.hide();
	
		this.$.title.setContent(this.title);

		this.updateStatus(false);
	},

	updateStatus: function(poll) {
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/" + this.module + "/status", onSuccess: "handleVideoStatus"});

		if(poll)
			setTimeout(this.updateStatus.bind(this, true), 5000);	
	},
		
	controlVideo: function(inSender, inEvent) {
		var action = "status";

		if(inSender.name == "videoPlayPause") {
			action = "playpause";
		} else if(inSender.name == "videoRewind") {
			action = "rewind";
		} else if(inSender.name == "videoForward") {
			action = "forward";
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
	},
	
	handleVideoStatus: function(inSender, inResponse) {
		enyo.error("DEBUG: " + enyo.json.stringify(inResponse));
	
		if(inResponse) {
			this.doUpdate(inResponse.status);		
		} else
			this.doUpdate("offline");
	}	
});

