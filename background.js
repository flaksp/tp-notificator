chrome.alarms.create("buying_alarm", {"periodInMinutes": 1});
chrome.alarms.create("selling_alarm", {"periodInMinutes": 1});

chrome.alarms.onAlarm.addListener(function(alarm) {
	chrome.notifications.getAll(function(notifies) {
		$.each(notifies, function(index, value) {
			if (value[0]) {
				chrome.notifications.clear(value[0]);
			}
		});
		
		console.log("-- Timer " + alarm['name'] + " -- " + new Date() + " --");
	});
});

chrome.runtime.onInstalled.addListener(function(details) {
	chrome.storage.sync.get(function(sync_storage) {
		if (typeof sync_storage['metadata'] === "undefined") {
			sync_storage['metadata'] = {};
		}
		
		if (typeof sync_storage['metadata']['install_date'] === "undefined") {
			sync_storage['metadata']['install_date'] = Date.now();
			sync_storage['metadata']['vote_remind'] = false;
			
			console.log("Installation date successfully added on '" + details['reason'] + "' event.");
		}
		
		if (typeof sync_storage['current_api_key'] === "undefined") {
			sync_storage['current_api_key'] = false;
		}
		
		if (typeof sync_storage['settings'] === "undefined") {
			sync_storage['settings'] = {};
		}
		
		if (typeof sync_storage['settings']['algorithm'] === "undefined") {
			sync_storage['settings']['algorithm'] = 0;
		}
		
		if (typeof sync_storage['settings']['sound'] === "undefined") {
			sync_storage['settings']['sound'] = 0.1;
		}
		
		if (typeof sync_storage['settings']['item_localization'] === "undefined") {
			sync_storage['settings']['item_localization'] = "en";
		}
		
		if (typeof sync_storage['settings']['graph_tool'] === "undefined") {
			sync_storage['settings']['graph_tool'] = 0;
		}
		
		if (typeof sync_storage["access_token"] === "undefined") {
			sync_storage["access_token"] = {};
		}
		
		chrome.storage.sync.set(sync_storage);
	});
	
	// Local storage
	chrome.storage.local.get(function(local_storage) {
		if (typeof local_storage['error_log'] === "undefined") {
			local_storage['error_log'] = [];
		}
		
		if (typeof local_storage['buying_track_list'] === "undefined") {
			local_storage['buying_track_list'] = {};
		}
		
		if (typeof local_storage['selling_track_list'] === "undefined") {
			local_storage['selling_track_list'] = {};
		}
		
		if (typeof local_storage['historical_bought'] === "undefined") {
			local_storage['historical_bought'] = [];
		}
		
		if (typeof local_storage['historical_sold'] === "undefined") {
			local_storage['historical_sold'] = [];
		}
		
		chrome.storage.local.set(local_storage);
	});
});