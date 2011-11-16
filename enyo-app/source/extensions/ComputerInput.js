enyo.kind({
	name: "ComputerInput",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",

	_event: null,

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
						onmousedown: "resetMouseEvent", onmousemove: "handleMouseMove"},
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
				onmousedown: "cancelKbdBlur", onclick: "handleButtonState"},				
			{name: "kbdSuper", caption: "Super", kind: "Button", flex: 2, className: "enyo-button-dark", 
				onmousedown: "cancelKbdBlur", onclick: "handleButtonState"},
			{name: "kbdAlt", caption: "Alt", kind: "Button", flex: 1, className: "enyo-button-dark", style: "margin-right: 15px;", 
				onmousedown: "cancelKbdBlur", onclick: "handleButtonState"}
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

		if(inSender.name == "kbdCtrl") {
			if(inSender.caption == "Ctrl") {
				inSender.setCaption("CtrlL");
				inSender.setDown(true);
			} else if(inSender.caption == "CtrlL") {
				inSender.setCaption("CtrlR");
				inSender.setDown(true);
			}	else {
				inSender.setCaption("Ctrl");
				inSender.setDown(false);
			}
		} else if(inSender.name == "kbdSuper") {
			if(inSender.caption == "Super") {
				inSender.setCaption("SuperL");
				inSender.setDown(true);
			} else if(inSender.caption == "SuperL") {
				inSender.setCaption("SuperR");
				inSender.setDown(true);
			}	else {
				inSender.setCaption("Super");
				inSender.setDown(false);
			}
		} else if(inSender.name == "kbdAlt") {
			if(inSender.caption == "Alt") {
				inSender.setCaption("AltL");
				inSender.setDown(true);
			} else if(inSender.caption == "AltL") {
				inSender.setCaption("AltGr");
				inSender.setDown(true);
			}	else {
				inSender.setCaption("Alt");
				inSender.setDown(false);
			}
		}
	},

	handleKeypress: function(inSender, inEvent) {
		this.$.keyboardInput.setValue("");

		var action = "";
		
		if(this.$.kbdCtrl.caption == "CtrlL")
			action += "Control_L%2B";
		else if(this.$.kbdCtrl.caption == "CtrlR")
			action += "Control_R%2B";

		if(this.$.kbdSuper.caption == "SuperL")
			action += "Super_L%2B";
		else if(this.$.kbdSuper.caption == "SuperR")
			action += "Super_R%2B";

		if(this.$.kbdAlt.caption == "AltL")
			action += "Alt_L%2B";
		else if(this.$.kbdAlt.caption == "AltGr")
			action += "ISO_Level3_Shift%2B";
		
		action += String.fromCharCode(inEvent.keyCode);

		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?event=" + action, 
			onSuccess: "handleDeviceStatus"});	
	},
	
	resetMouseEvent: function(inSender, inEvent) {	
		this._event = inEvent;
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
			var button = 1;
		else if(inSender.name == "mouseMiddle")
			var button = 2;
		else if(inSender.name == "mouseRight")
			var button = 3;
		
		this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/mouse?down=" + button, 
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

