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
		if (typeof local_storage['install_date'] === "undefined" || typeof local_storage['vote_remind'] === "undefined") {
			local_storage['install_date'] = Date.now();
			local_storage['vote_remind'] = false;
			
			console.log("Installation date successfully added on '" + details['reason'] + "' event.");
		}
		
		if (typeof local_storage["access_token"] === "undefined") {
			local_storage["access_token"] = {};
		}
		
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
		
		if (typeof local_storage['sound'] === "undefined") {
			local_storage['sound'] = 0.1;
		}
		
		if (typeof local_storage['item_localization'] === "undefined") {
			local_storage['item_localization'] = "en";
		}
		
		if (typeof local_storage['algorithm'] === "undefined") {
			local_storage['algorithm'] = 0;
		}
		
		if (typeof local_storage['graph_tool'] === "undefined") {
			local_storage['graph_tool'] = 0;
		}
		
		if (typeof local_storage['current_api_key'] === "undefined") {
			local_storage['current_api_key'] = false;
		}
		
		chrome.storage.local.set(local_storage);
	});
});
