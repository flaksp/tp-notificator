window.onerror = function(msg, url, lineNo, columnNo, error) {		
	chrome.storage.local.get(function(local_storage) {
		var page = typeof current_page === "undefined" ? "background" : current_page + '.html';
		
		local_storage["error_log"].push({
			"date": Date.now(),
			"msg": msg,
			"url": url.replace('chrome-extension://' + chrome.i18n.getMessage("@@extension_id"), ''),
			"page": page,
			"lineNo": lineNo
		});
		
		chrome.storage.local.set({"error_log": local_storage["error_log"]});
	});
}
