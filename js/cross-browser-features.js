var browser_parser = new UAParser();
var browser_info = browser_parser.getBrowser();

var cbf = {};
cbf.storage = {};
cbf.storage.sync = {};
cbf.notifications = {};

cbf.storage.sync.get = function() {	
	if (browser_info['name'] != "Opera") {
		if      (arguments.length === 1) { chrome.storage.sync.get(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.sync.get(arguments[0], arguments[1]); }
	}
	else {
		if      (arguments.length === 1) { chrome.storage.local.get(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.local.get(arguments[0], arguments[1]); }
	}
}

cbf.storage.sync.getBytesInUse = function() {	
	if (browser_info['name'] != "Opera") {
		if      (arguments.length === 1) { chrome.storage.sync.getBytesInUse(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.sync.getBytesInUse(arguments[0], arguments[1]); }
	}
	else {
		if      (arguments.length === 1) { chrome.storage.local.getBytesInUse(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.local.getBytesInUse(arguments[0], arguments[1]); }
	}
}

cbf.storage.sync.set = function() {
	if (browser_info['name'] != "Opera") {
		if      (arguments.length === 1) { chrome.storage.sync.set(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.sync.set(arguments[0], arguments[1]); }
	}
	else {
		if      (arguments.length === 1) { chrome.storage.local.set(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.local.set(arguments[0], arguments[1]); }
	}
}

cbf.storage.sync.remove = function() {
	if (browser_info['name'] != "Opera") {
		if      (arguments.length === 1) { chrome.storage.sync.remove(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.sync.remove(arguments[0], arguments[1]); }
	}
	else {
		if      (arguments.length === 1) { chrome.storage.local.remove(arguments[0]); }
		else if (arguments.length === 2) { chrome.storage.local.remove(arguments[0], arguments[1]); }
	}
}

cbf.storage.sync.clear = function() {
	if (browser_info['name'] != "Opera") {
		if      (arguments.length === 0) { chrome.storage.sync.clear(); }
		else if (arguments.length === 1) { chrome.storage.sync.clear(arguments[0]); }
	}
	else {
		if      (arguments.length === 0) { chrome.storage.local.clear(); }
		else if (arguments.length === 1) { chrome.storage.local.clear(arguments[0]); }
	}
}

cbf.notifications.create = function(notificationId, NotificationOptions, callback) {	
	if (browser_info['name'] == "Opera") {		
		if (typeof NotificationOptions['contextMessage'] !== 'undefined') {
			NotificationOptions['message'] += ' ' + NotificationOptions['contextMessage'];
		}
		
		delete NotificationOptions['isClickable'];
		delete NotificationOptions['contextMessage'];
	}
	
	if (typeof arguments[0] === "string" && typeof arguments[1] === "object" && typeof arguments[2] === "function") {
		chrome.notifications.create(notificationId, NotificationOptions, callback);
	}
	else if (typeof arguments[0] === "string" && typeof arguments[1] === "object" && typeof arguments[2] !== "function") {
		chrome.notifications.create(notificationId, NotificationOptions);
	}
	else if (typeof arguments[0] === "object" && typeof arguments[1] === "function" && typeof arguments[2] === "undefined") {
		chrome.notifications.create(NotificationOptions, callback);
	}
	else if (typeof arguments[0] === "object" && typeof arguments[1] === "undefined" && typeof arguments[2] === "undefined") {
		chrome.notifications.create(NotificationOptions);
	}
}