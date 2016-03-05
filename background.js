chrome.alarms.create("buying_alarm", {"periodInMinutes": 1});
chrome.alarms.create("selling_alarm", {"periodInMinutes": 1});
chrome.alarms.create("exchange_rate", {"periodInMinutes": 5});

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
	chrome.storage.local.get(function(local_storage) {
		chrome.storage.sync.get(function(sync_storage) {
			if (typeof sync_storage['install_date'] === "undefined" || typeof sync_storage['vote_remind'] === "undefined") {
				sync_storage['install_date'] = Date.now();
				sync_storage['vote_remind'] = false;
				
				console.log("Installation date successfully added on '" + details['reason'] + "' event.");
			}
			
			if (typeof sync_storage["access_token"] === "undefined") {
				sync_storage["access_token"] = {};
			}
			
			chrome.storage.sync.set(sync_storage);
			
			// Local storage
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
			
			if (typeof local_storage['notify_for_400_gems'] === "undefined") {
				local_storage['notify_for_400_gems'] = 0;
			}
			
			if (typeof local_storage['notify_for_10_gold'] === "undefined") {
				local_storage['notify_for_10_gold'] = 0;
			}
			
			if (typeof local_storage['default_page'] === "undefined") {
				local_storage['default_page'] = "changelog";
			}
		
			// Reverse support
			if (typeof local_storage['sound'] === "undefined") {
				if (typeof sync_storage['settings'] !== "undefined" && typeof sync_storage['settings']['sound'] !== "undefined") {
					local_storage['sound'] = sync_storage['settings']['sound'];
				}
				else {
					local_storage['sound'] = 0.1;
				}
			}
			
			if (typeof local_storage['item_localization'] === "undefined") {
				if (typeof sync_storage['settings'] !== "undefined" && typeof sync_storage['settings']['item_localization'] !== "undefined") {
					local_storage['item_localization'] = sync_storage['settings']['item_localization'];
				}
				else {
					local_storage['item_localization'] = "en";
				}
			}
			
			if (typeof local_storage['algorithm'] === "undefined") {
				if (typeof sync_storage['settings'] !== "undefined" && typeof sync_storage['settings']['algorithm'] !== "undefined") {
					local_storage['algorithm'] = sync_storage['settings']['algorithm'];
				}
				else {
					local_storage['algorithm'] = 0;
				}
			}
			
			if (typeof local_storage['graph_tool'] === "undefined") {
				if (typeof sync_storage['settings'] !== "undefined" && typeof sync_storage['settings']['graph_tool'] !== "undefined") {
					local_storage['graph_tool'] = sync_storage['settings']['graph_tool'];
				}
				else {
					local_storage['graph_tool'] = 0;
				}
			}
			
			if (typeof local_storage['current_api_key'] === "undefined") {
				if (typeof sync_storage['current_api_key'] !== "undefined") {
					local_storage['current_api_key'] = sync_storage['current_api_key'];
				}
				else {
					local_storage['current_api_key'] = false;
				}
			}
			
			chrome.storage.local.set(local_storage);
		});
	});
});