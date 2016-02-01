$("document").ready(function() {
	chrome.storage.sync.get(function(sync_storage) {
		chrome.storage.local.get(function(local_storage) {			
			if (!sync_storage['current_api_key']) {
				$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("enter_api_key_first") + '</div></div>');
				
				return;
			}
			
			$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>');
			
			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/commerce/transactions/current/buys',
				data: {"page_size": 200},
				dataType: "json",
				headers: {"Authorization": "Bearer " + sync_storage['current_api_key']},
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {
					/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
					
					$("#listing").hide().empty().fadeIn(250);
					
					if (!data || data.length == 0) {
						$("#listing").html('<div style="display: table; width: 100%"><div class="text-xs-center" style="display: table-cell; vertical-align: middle; height: calc(100vh - 2rem)">' + chrome.i18n.getMessage("no_buying_transactions") + '</div></div>');
						
						return;
					}
					
					$("#listing").html('<h1 class="h3 app-title">' + chrome.i18n.getMessage("buying_list") + '</h1>');
					
					$("#listing").append('<div id="remind_notification"></div>');
					remind_to_vote_up("#remind_notification");
					
					$("#listing").append('<div class="row m-b-1"><div class="col-xs-6"><button type="button" id="track_button" data-act="track" class="btn btn-primary btn-sm btn-block">' + chrome.i18n.getMessage("track_all") + '</button></div><div class="col-xs-6"><button type="button" id="untrack_button" data-act="untrack" class="btn btn-warning btn-sm btn-block">' + chrome.i18n.getMessage("untrack_all") + '</button></div></div>');
					
					var item_ids = [];

					data.forEach(function(item, i, arr) {
						if (sync_storage['settings']['graph_tool'] > 0) {
							var graph_tool_url = create_graph_url(item['item_id'], sync_storage['settings']['graph_tool']);
						}
						
						$("#listing").append('<div id="item-' + item['id'] + '" class="row js-item-block" data-vnum="' + item['item_id'] + '" data-id="' + item['id'] + '" data-count="' + item['quantity'] + '" data-price="' + item['price'] + '">'
						+ '<div class="col-xs-1">'
							+ '<div class="item-icon"></div>'
						+ '</div>'
						+ '<div class="col-xs-10">'
							+ '<div class="row">'
								+ '<div class="col-xs-6 js-item-name text-truncate">' + item['item_id'] + '</div>'
								+ '<div class="col-xs-6"><span class="fa fa-clock-o"></span> ' + time_ago(Date.parse(item['created'])) + ' ' + chrome.i18n.getMessage("ago") + '</div>'
								+ '<div class="col-xs-3">' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</div>'
								+ '<div class="col-xs-4">' + format_coins(item['price']) + '</div>'
								+ '<div class="col-xs-5" title="' + chrome.i18n.getMessage("price_difference_buy") + '"><span class="fa fa-sort-amount-asc"></span> <span class="js-price-range">' + chrome.i18n.getMessage("loading") + '</span></div>'
							+ '</div>'
						+ '</div>'
						+ '<div class="col-xs-1 text-xs-center">'
							+ '<div class="cursor-pointer js-track-this-item' + (typeof local_storage['buying_track_list'][item['id']] !== "undefined" ? ' text-info' : '') + '" title="' + chrome.i18n.getMessage("notify_when_bought") + '">'
								+ '<span class="fa fa-eye"></span>'
							+ '</div>'
							+ (graph_tool_url ? '<div class="cursor-pointer" data-href="' + graph_tool_url + '" title="' + chrome.i18n.getMessage("open_graph_tool") + '">'
								+ '<span class="fa fa-area-chart"></span>'
							+ '</div>' : '')
						+ '</div>'
						+ (data.length - 1 != i ? '<div class="col-xs-12"><hr></div>' : '')
						+ '</div>');
						
						item_ids.push(item['item_id']);
					});
					
					$("#listing").append('<div class="small text-muted m-t-1">' + chrome.i18n.getMessage("number_results", [XMLHttpRequest.getResponseHeader('X-Result-Count'), XMLHttpRequest.getResponseHeader('X-Result-Total')]) + ' ' + chrome.i18n.getMessage("results_are_cached", [time_ago(Date.parse(XMLHttpRequest.getResponseHeader('Date')) - 3000)]) + ' <a class="local-page" data-page="faq/how_it_works"><span class="fa fa-question-circle"></span></a></div>');
					
					load_metadata(item_ids.join(','));
					load_price_range(item_ids.join(','));
				},
				error: function(x, t, m) {
					/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
					
					if (++this.tryCount <= this.retryLimit) {
						$.ajax(this);
						return;
					}
					
					$("#listing").hide().empty().fadeIn(250);
					
					if (t === "timeout") {
						$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("timeout_error_reload", ["buying"]) + '</div></div>');
					}
					else if (x['responseJSON'] && x['responseJSON']['text']) {
						$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + x['responseJSON']['text'] + '.</div></div>');
					}
					else {
						$("#listing").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("unknown_error_reload", ["buying"]) + '</div></div>');
					}
				}
			});
		});
	});
});

