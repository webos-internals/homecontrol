//

var crypto = require('crypto');

// MUSIC PLAYER API:

/*
  start?refresh=true/false
  close?refresh=true/false
  status?refresh=true/false
  output/mute?state=true/false
  output/volume?level=0-100
  library/search?filter=text
  library/select?id=songitem
  playback/state?action=play/pause
  playback/skip?action=prev/next
  playback/seek?action=fwd/bwd
  playback/select?id=songitem
- playmode/consume?state=true/false
- playmode/single?state=true/false
  playmode/repeat?state=true/false
  playmode/repeat?state=true/false
  playlists/list?id=playlist/*
  playlists/select?id=playlist
  playqueue/list?action=info/clear
  playqueue/append?id=songitem
  playqueue/remove?id=songitem
  playqueue/select?id=songitem
*/

// MUSIC PLAYER STATUS OBJECT

exports.musicPlayerStatus = MusicPlayerStatus = function(outputCtl, 
	playmodeCtl, currentInfo, positionInfo, librarySearch, listViews)
{
	// Hold on statuses per client so that we can minimize the data

	this.previousStatuses = {};

	// Public data

	this.state = "unknown";

	if(outputCtl) {
		this.mute = true;
		this.volume = 0;
	}

	if(playmodeCtl) {
		this.random = false;
		this.repeat = false;
	}

	if(currentInfo)
		this.current = {};

	if(positionInfo)
		this.position = {};

	if(librarySearch)
		this.search = {"name": "Search Results", "items": []};

	if(listViews) {
		this.views = {};

		for(var i = 0; i < listViews.length; i++) {
			if(listViews[i] == "current")
				this.views[listViews[i]] = {"name": "Current Playlist", "items": []};
			else if(listViews[i] == "selected")
				this.views[listViews[i]] = {"name": "Selected Playlist", "items": []};
			else if(listViews[i] == "libraries")
				this.views[listViews[i]] = {"name": "Music Libraries", "items": []};
			else if(listViews[i] == "playlists")
				this.views[listViews[i]] = {"name": "All Playlists", "items": []};
			else if(listViews[i] == "playqueue")
				this.views[listViews[i]] = {"name": "Play Queue", "items": []};
		}
	}

	// Public functions

	this.reset = function(address) {
		if(this.previousStatuses[address])
			delete this.previousStatuses[address];
	};

	this.getStatus = function(address, state) {
		if(state) this.state = state;

		var status = {"state": this.state};
		
		if((this.mute != undefined) && (this.volume != undefined)) {
			status.mute = this.mute;
			status.volume = this.volume;
		}

		if((this.random != undefined) && (this.repeat != undefined)) {
			status.random = this.random;
			status.repeat = this.repeat;
		}

		if(!this.previousStatuses[address])
			this.previousStatuses[address] = {};
		
		if(this.views) {
			status.views = {};

			var data = JSON.stringify(this.views);
			
			var viewsHash = crypto.createHash("md5").update(data).digest("hex");

			if(this.previousStatuses[address].views != viewsHash)
				status.views = this.views;

			this.previousStatuses[address].views = viewsHash;
		}
		
		if(this.search) {
			status.search = {};

			var data = JSON.stringify(this.search);

			var searchHash = crypto.createHash("md5").update(data).digest("hex");

			if(this.previousStatuses[address].search != searchHash)
				status.search = this.search;

			this.previousStatuses[address].search = searchHash;
		}
		
		if(this.current)
			status.current = this.current;

		if(this.position)
			status.position = this.position;

		return status;
	}
};

