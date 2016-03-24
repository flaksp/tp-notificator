chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm['name'] != "exchange_rate") {
		return;
	}
	
	chrome.storage.local.get(function(local_storage) {
		if (local_storage['notify_for_400_gems'] > 0) {
			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/commerce/exchange/coins?quantity=1000000',
				dataType: "json",
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {
					var current_price = Math.round(400 / data['quantity'] * 1000000);

					if (local_storage['notify_for_400_gems'] >= current_price) {
						chrome.notifications.create("notification_about_cheap_gems", {
							type: "basic",
							iconUrl: "/img/logo-359.png",
							title: chrome.i18n.getMessage("gem_price_dropped_down"),
							message: chrome.i18n.getMessage("gems_cost_now", [format_coins_clean(current_price)]),
							contextMessage: chrome.i18n.getMessage("gems_cost_your", [format_coins_clean(local_storage['notify_for_400_gems'])]),
							isClickable: false
						});
						
						var myAudio = new Audio("/mp3/exchange-rate.mp3");
						myAudio.volume = local_storage['sound'];
						myAudio.play();
					}
				},
				error: function(x, t, m) {
					if (++this.tryCount <= this.retryLimit) {
						$.ajax(this);
						return;
					}
					
					if (t === "timeout") {
						console.log("Connection timed out.")
					}
					else if (x['responseJSON'] && x['responseJSON']['text']) {
						console.log(x['responseJSON']['text'])
					}
					else {
						console.log("Unknown error occured.")
					}
				}
			});
		}
		
		if (local_storage['notify_for_10_gold'] > 0) {
			$.ajax({
				type: 'GET',
				url: 'https://api.guildwars2.com/v2/commerce/exchange/gems?quantity=2000',
				dataType: "json",
				timeout: 10000,
				tryCount: 0,
				retryLimit: 3,
				success: function(data, textStatus, XMLHttpRequest) {
					var current_price = Math.round(10 / data['quantity'] * 2000 * 10000);

					if (local_storage['notify_for_10_gold'] >= current_price) {
						chrome.notifications.create("notification_about_cheap_gold", {
							type: "basic",
							iconUrl: "/img/logo-359.png",
							title: chrome.i18n.getMessage("gold_price_dropped_down"),
							message: chrome.i18n.getMessage("gold_cost_now", [current_price]),
							contextMessage: chrome.i18n.getMessage("gold_cost_your", [local_storage['notify_for_10_gold']]),
							isClickable: false
						});
						
						var myAudio = new Audio("/mp3/exchange-rate.mp3");
						myAudio.volume = local_storage['sound'];
						myAudio.play();
					}
				},
				error: function(x, t, m) {
					if (++this.tryCount <= this.retryLimit) {
						$.ajax(this);
						return;
					}
					
					if (t === "timeout") {
						console.log("Connection timed out.")
					}
					else if (x['responseJSON'] && x['responseJSON']['text']) {
						console.log(x['responseJSON']['text'])
					}
					else {
						console.log("Unknown error occured.")
					}
				}
			});
		}
	});
});

chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
	if (byUser === true) {
		if (notificationId == "notification_about_cheap_gems") {
			chrome.storage.local.set({"notify_for_400_gems": 0});
		}
		else if (notificationId == "notification_about_cheap_gold") {
			chrome.storage.local.set({"notify_for_10_gold": 0});
		}
		else {
			return;
		}
	}
});
