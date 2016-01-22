$("document").ready(function() {
	chrome.storage.sync.get(function(sync_storage) {
		if (!sync_storage['current_api_key']) {
			$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("enter_api_key_first") + '</div></div>');
			
			return;
		}
		
		$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>');
		
		$.ajax({
			type: 'GET',
			url: 'https://api.guildwars2.com/v2/commerce/transactions/history/buys',
			data: {"page_size": 200},
			dataType: "json",
			headers: {"Authorization": "Bearer " + sync_storage['current_api_key']},
			timeout: 10000,
			success: function(data, textStatus, XMLHttpRequest) {	
				/* Fix */ if (current_page != "bought") { load_page(current_page, true); return; }
			
				$("#listing").hide().empty().fadeIn(500);
				
				if (!data || data.length == 0) {
					$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("no_buying_history") + '</div></div>');
					
					return;
				}
				
				$("#listing").html('<h1 class="h3 app-title">' + chrome.i18n.getMessage("buying_history") + '</h1>');
				
				$("#listing").append('<div id="remind_notification"></div>');
				remind_to_vote_up("#remind_notification");
				
				var item_ids = [];

				data.forEach(function(item, i, arr) {					
					$("#listing").append('<div class="item-' + item['id'] + ' row">'
						+ '<div class="col-xs-1">'
							+ '<div class="item-icon item-icon-' + item['item_id'] + '"></div>'
						+ '</div>'
						+ '<div class="col-xs-11">'
							+ '<div class="row">'
								+ '<div class="col-xs-6 item-name-' + item['item_id'] + ' text-truncate">' + item['item_id'] + '</div>'
								+ '<div class="col-xs-6"><span class="fa fa-clock-o"></span> ' + time_ago(Date.parse(item['purchased'])) + ' ' + chrome.i18n.getMessage("ago") + '</div>'
								+ '<div class="col-xs-3">' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</div>'
								+ '<div class="col-xs-9">' + format_coins(item['price']) + '</div>'
							+ '</div>'
						+ '</div>'
						+ (data.length - 1 != i ? '<div class="col-xs-12"><hr></div>' : '')
					+ '</div>');
					
					item_ids.push(item['item_id']);
				});
				
				$("#listing").append('<div class="small text-muted m-t-1">' + chrome.i18n.getMessage("number_results", [XMLHttpRequest.getResponseHeader('X-Result-Count'), XMLHttpRequest.getResponseHeader('X-Result-Total')]) + ' ' + chrome.i18n.getMessage("results_are_cached", [time_ago(Date.parse(XMLHttpRequest.getResponseHeader('Date')) - 3000)]) + ' <a class="local-page" data-page="faq/how_it_works"><span class="fa fa-question-circle"></span></a></div>');
				
				load_metadata(item_ids.join(','));
			},
			error: function(x, t, m) {
				/* Fix */ if (current_page != "bought") { load_page(current_page, true); return; }
				
				$("#listing").hide().empty().fadeIn(250);
				
				if (t === "timeout") {
					$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("timeout_error_reload", ["bought"]) + '</div></div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + x['responseJSON']['text'] + '.</div></div>');
				}
				else {
					$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("unknown_error_reload", ["bought"]) + '</div></div>');
				}
			}
		});
	});
});

// Load icons, rarity item names 
function load_metadata(item_ids) {
	chrome.storage.sync.get(function(sync_storage) {
		var language = sync_storage && sync_storage['settings'] && sync_storage['settings']['item_localization'] ? sync_storage['settings']['item_localization'] : "en";
		
		$.ajax({
			type: 'GET',
			url: 'https://api.guildwars2.com/v2/items',
			data: {"ids": item_ids, "lang": language},
			dataType: "json",
			cache: true,
			timeout: 10000,
			success: function(data, textStatus, XMLHttpRequest) {	
				/* Fix */ if (current_page != "bought") { load_page(current_page, true); return; }
			
				data.forEach(function(item, i, arr) {
					$(".item-name-" + item['id']).text(item['name']).addClass("text-rarity-" + item['rarity']).attr("title", item['name']);
					$(".item-icon-" + item['id']).html('<img src="' + item['icon'] + '" alt="icon" title="' + item['name'] + '">');
				});
			},
			error: function(x, t, m) {
				/* Fix */ if (current_page != "bought") { load_page(current_page, true); return; }
						
				if (t === "timeout") {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_metadata") + '</div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
				}
				else {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_metadata", ["bought"]) + '</div>');
				}
			}
		});
	});
}
