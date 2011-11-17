enyo.kind({
	name: "ComputerInput",
	kind: enyo.Control,
	layoutKind: "VFlexLayout",

	_event: null,

	_button: 0,

	_keyboard: false,
	
	_function: false,
	
	_shift: false,
	
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
		{name: "keysPopup", kind: "Popup", style: "max-width: 500px;", onclick: "handlePopupClose", onClose: "handlePopupClose", components: [
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "1..0, Q, W", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "F1..F10, F11, F12", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "B, J, N , M", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Arrow Keys", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "Y", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Home", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "H", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "End", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "I", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Page Up", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "K", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Page Down", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "U", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Ins", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "Backspace", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Del", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "Enter", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Esc", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]},
			{layoutKind: "HFlexLayout", components: [	
		    	{content: "Space", flex: 1, style: "text-align: left;font-size: 16px;"},
		    	{content: "Tab", flex: 1, style: "text-align: right;font-size: 16px;"}
		   ]}
		]},
	
		{kind: "PageHeader", layoutKind: "HFlexLayout", components: [
			{name: "normalHeader", layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Spacer", flex: 1},
				{name: "title", content: "Computer Input", style: "margin-top: 0px;font-weight: bold;"},
				{kind: "Spacer", flex: 1}
			]}
		]}, 
		{layoutKind: "VFlexLayout", flex: 1, components: [
			{kind: "Divider", caption: "Keyboard"},
			{layoutKind: "VFlexLayout", style: "padding: 5px 15px;margin-top: -5px;", components: [
				{layoutKind: "HFlexLayout", style: "max-width: 320px; margin: auto auto;", components: [	
					{name: "keyboardInput", kind: "ToolInput", alwaysLooksFocused: true, flex: 1, 
						inputClassName: "keyboard-input", autoCapitalize: "lowercase", autoWordComplete: false, 
						style: "margin: 0px 0px 0px 0px;", onfocus: "showKbdButtons",
						onblur: "hideKbdButtons", onkeydown: "handleKeyDown", onkeyup: "handleKeyUp"},
					{name: "functionKey", caption: "FN", kind: "Button", className: "function-key enyo-button-dark", 
						style: "margin-left: 10px;margin-right: 0px;", onclick: "handleFunctionKey"}
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

	handleFunctionKey: function() {
		if(!this._function) {
			this.$.functionKey.setDown(true);
			
			this._function = true;
		
			this.$.keysPopup.openAtCenter();
		
			this.$.keyboardInput.forceFocus();
		} else {
			this.$.functionKey.setDown(false);
					
			this._function = false;		
		}
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
	
	handlePopupClose: function() {
		if(this._function)
			this.$.functionKey.setDown(true);

		this.$.keysPopup.close();
	
		this.$.keyboardInput.forceFocus();
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

	handleKeyUp: function(inSender, inEvent) {
		enyo.stopEvent(inEvent);
		
		var keys = {
			"1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
			"q": "q", "w": "w", "e": "e", "r": "r", "t": "t", "y": "y", "u": "u", "i": "i", "o": "o", "p": "p", "å": "å",
			"a": "a", "s": "s",  "d": "d", "f": "f", "g": "g", "h": "h", "j": "j",  "k": "k", "l": "l", "ö": "ö", "ä": "ä",
			"z": "z", "x": "x", "c": "c", "v": "v", "b": "b", "n": "n", "m": "m", 
			"Q": "q", "W": "w", "E": "e", "R": "r", "T": "t", "Y": "y", "U": "u", "I": "i", "O": "o", "P": "p", "Å": "å",
			"A": "a", "S": "s",  "D": "d", "F": "f", "G": "g", "H": "h", "J": "j",  "K": "k", "L": "l", "Ö": "ö", "Ä": "ä",
			"Z": "z", "X": "x", "C": "c", "V": "v", "B": "b", "N": "n", "M": "m", 
			"/": "slash", "+": "plus", "(": "parenleft", ")": "parenright", "%": "percent", "\"": "quotedbl", "=": "equal", 
			"&": "ampersand", "-": "minus", "$": "dollar", "!": "exclam", ":": "colon", "'": "apostrophe", "*": "asterisk", 
			"#": "numbersign", "?": "question", ";": "semicolon", "_": "underscore", ",": "comma", ".": "period", "at": "at",
			"Backspace": "BackSpace", "Enter": "Return"
		};

		var fnKeys = {
			"1": "F1", "2": "F2", "3": "F3", "4": "F4", "F5": "5", "6": "F6", "7": "F7", "8": "F8", "9": "F9", "0": "F10",
			"e": "F1", "r": "F2", "t": "F3", "d": "F4", "f": "F5", "g": "F6", "x": "F7", "c": "F8", "v": "F9", "@": "F10",
			"E": "F1", "R": "F2", "T": "F3", "D": "F4", "F": "F5", "G": "F6", "X": "F7", "C": "F8", "V": "F9", 
			"q": "F11", "Q": "F11", "w": "F12", "W": "F12", "b": "Left", "B": "Left", "j": "Up", "J": "Up", "n": "Down", 
			"N": "Down", "m": "Right", "M": "Right", "y": "Home", "Y": "Home", "h": "End", "H": "End", "u": "Insert",
			"U": "Insert", "i": "Page_Up", "I": "Page_Up", "k": "Page_Down", "K": "Page_Down", " ": "Tab",
			"Backspace": "Delete", "Enter": "Escape"
		};
		
		if(inEvent.keyCode == 8)
			var key = "Backspace";
		else if(inEvent.keyCode == 13)
			var key = "Enter";
		else if(inEvent.keyCode == 48)
			var key = "@";
		else if(inEvent.keyCode == 49)
			var key = "!";
		else if(inEvent.keyCode == 52)
			var key = "$";
		else if(inEvent.keyCode == 53)
			var key = "%";
		else if(inEvent.keyCode == 66)
			var key = "#";
		else if(inEvent.keyCode == 90)
			var key = "*";
		else if(inEvent.keyCode == 222)
			var key = "\"";
		else
			var key = String.fromCharCode(inEvent.keyCode);

		if(((!this._function) && (keys[key])) || ((this._function) && (fnKeys[key]))) {
			if(!this._function) {
				if((this._shift) || (inEvent.keyCode == 8) || (inEvent.keyCode == 135))
					this.$.keyboardInput.setValue(key);
				else
					this.$.keyboardInput.setValue(key.toLowerCase());

				this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?key=" + keys[key], 
					onSuccess: "handleDeviceStatus"});	
			} else {
				this.$.keyboardInput.setValue(fnKeys[key].replace("_", " "));

				this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?key=" + fnKeys[key], 
					onSuccess: "handleDeviceStatus"});	
			}
		} else if(inEvent.keyCode == 16) {
			this._shift = false;
		
			this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?up=Shift_L", 
				onSuccess: "handleDeviceStatus"});		
		} else if(inEvent.keyCode != 129) 
			this.$.keyboardInput.setValue("<Unknown Key>");
	},

	handleKeyDown: function(inSender, inEvent) {
		enyo.stopEvent(inEvent);
		
		if(inEvent.keyCode == 16) {
			var key = "Shift";

			this._shift = true;

			this.$.serverRequest.call({}, {url: "http://" + this.address + "/computer/keyboard?down=Shift_L", 
				onSuccess: "handleDeviceStatus"});		
		}
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

