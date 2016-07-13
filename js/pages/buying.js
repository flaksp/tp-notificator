$("document").ready(function() {
	chrome.storage.local.get(function(local_storage) {
		cbf.storage.sync.get(function(sync_storage) {
			if (!local_storage['current_api_key']) {
				$("#buying_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("enter_api_key_first") + '</div></div>');
				
				return;
			}
			
			$("#buying_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>');
			
			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/commerce/transactions/current/buys',
				data: {"page_size": 200},
				dataType: "json",
				headers: {"Authorization": "Bearer " + local_storage['current_api_key']},
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {
					$("#buying_content").hide().empty().fadeIn(250);
					
					if (!data || data.length == 0) {
						$("#buying_content").html('<div style="display: table; width: 100%"><div class="text-xs-center" style="display: table-cell; vertical-align: middle; height: calc(100vh - 2rem)">' + chrome.i18n.getMessage("no_buying_transactions") + '</div></div>');
						
						return;
					}
					
					$("#buying_content").html('<h1 class="h3 app-title">' + chrome.i18n.getMessage("buying_list") + '</h1>');
					
					// Remind user to vote for the extension in store
					if (sync_storage['vote_remind'] === false && sync_storage['install_date'] + 60 * 60 * 24 * 14 * 1000 < Date.now()) {
						$("#buying_content").append('<div class="alert alert-info alert-dismissible fade in" id="vote_reminder_alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("vote_reminder", ['https://' + chrome.i18n.getMessage(browser_info['name'] + "_url")]) + '</div>');
					}
					
					var item_ids = [];
					var total_price = 0;
					
					$("#buying_content").append(
						'<div class="row" id="two-track-buttons">' +
							'<div class="col-xs-6">' +
								'<button type="button" id="track_button" data-act="track" class="btn btn-primary btn-sm btn-block">' + 
									chrome.i18n.getMessage("track_all") + 
								'</button>' +
							'</div>' +
							'<div class="col-xs-6">' +
								'<button type="button" id="untrack_button" data-act="untrack" class="btn btn-warning btn-sm btn-block">' +
									chrome.i18n.getMessage("untrack_all") +
								'</button>' +
							'</div>' +
							'<div class="col-xs-12">' +
								'<hr>' +
							'</div>' +
						'</div>'
					);
					
					$("#buying_content").append(
						chrome.i18n.getMessage("spent_to_all_transactions") + ': ' +
						'<span id="total-profit"></span>' +
						'<hr>'
					);

					data.forEach(function(item, i, arr) {
						total_price += item['price'] * item['quantity'];
						
						$("#buying_content").append('<div id="item-' + item['id'] + '" class="row js-item-block" data-vnum="' + item['item_id'] + '" data-id="' + item['id'] + '" data-count="' + item['quantity'] + '" data-price="' + item['price'] + '">' +
							'<div class="col-xs-1">' +
								'<div class="item-icon"></div>' +
							'</div>' +
							'<div class="col-xs-11">' +
								'<div class="row">' +
									'<div class="col-xs-5 js-item-name text-truncate">' + item['item_id'] + '</div>' +
									'<div class="col-xs-2 text-xs-right">' +
										'<span class="cursor-pointer js-copy-code js-clipboard" title="' + chrome.i18n.getMessage("copy_code") + '" hidden>' +
											'<span class="fa fa-code"></span>' +
										'</span>&nbsp;&nbsp;' +
										'<span class="cursor-pointer js-copy-name js-clipboard" title="' + chrome.i18n.getMessage("copy_name") + '" hidden>' +
											'<span class="fa fa-files-o"></span>' +
										'</span>' +
									'</div>' +
									'<div class="col-xs-4">' +
										'<span class="fa fa-clock-o"></span> ' +
										time_ago(Date.parse(item['created'])) + ' ' + chrome.i18n.getMessage("ago") +
									'</div>' +
									'<div class="col-xs-1 text-xs-center">' +
										'<div class="cursor-pointer js-track-this-item" title="' + chrome.i18n.getMessage("notify_when_bought") + '">' +
											'<span class="fa fa-eye"></span>' +
										'</div>' +
									'</div>' +
									
									
									'<div class="col-xs-3">' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</div>' +
									'<div class="col-xs-3">' + format_coins(item['price']) + '</div>' +
									'<div class="col-xs-1 text-xs-right">' +
										'<span class="cursor-pointer js-detailed-info" title="' + chrome.i18n.getMessage("detailed_info") + '" hidden>' +
											'<span class="fa fa-info-circle"></span>' +
										'</span>' +
									'</div>' +
									'<div class="col-xs-4" title="' + chrome.i18n.getMessage("price_difference_buy") + '">' +
										'<span class="fa fa-sort-amount-asc"></span> ' +
										'<span class="js-price-range">' + chrome.i18n.getMessage("loading") + '</span>' +
									'</div>' +
									'<div class="col-xs-1 text-xs-center">' +
										'<a class="text-color-black js-graph-tool" title="' + chrome.i18n.getMessage("open_graph_tool") + '">' +
											'<span class="fa fa-area-chart"></span>' +
										'</a>' +
									'</div>' +
								'</div>' +
							'</div>' +
							(data.length - 1 != i ? '<div class="col-xs-12"><hr></div>' : '') +
						'</div>');
						
						item_ids.push(item['item_id']);
					});
					
					// Displaying total price
					$("#total-profit").html(format_coins(total_price));
					
					// Build graph tool links
					if (local_storage['graph_tool'] > 0) {						
						$(".js-item-block").each(function(index) {
							var graph_tool_url = create_graph_url($(this).data("vnum"), local_storage['graph_tool']);
							$(this).find(".js-graph-tool").attr("href", graph_tool_url);
						});
					}
					else {
						$(".js-graph-tool").attr("hidden", true);
					}
					
					// Mark eye buttons pressed
					if (local_storage['algorithm'] == 0 || local_storage['algorithm'] == 2) {						
						$(".js-item-block").each(function(index) {
							if (typeof local_storage['buying_track_list'][parseInt($(this).data("id"))] !== "undefined") {
								$(this).find(".js-track-this-item").addClass("text-info");
							}
						});
					}
					else {
						$(".js-track-this-item, #two-track-buttons").attr("hidden", true);
					}
					
					$("#buying_content").append('<div class="small text-muted m-t-1">' + chrome.i18n.getMessage("number_results", [XMLHttpRequest.getResponseHeader('X-Result-Count'), XMLHttpRequest.getResponseHeader('X-Result-Total')]) + ' ' + chrome.i18n.getMessage("results_are_cached", [time_ago(Date.parse(XMLHttpRequest.getResponseHeader('Date')) - 3000)]) + ' <a data-local-page="faq/how_it_works"><span class="fa fa-question-circle"></span></a></div>');
					
					load_metadata(item_ids.join(','));
					load_price_range(item_ids.join(','));
					
					// Append modal
					$("#buying_content").append(
						'<div class="modal fade" id="lot-details" tabindex="-1" role="dialog" aria-labelledby="lot-details-title" aria-hidden="true">' +
							'<div class="modal-dialog" role="document">' +
								'<div class="modal-content">' +
									'<div class="modal-header">' +
										'<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
											'<span aria-hidden="true">&times;</span>' +
										'</button>' +
										'<h2 class="h4 modal-title" id="lot-details-title">Modal title</h2>' +
									'</div>' +
									'<div class="modal-body">' +
										'<div class="row m-b-2">' +
											'<div class="col-xs-2">' +
												'<div class="item-icon item-icon--lg" id="lot-details-icon"></div>' +
											'</div>' +
											'<div class="col-xs-10">' +
												'<b>' + chrome.i18n.getMessage("level") + ': <span id="lot-details-level"></span></b>. <span id="lot-details-description"></span>' +
											'</div>' +
										'</div>' +
										'<div class="row">' +
											'<div class="col-xs-6">' +
												'<h3 class="h4">' + chrome.i18n.getMessage("selling_orders") + ':</h3>' +
												'<ul class="list-unstyled" id="lot-details-sells"></ul>' +
											'</div>' +
											'<div class="col-xs-6">' +
												'<h3 class="h4">' + chrome.i18n.getMessage("buying_orders") + ':</h3>' +
												'<ul class="list-unstyled" id="lot-details-buys"></ul>' +
											'</div>' +
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>'
					);
				},
				error: function(x, t, m) {
					if (++this.tryCount <= this.retryLimit) {
						$.ajax(this);
						return;
					}
					
					$("#buying_content").hide().empty().fadeIn(250);
					
					if (t === "timeout") {
						$("#buying_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("timeout_error_reload", ["buying"]) + '</div></div>');
					}
					else if (x['responseJSON'] && x['responseJSON']['text']) {
						$("#buying_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + x['responseJSON']['text'] + '.</div></div>');
					}
					else {
						$("#buying_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("unknown_error_reload", ["buying"]) + '</div></div>');
					}
				}
			});
		});
	});
});

// Load icons, rarity item names 
function load_metadata(item_ids) {
	chrome.storage.local.get(function(local_storage) {
		$.ajax({
			type: 'GET',
			url: 'https://api.guildwars2.com/v2/items',
			data: {"ids": item_ids, "lang": local_storage['item_localization']},
			dataType: "json",
			cache: true,
			timeout: 10000,
			tryCount: 0,
			retryLimit: 3,
			success: function(data, textStatus, XMLHttpRequest) {
				data.forEach(function(item, i, arr) {
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-item-name").html('<a href="http://wiki.guildwars2.com/index.php?search=' + item['name'] + '">' + item['name'] + '</a>').addClass("item-rarity item-rarity--" + item['rarity']).attr("title", item['name']);
					$(".js-item-block[data-vnum=" + item['id'] + "] .item-icon").html('<img src="' + item['icon'] + '" alt="icon" title="' + item['name'] + '">');
					
					// clipboard.js isn't working well with data() function
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-copy-name").attr('data-clipboard-text', item['name']).removeAttr('hidden');
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-copy-code").attr('data-clipboard-text', item['chat_link']).removeAttr('hidden');
					
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-detailed-info").removeAttr('hidden');
					
					$(".js-item-block[data-vnum=" + item['id'] + "]").data('description', item['description']);
					$(".js-item-block[data-vnum=" + item['id'] + "]").data('level', item['level']);
				});
			},
			error: function(x, t, m) {
				if (++this.tryCount <= this.retryLimit) {
					$.ajax(this);
					return;
				}
				
				if (t === "timeout") {
					$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_metadata") + '</div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
				}
				else {
					$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_metadata", ["buying"]) + '</div>');
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
			$(".js-item-block").each(function(index) {
				var current_price = $(this).data("price");
				var best_price = data[findIndexByKeyValue(data, "id", $(this).data("vnum"))]['buys']['unit_price'];
				var price_range = best_price - current_price;
				
				$(this).find(".js-price-range").html(format_coins(price_range));
				
				if (price_range > 0) {
					$(this).find(".js-price-range").addClass("text-danger");
				}
			});
		},
		error: function(x, t, m) {
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_price_range") + '</div>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
			}
			else {
				$("#buying_content").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_price_range", ["buying"]) + '</div>');
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
				item_vnum: parseInt(var_item_vnum),
				item_count: parseInt(var_item_count),
				item_id: parseInt(var_item_id),
				item_price: parseInt(var_item_price)
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
				item_vnum: parseInt(var_item_vnum),
				item_count: parseInt(var_item_count),
				item_id: parseInt(var_item_id),
				item_price: parseInt(var_item_price)
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

// Detailed info
$(document).off("click", ".js-detailed-info").on("click", ".js-detailed-info", function() {
	var _this = $(this);
	
	$('#lot-details-buys').empty();
	$('#lot-details-sells').empty();
	$('#lot-details-icon').empty();
	$('#lot-details-level').empty();
	$('#lot-details-description').empty();
	
	$('#lot-details-title').text($(_this).parents(".js-item-block").find('.js-item-name').text());
	$('#lot-details-icon').html($(_this).parents(".js-item-block").find('.item-icon').html());
	$('#lot-details-level').text($(_this).parents(".js-item-block").data('level'));
	$('#lot-details-description').text($(_this).parents(".js-item-block").data('description'));
	
	var my_price = $(_this).parents(".js-item-block").data('price');
	
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/listings',
		data: {"ids": $(_this).parents(".js-item-block").data('vnum')},
		dataType: "json",
		cache: true,
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {			
			data[0]['buys'].forEach(function(item, i, arr) {
				if (my_price == item['unit_price']) {
					$('#lot-details-buys').append('<li><mark>' + format_coins(item['unit_price']) + ' &bull; ' + item['listings'] + ' ' + chrome.i18n.getMessage("orders") + ' &bull; ' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</mark></li>');
				}
				else {
					$('#lot-details-buys').append('<li>' + format_coins(item['unit_price']) + ' &bull; ' + item['listings'] + ' ' + chrome.i18n.getMessage("orders") + ' &bull; ' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</li>');
				}
			});
			
			data[0]['sells'].forEach(function(item, i, arr) {
				$('#lot-details-sells').append('<li>' + format_coins(item['unit_price']) + ' &bull; ' + item['listings'] + ' ' + chrome.i18n.getMessage("orders") + ' &bull; ' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</li>');
			});
			
			$('#lot-details').modal('show');
		},
		error: function(x, t, m) {				
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
		}
	});
});
