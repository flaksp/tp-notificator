$("document").ready(function() {
	chrome.storage.local.get(function(local_storage) {
		cbf.storage.sync.get(function(sync_storage) {
			if (!local_storage['current_api_key']) {
				$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("enter_api_key_first") + '</div></div>');

				return;
			}

			$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>');

			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/commerce/transactions/history/buys',
				data: {
					"page_size": 200
				},
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + local_storage['current_api_key']
				},
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {
					$("#bought_content").hide().empty().fadeIn(500);

					if (!data || data.length == 0) {
						$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("no_buying_history") + '</div></div>');

						return;
					}

					$("#bought_content").html('<h1 class="h3 app-title">' + chrome.i18n.getMessage("buying_history") + '</h1>');

					// Remind user to vote for the extension in store
					if (sync_storage['vote_remind'] === false && sync_storage['install_date'] + 60 * 60 * 24 * 14 * 1000 < Date.now()) {
						$("#bought_content").append('<div class="alert alert-info alert-dismissible fade in" id="vote_reminder_alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("vote_reminder", ['https://' + chrome.i18n.getMessage(browser_info['name'] + "_url")]) + '</div>');
					}

					var item_ids = [];

					$("#bought_content").append(
						'<div class="row">' +
						'<div class="col-xs-4 text-xs-center">' +
						'<div class="h4">1 ' + chrome.i18n.getMessage("days") + '</div>' +
						'<span id="profit-1-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-4 text-xs-center">' +
						'<div class="h4">7 ' + chrome.i18n.getMessage("days") + '</div>' +
						'<span id="profit-7-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-4 text-xs-center">' +
						'<div class="h4">14 ' + chrome.i18n.getMessage("days") + '</div>' +
						'<span id="profit-14-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-6 text-xs-center">' +
						'<div class="h4">30 ' + chrome.i18n.getMessage("days") + '</div>' +
						'<span id="profit-30-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-6 text-xs-center">' +
						'<div class="h4">90 ' + chrome.i18n.getMessage("days") + '</div>' +
						'<span id="profit-90-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'</div>' +
						'<hr>'
					);

					data.forEach(function(item, i, arr) {
						$("#bought_content").append(
							'<div class="row js-item-block" id="item-' + item['id'] + '" data-vnum="' + item['item_id'] + '">' +
							'<div class="col-xs-1">' +
							'<div class="item-icon"></div>' +
							'</div>' +
							'<div class="col-xs-11">' +
							'<div class="row">' +
							'<div class="col-xs-5 js-item-name text-truncate">' + item['item_id'] + '</div>' +
							'<div class="col-xs-2 text-xs-right">' +
							'<span class="cursor-pointer js-copy-code js-clipboard" data-balloon="' + chrome.i18n.getMessage("copy_code") + '" data-balloon-pos="up" hidden>' +
							'<span class="fa fa-code"></span>' +
							'</span>&nbsp;&nbsp;' +
							'<span class="cursor-pointer js-copy-name js-clipboard" data-balloon="' + chrome.i18n.getMessage("copy_name") + '" data-balloon-pos="up" hidden>' +
							'<span class="fa fa-files-o"></span>' +
							'</span>' +
							'</div>' +
							'<div class="col-xs-4">' +
							'<span class="fa fa-clock-o"></span> ' +
							time_ago(Date.parse(item['purchased'])) + ' ' + chrome.i18n.getMessage("ago") +
							'</div>' +
							'<div class="col-xs-1"></div>' +



							'<div class="col-xs-2">' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</div>' +
							'<div class="col-xs-4">' + format_coins(item['price']) + '</div>' +
							'<div class="col-xs-1 text-xs-right">' +
							'<span class="cursor-pointer js-detailed-info" data-balloon="' + chrome.i18n.getMessage("detailed_info") + '" data-balloon-pos="down" hidden>' +
							'<span class="fa fa-info-circle"></span>' +
							'</span>' +
							'</div>' +
							'<div class="col-xs-1"></div>' +
							'</div>' +
							'</div>' +
							(data.length - 1 != i ? '<div class="col-xs-12"><hr></div>' : '') +
							'</div>'
						);

						item_ids.push(item['item_id']);
					});

					$("#bought_content").append('<div class="small text-muted m-t-1">' + chrome.i18n.getMessage("number_results", [XMLHttpRequest.getResponseHeader('X-Result-Count'), XMLHttpRequest.getResponseHeader('X-Result-Total')]) + ' ' + chrome.i18n.getMessage("results_are_cached", [time_ago(Date.parse(XMLHttpRequest.getResponseHeader('Date')) - 3000)]) + ' <a data-local-page="faq/how_it_works"><span class="fa fa-question-circle"></span></a></div>');

					load_metadata(item_ids.join(','));

					// Calcuating total profit
					deep_ajax_load({
						"url": 'https://api.guildwars2.com/v2/commerce/transactions/history/buys',
						"api_key": local_storage['current_api_key'],
						"local_page": "bought",
						"api_page": 0
					}, function(stat, data) {
						if (stat == "fail") {
							if (data[1] === "timeout") {
								$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(chrome.i18n.getMessage("connection_timeout"));
							} else if (data[0]['responseJSON'] && data[0]['responseJSON']['text']) {
								$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(data[0]['responseJSON']['text']);
							} else {
								$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(chrome.i18n.getMessage("unknown_error"));
							}

							return;
						}

						var total_profit = {
							1: 0,
							7: 0,
							14: 0,
							30: 0,
							90: 0
						};

						data.forEach(function(item, i, arr) {
							var date = Date.parse(item['purchased']);

							if (date + 1000 * 60 * 60 * 24 * 1 >= Date.now()) {
								total_profit[1] += item['price'] * item['quantity'];
							}

							if (date + 1000 * 60 * 60 * 24 * 7 >= Date.now()) {
								total_profit[7] += item['price'] * item['quantity'];
							}

							if (date + 1000 * 60 * 60 * 24 * 14 >= Date.now()) {
								total_profit[14] += item['price'] * item['quantity'];
							}

							if (date + 1000 * 60 * 60 * 24 * 30 >= Date.now()) {
								total_profit[30] += item['price'] * item['quantity'];
							}

							total_profit[90] += item['price'] * item['quantity'];
						});

						$("#profit-1-days").html(format_coins(total_profit[1]));
						$("#profit-7-days").html(format_coins(total_profit[7]));
						$("#profit-14-days").html(format_coins(total_profit[14]));
						$("#profit-30-days").html(format_coins(total_profit[30]));
						$("#profit-90-days").html(format_coins(total_profit[90]));
					});

					// Append modal
					$("#bought_content").append(
						'<div class="modal fade" id="lot-details" tabindex="-1" role="dialog" aria-labelledby="lot-details-title" aria-hidden="true">' +
						'<div class="modal-dialog" role="document">' +
						'<div class="modal-content">' +
						'<div class="modal-header">' +
						'<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
						'<span aria-hidden="true">&times;</span>' +
						'</button>' +
						'<h2 class="h4 modal-title text-truncate" id="lot-details-title">Modal title</h2>' +
						'</div>' +
						'<div class="modal-body">' +
						'<div class="row">' +
						'<div class="col-xs-2">' +
						'<div class="item-icon item-icon--lg" id="lot-details-icon"></div>' +
						'</div>' +
						'<div class="col-xs-10">' +
						'<b>' + chrome.i18n.getMessage("level") + ': <span id="lot-details-level"></span></b>. <span id="lot-details-description"></span>' +
						'</div>' +
						'<div class="col-xs-12">' +
						'<div id="lot-details-chart" class="m-t-1" style="margin: 0 -.9375rem"></div>' +
						'</div>' +
						'</div>' +
						'<div class="row m-t-1">' +
						'<div class="col-xs-6">' +
						'<h3 class="h4">' + chrome.i18n.getMessage("selling_orders") + ':</h3>' +
						'<ul class="list-unstyled m-b-0 small" id="lot-details-sells"></ul>' +
						'</div>' +
						'<div class="col-xs-6">' +
						'<h3 class="h4">' + chrome.i18n.getMessage("buying_orders") + ':</h3>' +
						'<ul class="list-unstyled m-b-0 small" id="lot-details-buys"></ul>' +
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

					$("#bought_content").hide().empty().fadeIn(250);

					if (t === "timeout") {
						$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("timeout_error_reload", ["bought"]) + '</div></div>');
					} else if (x['responseJSON'] && x['responseJSON']['text']) {
						$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + x['responseJSON']['text'] + '.</div></div>');
					} else {
						$("#bought_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("unknown_error_reload", ["bought"]) + '</div></div>');
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
			data: {
				"ids": item_ids,
				"lang": local_storage['item_localization']
			},
			dataType: "json",
			cache: true,
			timeout: 10000,
			tryCount: 0,
			retryLimit: 3,
			success: function(data, textStatus, XMLHttpRequest) {
				data.forEach(function(item, i, arr) {
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-item-name").html('<a href="http://wiki.guildwars2.com/index.php?search=' + item['name'] + '">' + item['name'] + '</a>').addClass("item-rarity item-rarity--" + item['rarity']).attr("title", item['name']);
					$(".js-item-block[data-vnum=" + item['id'] + "] .item-icon").html('<img src="' + item['icon'] + '" alt="icon" class="img-rounded">');

					// clipboard.js isn't working well with data() function
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-copy-name").attr('data-clipboard-text', item['name']).removeAttr('hidden');
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-copy-code").attr('data-clipboard-text', item['chat_link']).removeAttr('hidden');

					$(".js-item-block[data-vnum=" + item['id'] + "] .js-detailed-info").removeAttr('hidden');

					var i_description = (typeof item['description'] === "undefined" ? '' : item['description']).replace('<c=@flavor>', '').replace('</c>', '');
					$(".js-item-block[data-vnum=" + item['id'] + "]").data('description', i_description);
					$(".js-item-block[data-vnum=" + item['id'] + "]").data('level', item['level']);
				});
			},
			error: function(x, t, m) {
				if (++this.tryCount <= this.retryLimit) {
					$.ajax(this);
					return;
				}

				if (t === "timeout") {
					$("#bought_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_metadata") + '</div>');
				} else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#bought_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
				} else {
					$("#bought_content").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_metadata", ["bought"]) + '</div>');
				}
			}
		});
	});
}

