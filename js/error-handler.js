window.onerror = function(x_msg, x_url, x_lineNo, columnNo, error) {	
	var error_arr = [x_msg, x_url, x_lineNo]
	console.log(error_arr);
	
	chrome.storage.local.get(function(local_storage) {
		console.log(error_arr);
		
		var data = local_storage && local_storage['error_log'] ? local_storage['error_log'] : [];
		var page = typeof current_page === "undefined" ? "background" : current_page + '.html';
		error_arr[1] = error_arr[1].replace('chrome-extension://pcedepfdajcmmcbeigpabhebiiaccjkf', '').replace('chrome-extension://fmfminppfcknlpekeffahpnpfahmhojk', '');
		
		data.push({"date": Date.now(), "msg": error_arr[0], "url": error_arr[1], "page": page, "lineNo": error_arr[2]});
		
		chrome.storage.local.set({"error_log": data});
	});
}