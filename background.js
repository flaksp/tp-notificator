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
		if (sync_storage['metadata'] && sync_storage['metadata']['install_date']) {
			console.log("Installation date already exists in database.");
			return;
		}
		
		chrome.storage.sync.set({"metadata": {"install_date": Date.now(), "vote_remind": false}}, function() {
			console.log("Installation date successfully added on '" + details['reason'] + "' event.");
		});
	});
});