$("document").ready(function() {
	var template = Handlebars.compile($("#currency_exchange").html());
	$("main").html(template());
	
	chrome.storage.local.get(function(local_storage) {
		if (local_storage['graph_tool'] > 0) {
			$("h1").append('<a class="pull-xs-right" href="' + create_graph_gem_url(local_storage['graph_tool']) + '" data-balloon="' + chrome.i18n.getMessage("open_graph_tool") + '" data-balloon-pos="left"><span class="fa fa-area-chart"></span></a>');
		}
	});
	
	chrome.storage.local.get(function(local_storage) {
		$("#set-gem-price").val(local_storage['notify_for_400_gems']);
		$("#set-gold-price").val(local_storage['notify_for_10_gold']);
	});
	
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/exchange/coins?quantity=1000000',
		dataType: "json",
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {			
			$("#gems-400-buy").html(format_coins(Math.round(400 / data['quantity'] * 1000000)));
			$("#gems-800-buy").html(format_coins(Math.round(800 / data['quantity'] * 1000000)));
			$("#gems-1200-buy").html(format_coins(Math.round(1200 / data['quantity'] * 1000000)));
			$("#gems-2000-buy").html(format_coins(Math.round(2000 / data['quantity'] * 1000000)));
		},
		error: function(x, t, m) {			
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#gems-400-buy, #gems-800-buy, #gems-1200-buy, #gems-2000-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</span>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#gems-400-buy, #gems-800-buy, #gems-1200-buy, #gems-2000-buy").html('<span class="text-danger text-fl-uppercase">' + x['responseJSON']['text'] + '.</span>');
			}
			else {
				$("#gems-400-buy, #gems-800-buy, #gems-1200-buy, #gems-2000-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("unknown_error") + '</span>');
			}
		}
	});
	
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/exchange/gems?quantity=2000',
		dataType: "json",
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {			
			$("#gold-10-buy").html(Math.round(10 / data['quantity'] * 2000 * 10000) + ' <span class="gem"></span>');
			$("#gold-50-buy").html(Math.round(50 / data['quantity'] * 2000 * 10000) + ' <span class="gem"></span>');
			$("#gold-100-buy").html(Math.round(100 / data['quantity'] * 2000 * 10000) + ' <span class="gem"></span>');
			$("#gold-250-buy").html(Math.round(250 / data['quantity'] * 2000 * 10000) + ' <span class="gem"></span>');
			
			var dollar_10_g = (0.0125 * (10 / data['quantity'] * 2000 * 10000)).toFixed(2);
			var dollar_50_g = (0.0125 * (50 / data['quantity'] * 2000 * 10000)).toFixed(2);
			var dollar_100_g = (0.0125 * (100 / data['quantity'] * 2000 * 10000)).toFixed(2);
			var dollar_250_g = (0.0125 * (250 / data['quantity'] * 2000 * 10000)).toFixed(2);
			
			$("#dollar-10-gold").html(dollar_10_g + '$ / ' + dollar_10_g + '€');
			$("#dollar-50-gold").html(dollar_50_g + '$ / ' + dollar_50_g + '€');
			$("#dollar-100-gold").html(dollar_100_g + '$ / ' + dollar_100_g + '€');
			$("#dollar-250-gold").html(dollar_250_g + '$ / ' + dollar_250_g + '€');
			
			$("#ruble-10-gold").html((0.875 * (10 / data['quantity'] * 2000 * 10000)).toFixed(2) + '₽');
			$("#ruble-50-gold").html((0.875 * (50 / data['quantity'] * 2000 * 10000)).toFixed(2) + '₽');
			$("#ruble-100-gold").html((0.875 * (100 / data['quantity'] * 2000 * 10000)).toFixed(2) + '₽');
			$("#ruble-250-gold").html((0.875 * (250 / data['quantity'] * 2000 * 10000)).toFixed(2) + '₽');
			
			$("#pound-10-gold").html((0.010625 * (10 / data['quantity'] * 2000 * 10000)).toFixed(2) + '£');
			$("#pound-50-gold").html((0.010625 * (50 / data['quantity'] * 2000 * 10000)).toFixed(2) + '£');
			$("#pound-100-gold").html((0.010625 * (100 / data['quantity'] * 2000 * 10000)).toFixed(2) + '£');
			$("#pound-250-gold").html((0.010625 * (250 / data['quantity'] * 2000 * 10000)).toFixed(2) + '£');
		},
		error: function(x, t, m) {
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</span>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger text-fl-uppercase">' + x['responseJSON']['text'] + '.</span>');
			}
			else {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("unknown_error") + '</span>');
			}
		}
	});

	$.ajax({
		type: 'GET',
		url: 'https://www.gw2shinies.com/api/json/exchange/',
		dataType: "json",
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {
			if (typeof data === 'object') {
				var buy_100_gems = [];
				var sell_100_gems = [];

				data.forEach(function(item, i, arr) {
					buy_100_gems.push([
						parseInt(item['timestamp']), parseInt(item['coins_per_gem_c2g']) === 0 ? null : (parseInt(item['coins_per_gem_c2g']) * 100)
					]);

					sell_100_gems.push([
						parseInt(item['timestamp']), parseInt(item['coins_per_gem_g2c']) === 0 ? null : (parseInt(item['coins_per_gem_g2c']) * 100)
					]);
				});

				$('#gem-history-chart').highcharts('StockChart', {
					credits : {
						href : 'https://www.gw2shinies.com/',
						text : chrome.i18n.getMessage("gw2shinies_credits")
					},

					scrollbar : {
						enabled: false
					},

					legend : {
						enabled: true
					},

					rangeSelector : {
						selected : 0,
						buttons: [
							{
								type: 'day',
								count: 1,
								text: '1 ' + chrome.i18n.getMessage("days")
							},
							{
								type: 'day',
								count: 7,
								text: '7 ' + chrome.i18n.getMessage("days")
							},
							{
								type: 'month',
								count: 1,
								text: '1 ' + chrome.i18n.getMessage("months")
							},
							{
								type: 'ytd',
								text: chrome.i18n.getMessage("from_beginning_year")
							},
							{
								type: 'year',
								count: 1,
								text: '1 ' + chrome.i18n.getMessage("years")
							},
							{
								type: 'all',
								text: titleCase(chrome.i18n.getMessage("all"))
							}
						]
					},

					yAxis: {
						showFirstLabel: false
					},

					series : [
						{
							type: "spline",
							zIndex: 2,
							dataGrouping: {
								enabled: false
							},
							name : chrome.i18n.getMessage("buy_100_gems"),
							data : buy_100_gems,
							tooltip: {
								pointFormatter: function() {
									return '<span style="color: ' + this.color + '">\u25CF</span> ' + this.series.name + ': ' + format_coins_clean(this.y) + '<br>';
								}
							}
						},
						{
							type: "spline",
							zIndex: 1,
							dataGrouping: {
								enabled: false
							},
							name : chrome.i18n.getMessage("sell_100_gems"),
							data : sell_100_gems,
							tooltip: {
								pointFormatter: function() {
									return '<span style="color: ' + this.color + '">\u25CF</span> ' + this.series.name + ': ' + format_coins_clean(this.y) + '<br>';
								}
							}
						}
					]
				});
			}
		},
		error: function(x, t, m) {					
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}

			$('#gem-history-chart').html('<div class="test-xs-center">' + chrome.i18n.getMessage("error") + '</div>');
		}
	});
});

$("body").off("submit", "#set-gem-price-form").on("submit", "#set-gem-price-form", function(event) {
	event.preventDefault();
	
	var el = $(this);
	var amount = $("#set-gem-price").val();
	
	chrome.storage.local.set({"notify_for_400_gems": parseInt(amount)}, function() {
		$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("changes_saved") + '</div>');
	});	
});

$("body").off("submit", "#set-gold-price-form").on("submit", "#set-gold-price-form", function(event) {
	event.preventDefault();
	
	var el = $(this);
	var amount = $("#set-gold-price").val();

	chrome.storage.local.set({"notify_for_10_gold": parseInt(amount)}, function() {
		$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("changes_saved") + '</div>');
	});	
});
