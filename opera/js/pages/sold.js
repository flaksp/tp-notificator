$("document").ready(function() {
	chrome.storage.local.get(function(local_storage) {
		if (!local_storage['current_api_key']) {
			$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("enter_api_key_first") + '</div></div>');
			
			return;
		}
		
		$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>');
		
		$.ajax({
			type: 'GET',
			url: 'https://api.guildwars2.com/v2/commerce/transactions/history/sells',
			data: {"page_size": 200},
			dataType: "json",
			headers: {"Authorization": "Bearer " + local_storage['current_api_key']},
			timeout: 10000,
			tryCount: 0,
			retryLimit: 3,
			success: function(data, textStatus, XMLHttpRequest) {					
				$("#sold_content").hide().empty().fadeIn(500);
				
				if (!data || data.length == 0) {
					$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("no_selling_history") + '</div></div>');
					
					return;
				}
				
				$("#sold_content").html('<h1 class="h3 app-title">' + chrome.i18n.getMessage("selling_history") + '</h1>');
				
				// Remind user to vote for the extension in store
				if (local_storage['vote_remind'] === false && local_storage['install_date'] + 60 * 60 * 24 * 14 * 1000 < Date.now()) {
					$("#sold_content").append('<div class="alert alert-info alert-dismissible fade in" id="vote_reminder_alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("vote_reminder") + '</div>');
				}
				
				// Headhunt for translator
				if (local_storage['translator_notice'] === false && chrome.i18n.getMessage("locale") == "ru") {
					$("#sold_content").append('<div class="alert alert-info alert-dismissible fade in" id="translator_notice_alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Расширению очень срочно требуется человек, который владеет английским языком лучше, чем утренним стояком. Подробнее <a class="local-page alert-link" data-page="translations">вот тут</a>. Если вы не заинтересованы, можете просто скрыть это уведомление :(</div>');
				}
				
				var item_ids = [];
				
				$("#sold_content").append(
					'<div class="row">' +
						'<div class="col-xs-4 text-xs-center">' +
							'<div class="lead">1 ' + chrome.i18n.getMessage("days") + '</div>' +
							'<span id="profit-1-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-4 text-xs-center">' +
							'<div class="lead">7 ' + chrome.i18n.getMessage("days") + '</div>' +
							'<span id="profit-7-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-4 text-xs-center">' +
							'<div class="lead">14 ' + chrome.i18n.getMessage("days") + '</div>' +
							'<span id="profit-14-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-6 text-xs-center">' +
							'<div class="lead">30 ' + chrome.i18n.getMessage("days") + '</div>' +
							'<span id="profit-30-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
						'<div class="col-xs-6 text-xs-center">' +
							'<div class="lead">90 ' + chrome.i18n.getMessage("days") + '</div>' +
							'<span id="profit-90-days">' + chrome.i18n.getMessage("loading") + '</span>' +
						'</div>' +
					'</div>' +
					'<hr>'
				);

				data.forEach(function(item, i, arr) {					
					$("#sold_content").append(
						'<div class="row js-item-block" id="item-' + item['id'] + '" data-vnum="' + item['item_id'] + '">' +
							'<div class="col-xs-1">' +
								'<div class="item-icon"></div>' +
							'</div>' +
							'<div class="col-xs-11">' +
								'<div class="row">' +
									'<div class="col-xs-8 js-item-name text-truncate">' + item['item_id'] + '</div>' +
									'<div class="col-xs-4">' +
										'<span class="fa fa-clock-o"></span> ' +
										time_ago(Date.parse(item['purchased'])) + ' ' + chrome.i18n.getMessage("ago") +
									'</div>' +
									'<div class="col-xs-3">' + item['quantity'] + ' ' + chrome.i18n.getMessage("items") + '</div>' +
									'<div class="col-xs-9">' + format_coins(item['price']) + '</div>' +
								'</div>' +
							'</div>' +
							(data.length - 1 != i ? '<div class="col-xs-12"><hr></div>' : '') +
						'</div>'
					);
					
					item_ids.push(item['item_id']);
				});
				
				$("#sold_content").append('<div class="small text-muted m-t-1">' + chrome.i18n.getMessage("number_results", [XMLHttpRequest.getResponseHeader('X-Result-Count'), XMLHttpRequest.getResponseHeader('X-Result-Total')]) + ' ' + chrome.i18n.getMessage("results_are_cached", [time_ago(Date.parse(XMLHttpRequest.getResponseHeader('Date')) - 3000)]) + ' <a class="local-page" data-page="faq/how_it_works"><span class="fa fa-question-circle"></span></a></div>');
				
				load_metadata(item_ids.join(','));
				
				// Calcuating total profit
				deep_ajax_load({
					"url": 'https://api.guildwars2.com/v2/commerce/transactions/history/sells',
					"api_key": local_storage['current_api_key'],
					"local_page": "sold",
					"api_page": 0
				}, function(stat, data) {
					if (stat == "fail") {
						if (data[1] === "timeout") {
							$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(chrome.i18n.getMessage("connection_timeout"));
						}
						else if (data[0]['responseJSON'] && data[0]['responseJSON']['text']) {
							$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(data[0]['responseJSON']['text']);
						}
						else {
							$("#profit-1-days, #profit-7-days, #profit-14-days, #profit-30-days, #profit-90-days").html(chrome.i18n.getMessage("unknown_error"));
						}
						
						return;
					}
					
					var total_profit = {
						1:  0,
						7:  0,
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
			},
			error: function(x, t, m) {					
				if (++this.tryCount <= this.retryLimit) {
					$.ajax(this);
					return;
				}
				
				$("#sold_content").hide().empty().fadeIn(250);
				
				if (t === "timeout") {
					$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("timeout_error_reload", ["sold"]) + '</div></div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + x['responseJSON']['text'] + '.</div></div>');
				}
				else {
					$("#sold_content").html('<div class="fluid-vp-wrapper"><div class="text-xs-center">' + chrome.i18n.getMessage("unknown_error_reload", ["sold"]) + '</div></div>');
				}
			}
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
					$(".js-item-block[data-vnum=" + item['id'] + "] .js-item-name").text(item['name']).addClass("text-rarity-" + item['rarity']).attr("title", item['name']);
					$(".js-item-block[data-vnum=" + item['id'] + "] .item-icon").html('<img src="' + item['icon'] + '" alt="icon" title="' + item['name'] + '">');
				});
			},
			error: function(x, t, m) {				
				if (++this.tryCount <= this.retryLimit) {
					$.ajax(this);
					return;
				}
			
				if (t === "timeout") {
					$("#sold_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> ' + chrome.i18n.getMessage("timeout_error_metadata") + '</div>');
				}
				else if (x['responseJSON'] && x['responseJSON']['text']) {
					$("#sold_content").append('<div class="alert alert-danger m-t-1" role="alert"><strong>' + chrome.i18n.getMessage("error") + '.</strong> <span class="text-fl-uppercase">' + x['responseJSON']['text'] + '</span>.</div>');
				}
				else {
					$("#sold_content").append('<div class="alert alert-danger m-t-1" role="alert">' + chrome.i18n.getMessage("unknown_error_metadata", ["sold"]) + '</div>');
				}
			}
		});
	});
}
