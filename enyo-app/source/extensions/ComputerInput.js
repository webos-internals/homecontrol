enyo.kind({
	name: "ComputerInput",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",

	_event: null,

	_button: 0,

	_keyboard: false,
	
	_waiting: false,
	
	events: {
		onUpdate: ""
	},
	
	published: {
		title: "",
		module: "",
		address: ""
	},
	
	components: [
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Computer Input", style: "margin-top: 0px;font-weight: bold;"},
				{kind: "Spacer", flex: 1}
			]}
		]}, 
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{kind: "Divider", caption: "Keyboard"},
			{layoutKind: "VFlexLayout", style: "padding: 5px 15px;", components: [
				{layoutKind: "HFlexLayout", style: "max-width: 320px; margin: auto auto;", components: [	
					{name: "keyboardInput", kind: "ToolInput", alwaysLooksFocused: true, flex: 1, 
						inputClassName: "keyboard-input", autoCapitalize: "lowercase", autoWordComplete: false, 
						style: "margin: 0px 0px 0px 0px;", onkeypress: "handleKeypress", onfocus: "showKbdButtons",
						onblur: "hideKbdButtons"},
				]}
			]},
			{kind: "Divider", caption: "Mouse", style: "margin-top: -5px;"},
			{layoutKind: "VFlexLayout", flex: 1, style: "padding: 5px 15px;", components: [
				{layoutKind: "VFlexLayout", flex: 1, style: "max-width: 320px; margin: auto auto;", components: [	
					{layoutKind: "VFlexLayout", flex: 1, style: "margin: 5px 0px 5px 0px;border-radius: 20px;border-style: groove;",	
						onmousedown: "resetMouseEvent", onmouseup: "resetMouseButton", onmousemove: "handleMouseMove"},
				]}
			]}
		]},
		{kind: "Toolbar", className: "enyo-toolbar-light", components: [
			{name: "mouseLeft", caption: " ", kind: "Button", flex: 1, className: "enyo-button-dark", style: "margin-left: 15px;", 
				onmousedown: "handleMouseDown", onmouseup: "handleMouseUp"},
			{name: "mouseMiddle", caption: " ", kind: "Button", flex: 1, className: "enyo-button-dark", 
				onmousedown: "handleMouseDown", onmouseup: "handleMouseUp"},
			{name: "mouseRight", caption: " ", kind: "Button", flex: 1, className: "enyo-button-dark", style: "margin-right: 15px;", 
				onmousedown: "handleMouseDown", onmouseup: "handleMouseUp"},
			{name: "kbdCtrl", caption: "Ctrl", kind: "Button", flex: 1, className: "enyo-button-dark", style: "margin-left: 15px;", 
				onmousedown: "cancelKbdBlur", onmouseup: "handleButtonState"},				
			{name: "kbdSuper", caption: "Super", kind: "Button", flex: 2, className: "enyo-button-dark", 
				onmousedown: "cancelKbdBlur", onmouseup: "handleButtonState"},
			{name: "kbdAlt", caption: "Alt", kind: "Button", flex: 1, className: "enyo-button-dark", style: "margin-right: 15px;", 
				onmousedown: "cancelKbdBlur", onmouseup: "handleButtonState"}
		]},
		
		{name: "serverRequest", kind: "WebService", onFailure: "handleServerError"}		
	],

	rendered: function() {
		this.inherited(arguments);

		this.$.kbdCtrl.hide();
		this.$.kbdSuper.hide();		
		this.$.kbdAlt.hide();

		this.updateStatus();
	},

	selected: function() {
		this.$.title.setContent(this.title);

		this.updateStatus();
	},
	
	updateStatus: function() {
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/status", 
			onSuccess: "handleDeviceStatus"});	
	},

	showKbdButtons: function() {
		this.$.mouseLeft.hide();
		this.$.mouseMiddle.hide();		
		this.$.mouseRight.hide();
		
		this.$.kbdCtrl.show();
		this.$.kbdSuper.show();		
		this.$.kbdAlt.show();

		if(this.$.kbdCtrl.caption != "Ctrl")		
			this.$.kbdCtrl.setDown(true);

		if(this.$.kbdSuper.caption != "Super")		
			this.$.kbdSuper.setDown(true);

		if(this.$.kbdAlt.caption != "Alt")		
			this.$.kbdAlt.setDown(true);
	},
	
	hideKbdButtons: function() {
		this.$.kbdCtrl.hide();
		this.$.kbdSuper.hide();		
		this.$.kbdAlt.hide();

		this.$.mouseLeft.show();
		this.$.mouseMiddle.show();		
		this.$.mouseRight.show();
	},	
	
	cancelKbdBlur: function(inSender, inEvent) {
		enyo.stopEvent(inEvent);
	},
	
	handleButtonState: function(inSender, inEvent) {
		enyo.stopEvent(inEvent);

		var action = "";

		if(inSender.name == "kbdCtrl") {
			if(inSender.caption == "Ctrl") {
				action = "?down=Control_L";
			
				inSender.setCaption("CtrlL");
				inSender.setDown(true);
			} else if(inSender.caption == "CtrlL") {
				action = "?up=Control_L&down=Control_R";

				inSender.setCaption("CtrlR");
				inSender.setDown(true);
			}	else {
				action = "?up=Control_R";

				inSender.setCaption("Ctrl");
				inSender.setDown(false);
			}
		} else if(inSender.name == "kbdSuper") {
			if(inSender.caption == "Super") {
				action = "?down=Super_L";
				
				inSender.setCaption("SuperL");
				inSender.setDown(true);
			} else if(inSender.caption == "SuperL") {
				action = "?up=Super_L&down=Super_R";
				
				inSender.setCaption("SuperR");
				inSender.setDown(true);
			}	else {
				action = "?up=Super_L";
				
				inSender.setCaption("Super");
				inSender.setDown(false);
			}
		} else if(inSender.name == "kbdAlt") {
			if(inSender.caption == "Alt") {
				action = "?down=Alt_L";
				
				inSender.setCaption("AltL");
				inSender.setDown(true);
			} else if(inSender.caption == "AltL") {
				action = "?up=Alt_L&down=ISO_Level3_Shift";
				
				inSender.setCaption("AltGr");
				inSender.setDown(true);
			}	else {
				action = "?up=ISO_Level3_Shift";
							
				inSender.setCaption("Alt");
				inSender.setDown(false);
			}
		}

		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard" + action, 
			onSuccess: "handleDeviceStatus"});
	},

	handleKeypress: function(inSender, inEvent) {
		this.$.keyboardInput.setValue("");

		var action = "";

		action += String.fromCharCode(inEvent.keyCode);

		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?key=" + action, 
			onSuccess: "handleDeviceStatus"});	
	},
	
	resetMouseEvent: function(inSender, inEvent) {	
		this._event = inEvent;
	},

	resetMouseButton: function(inSender, inEvent) {	
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/mouse?up=" + this._button, 
			onSuccess: "handleDeviceStatus"});	
	},
	
	handleMouseMove: function(inSender, inEvent) {
		var x = inEvent.screenX - this._event.screenX;

		var y = inEvent.screenY - this._event.screenY;

		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/mouse?move=" + x + "," + y, 
			onSuccess: "handleDeviceStatus"});	
			
		this._event = inEvent;
	},

	handleMouseDown: function(inSender, inEvent) {
		if(inSender.name == "mouseLeft")
			this._button = 1;
		else if(inSender.name == "mouseMiddle")
			this._button = 2;
		else if(inSender.name == "mouseRight")
			this._button = 3;
		
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/mouse?down=" + this._button, 
			onSuccess: "handleDeviceStatus"});	
	},

	handleMouseUp: function(inSender, inEvent) {
		if(inSender.name == "mouseLeft")
			var button = 1;
		else if(inSender.name == "mouseMiddle")
			var button = 2;
		else if(inSender.name == "mouseRight")
			var button = 3;
		
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/mouse?up=" + button, 
			onSuccess: "handleDeviceStatus"});	
	},
	
	handleDeviceStatus: function(inSender, inResponse) {
		enyo.error("DEBUG: " + enyo.json.stringify(inResponse));
	
		if(inResponse) {
			this.doUpdate("online");
		} else
			this.doUpdate("offline");
	},	

	handleServerError: function(inSender, inResponse) {
		this.doUpdate("error");
	}
});