// Detailed info
$(document).off("click", ".js-detailed-info").on("click", ".js-detailed-info", function() {
	var _this = $(this);

	$('#lot-details-buys').empty();
	$('#lot-details-sells').empty();
	$('#lot-details-icon').empty();
	$('#lot-details-level').empty();
	$('#lot-details-description').empty();
	$('#lot-details-chart').html('<div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div>');

	$('#lot-details-title').text($(_this).parents(".js-item-block").find('.js-item-name').text());
	$('#lot-details-icon').html($(_this).parents(".js-item-block").find('.item-icon').html());
	$('#lot-details-level').text($(_this).parents(".js-item-block").data('level'));
	$('#lot-details-description').text($(_this).parents(".js-item-block").data('description'));

	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/listings',
		data: {
			"ids": $(_this).parents(".js-item-block").data('vnum')
		},
		dataType: "json",
		cache: true,
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {
			data[0]['buys'].forEach(function(item, i, arr) {
				$('#lot-details-buys').append('<li>' + format_coins(item['unit_price']) + ' &bull; ' + item['listings'] + ' ' + chrome.i18n.getMessage("orders") + '; ' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</li>');
			});

			data[0]['sells'].forEach(function(item, i, arr) {
				$('#lot-details-sells').append('<li>' + format_coins(item['unit_price']) + ' &bull; ' + item['listings'] + ' ' + chrome.i18n.getMessage("orders") + '; ' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</li>');
			});

			$('#lot-details').modal('show');

			$('#lot-details').off('shown.bs.modal').on('shown.bs.modal', function() {
				build_price_chart('#lot-details-chart', $(_this).parents(".js-item-block").data('vnum'));
			});
		},
		error: function(x, t, m) {
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}

			$('#lot-details-chart').html('<div class="test-xs-center">' + chrome.i18n.getMessage("error") + '</div>');
		}
	});
});