// Load icons, rarity item names 
function load_metadata(item_ids) {
	chrome.storage.sync.get(function(sync_storage) {
		var language = sync_storage['settings']['item_localization'];
		
		$.ajax({
			type: 'GET',
			url: 'https://api.guildwars2.com/v2/items',
			data: {"ids": item_ids, "lang": language},
			dataType: "json",
			cache: true,
			timeout: 10000,
			tryCount: 0,
			retryLimit: 3,
			success: function(data, textStatus, XMLHttpRequest) {
				/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
				
				data.forEach(function(item, i, arr) {
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-item-name").text(item['name']).addClass("text-rarity-" + item['rarity']).attr("title", item['name']);
					$(".js-item-block[data-vnum=" + item['id'] + "] .item-icon").html('<img src="' + item['icon'] + '" alt="icon" title="' + item['name'] + '">');
				});
			},
			error: function(x, t, m) {
				/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
				
				if (++this.tryCount <= this.retryLimit) {
					$.ajax(this);
					return;
				}
				
				if (t === "timeout") {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_metadata") + '</div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
				}
				else {
					$("#listing").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_metadata", ["buying"]) + '</div>');
				}
			}
		});
	});
}

function load_price_range(item_ids) {
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/prices',
		data: {"ids": item_ids},
		dataType: "json",
		cache: true,
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {	
			/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
			
			$(".js-item-block").each(function(index) {
				var current_price = $(this).data("price");
				var best_price = data[findIndexByKeyValue(data, "id", $(this).data("vnum"))]['buys']['unit_price'];
				
				$(this).find(".js-price-range").html(format_coins(best_price - current_price));
			});
		},
		error: function(x, t, m) {
			/* Fix */ if (current_page != "buying") { load_page(current_page, true); return; }
			
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_price_range") + '</div>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#listing").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
			}
			else {
				$("#listing").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_price_range", ["buying"]) + '</div>');
			}
		}
	});
}

// Track item
$(document).off("click", ".js-track-this-item").on("click", ".js-track-this-item", function() {
	var el = $(this);
	var var_item_id = $(el).parents(".js-item-block").data("id");
	var var_item_vnum = $(el).parents(".js-item-block").data("vnum");
	var var_item_count = $(el).parents(".js-item-block").data("count");
	var var_item_price = $(el).parents(".js-item-block").data("price");
	
	chrome.storage.local.get(function(local_storage) {
		if (typeof local_storage['buying_track_list'][var_item_id] !== "undefined") {			
			delete local_storage['buying_track_list'][var_item_id];
			
			chrome.storage.local.set({"buying_track_list": local_storage['buying_track_list']}, function() {
				$(el).removeClass("text-info");
			});
		}
		else {			
			local_storage['buying_track_list'][var_item_id] = {
				item_vnum: var_item_vnum,
				item_count: var_item_count,
				item_id: var_item_id,
				item_price: var_item_price
			};
			
			chrome.storage.local.set({"buying_track_list": local_storage['buying_track_list']}, function() {
				$(el).addClass("text-info");
			});
		}
	});
});

// Track/untrack all buttons
$(document).off("click", "#track_button, #untrack_button").on("click", "#track_button, #untrack_button", function() {
	if ($(this).data("act") == "track") {
		var item_array = {};
		
		$(".js-item-block").each(function(index) {
			var el = $(this);
			var var_item_id = $(el).data("id");
			var var_item_vnum = $(el).data("vnum");
			var var_item_count = $(el).data("count");
			var var_item_price = $(el).data("price");
			
			item_array[var_item_id] = {
				item_vnum: var_item_vnum,
				item_count: var_item_count,
				item_id: var_item_id,
				item_price: var_item_price
			};
		});
		
		chrome.storage.local.set({"buying_track_list": item_array}, function() {
			$(".js-track-this-item").not('.text-info').addClass("text-info");
		});
	}
	else {			
		chrome.storage.local.set({"buying_track_list": {}}, function() {
			$(".js-track-this-item").filter(".text-info").removeClass("text-info");
		});
	}
});
