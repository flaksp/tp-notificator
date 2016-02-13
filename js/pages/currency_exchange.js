$("document").ready(function() {
	parse_templare("#currency_exchange", "main");
	
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/commerce/exchange/coins?quantity=1000000',
		dataType: "json",
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {
			/* Fix */ if (current_page != "currency_exchange") { load_page(current_page, true); return; }
			
			$("#gems-400-buy").html(format_coins(Math.round(400 / data['quantity'] * 1000000)));
			$("#gems-800-buy").html(format_coins(Math.round(800 / data['quantity'] * 1000000)));
			$("#gems-1200-buy").html(format_coins(Math.round(1200 / data['quantity'] * 1000000)));
			$("#gems-2000-buy").html(format_coins(Math.round(2000 / data['quantity'] * 1000000)));
		},
		error: function(x, t, m) {
			/* Fix */ if (current_page != "currency_exchange") { load_page(current_page, true); return; }
			
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#gems-400-buy, #gems-800-buy, #gems-1200-buy, #gems-2000-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</span>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#gems-400-buy, #gems-800-buy, #gems-1200-buy, #gems-2000-buy").html('<span class="text-danger text-fl-uppercase">' + x ['responseJSON']['text'] + '.</span>');
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
			/* Fix */ if (current_page != "currency_exchange") { load_page(current_page, true); return; }
			
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
			/* Fix */ if (current_page != "currency_exchange") { load_page(current_page, true); return; }
			
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</span>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger text-fl-uppercase">' + x ['responseJSON']['text'] + '.</span>');
			}
			else {
				$("#gold-10-buy, #gold-50-buy, #gold-100-buy, #gold-250-buy").html('<span class="text-danger">' + chrome.i18n.getMessage("unknown_error") + '</span>');
			}
		}
	});

});