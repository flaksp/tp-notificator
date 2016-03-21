$("document").ready(function() {
	var template = Handlebars.compile($("#debug").html());
	$("main").html(template());
	
	// Storage info	
	chrome.storage.local.getBytesInUse(function(bytesInUse) {
		$('#storage_in_use_local_current_api_key span[data-info=bytes]').text(bytesInUse);
		$('#storage_in_use_local_current_api_key span[data-info=percents]').text((bytesInUse / (5242880 / 100)).toFixed(2));
		$('#storage_in_use_local_current_api_key progress').val(bytesInUse / (5242880 / 100));
	});
	
	chrome.storage.local.get(function(local_storage) {
		$('#readable_local_storage').html(JSON.stringify(local_storage, null, 3));
		
		if (local_storage['error_log'].length > 0) {
			$('#js_errors').empty();
			
			local_storage['error_log'].forEach(function(item, i, arr) {
				$('#js_errors').prepend('<div class="row">' +
					'<div class="col-xs-3">' + time_ago(item['date']) + ' ' + chrome.i18n.getMessage("ago") + '<span class="full-opacity">: </span></div>' +
					'<div class="col-xs-9">Line <u>' + item['lineNo'] + '</u> in <code>' + item['url'] + ' @ ' + item['page'] + '</code><br>' + item['msg'] + '</div>' +
				'</div>');
			});
		}
	});
	
	// Last error info
	if (chrome.runtime.lastError) {
		$("#last_error").html(chrome.runtime.lastError);
	}
	
	// Version
	$("#app_version").text(chrome.runtime.getManifest().version);
	
	// Timers data
	chrome.alarms.getAll(function(timers) {
		$('#timers_data').html(JSON.stringify(timers, null, 3));
	});
	
	// Permissions
	chrome.storage.local.get(function(local_storage) {
		if (!local_storage['current_api_key']) {
			$("#permissions").text(chrome.i18n.getMessage("didnt_select_api_key"));
		}
		else {
			$("#permissions").text(chrome.i18n.getMessage("loading"));
			
			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/tokeninfo',
				dataType: "json",
				headers: {"Authorization": "Bearer " + local_storage['current_api_key']},
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {					
					$("#permissions").empty();
					
					data['permissions'].forEach(function(item, i, arr) {
						$("#permissions").append('<span class="label label-default">' + item + '</span> ');
					});
				},
				error: function(x, t, m) {					
					if (++this.tryCount <= this.retryLimit) {
						$.ajax(this);
						return;
					}
					
					if (t === "timeout") {
						$("#permissions").html('<span class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</span>');
					}
					else if (x['responseJSON'] && x['responseJSON']['text']) {
						$("#permissions").html('<span class="text-danger text-fl-uppercase">' + x['responseJSON']['text'] + '.</span>');
					}
					else {
						$("#permissions").html('<span class="text-danger">' + chrome.i18n.getMessage("unknown_error") + '</span>');
					}
				}
			});
		}
	});
});

// Reset all timers
$(document).off("click", "#clear_timers").on("click", "#clear_timers", function() {
	chrome.alarms.clearAll(function() {
		chrome.runtime.reload();
	});
});
