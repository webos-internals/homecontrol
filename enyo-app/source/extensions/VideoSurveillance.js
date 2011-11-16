enyo.kind({
	name: "VideoSurveillance",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",
	
	_config: {},

	_sensors: [],
	
	_selected: 0,
    
    _state: "playing",

	events: {
		onUpdate: ""
	},
	
	published: {
		title: "",
		module: "",
		address: ""
	},
	
	components: [
		{kind: "PageHeader", layoutKind: "VFlexLayout", components: [
				{name: "title", content: "Surveillance", style: "margin-top: 0px;font-weight: bold;"},
		]},
        
        {layoutKind: "VFlexLayout", flex: 1, components: [
			{kind: "Video", name: "videoObject", src: "rtsp://user:pass@127.0.0.1/img/video.sav",
                showControls: false, width: "320px", height: "480px", style: "position: absolute; left: 64px; top: 84px;"
            },
		]},
        
		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
            /* For now, hide play/pause. It seems to interact poorly in Enyo. :( */
            /*{name: "videoPlayPause", kind: "ToolButton", icon: "./images/ctl-pause.png", onclick: "controlVideo"},*/
            {name: "videoFullscreen", kind: "ToolButton", icon: "./images/ctl-fullscreen.png", onclick: "controlVideo"},
		]},
        
        {kind: "PalmService", name: "applicationManager", service: "palm://com.palm.applicationManager", method: "open",
            onSuccess: "gotAccounts", onFailure: "genericFailure"
        }
	],
	
	rendered: function() {
		this.playVideo();
	},
    
    selected: function() {
		this.$.title.setContent(this.title);

		this.playVideo();
	},
    
    deselected: function() {
        this.pauseVideo();
    },
    
    playVideo: function() {
        switch (this.module) {
            case "cisco":
                this.$.videoObject.src = "rtsp://" + this.address + "/img/video.sav";
                break;
            default:
                break;
        }
        this.$.videoObject.srcChanged();
        
        this.$.videoObject.play();
    },

    pauseVideo: function() {
        this.$.videoObject.pause();
    },

	showKeyboard: function() {
		enyo.keyboard.show();
	},
    
    controlVideo: function(inSender, inEvent) {
        if(inSender.name == "videoPlayPause") {
			if(this._state == "paused") {
                this._state = "playing";
				this.$.videoPlayPause.setIcon("./images/ctl-pause.png");
                
                this.$.videoObject.play();
			} else {
                this._state = "paused";
				this.$.videoPlayPause.setIcon("./images/ctl-play.png");
                
                this.$.videoObject.pause();
			}
		} else if (inSender.name == "videoFullscreen") {
            this.$.applicationManager.call({target: this.$.videoObject.src});
        }
    }
});

