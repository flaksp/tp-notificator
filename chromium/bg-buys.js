chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm['name'] != "buying_alarm") {
		return;
	}
	
	chrome.storage.local.get(function(local_storage) {
		if (!local_storage['current_api_key']) {
			console.log("API key is not defined in extension settings.");
			return;
		}
		
		if (local_storage['algorithm'] == 0 || local_storage['algorithm'] == 2) {
			if (Object.size(local_storage['buying_track_list']) == 0) {
				console.log("You are not tracking any items.");
				return;
			}
			
			deep_ajax_load({
				"url": 'https://api.guildwars2.com/v2/commerce/transactions/current/buys',
				"api_key": local_storage['current_api_key'],
				"local_page": "bg-buys.js",
				"api_page": 0
			}, function(stat, data) {
				if (stat == "fail") {
					if (data[1] === "timeout") {
						console.log("Timeout error occured while trying to recieve buying list.");
					}
					else if (data[0]['responseJSON'] && data[0]['responseJSON']['text']) {
						console.log(data[0]['responseJSON']['text']);
					}
					else {
						console.log("Unknown error occured while trying to recieve buying list.");
					}
					
					return;
				}
				
				var item_ids = {};
				var bought_item_ids = {};
				
				data.forEach(function(item, i, arr) {
					item_ids[item['id']] = {"count": parseInt(item['quantity'])};
				});
				
				$.each(local_storage['buying_track_list'], function(index, value) {
					console.log("Check if item " + index + " exists in buying list.");
					
					if (!item_ids[index]) {
						delete local_storage['buying_track_list'][index];
						
						bought_item_ids[value['item_vnum']] = {
							"count": parseInt(value['item_count']),
							"price": parseInt(value['item_price']),
							"bought_all": true
						};
						
						console.log("Item " + index + " has been removed from buying track list.");
					}
					
					else if (item_ids[index]['count'] < value['item_count']) {
						bought_item_ids[value['item_vnum']] = {
							"count": parseInt(value['item_count'] - item_ids[index]['count']), /* database count (always bigger) - tp count = how much bought */
							"price": parseInt(value['item_price']),
							"bought_all": false
						};
						
						// Set new itemcount in database
						local_storage['buying_track_list'][index]['item_count'] = parseInt(item_ids[index]['count']);
					}
					
					else if (item_ids[index]['count'] > value['item_count']) {
						// Inc itemcount in database
						local_storage['buying_track_list'][index]['item_count'] = parseInt(item_ids[index]['count']);
					}
				});
				
				chrome.storage.local.set({"buying_track_list": local_storage['buying_track_list']});
				
				if (Object.size(bought_item_ids) > 0) {
					var myAudio = new Audio("/mp3/buy.mp3");
					myAudio.volume = local_storage['sound'];
					myAudio.play();
					
					send_success_buy_notification(bought_item_ids);
				}
			});
		}
		else {
			deep_ajax_load({
				"url": 'https://api.guildwars2.com/v2/commerce/transactions/history/buys',
				"api_key": local_storage['current_api_key'],
				"local_page": "bg-buys.js",
				"api_page": 0
			}, function(stat, data) {
				if (stat == "fail") {
					if (data[1] === "timeout") {
						console.log("Timeout error occured while trying to recieve buying history.");
					}
					else if (data[0]['responseJSON'] && data[0]['responseJSON']['text']) {
						console.log(data[0]['responseJSON']['text']);
					}
					else {
						console.log("Unknown error occured while trying to recieve buying history.");
					}
					
					return;
				}
				
				var item_ids = {};
				var bought_item_ids = {};
				
				data.forEach(function(item, i, arr) {
					item_ids[parseInt(item['id'])] = {"count": parseInt(item['quantity']), "vnum": parseInt(item['item_id'])};
				});
				
				chrome.storage.local.set({"historical_bought": Object.keys(item_ids)});
				
				if (local_storage["historical_bought"].length > 0) {
					var difference = Object.keys(item_ids).filter(function(el) {
						return local_storage["historical_bought"].indexOf(el) < 0;
					});
					
					if (difference.length == 0) {
						console.log("There are no bought items.");
						return;
					}
					
					difference.forEach(function(item, i, arr) {
						if (bought_item_ids[item_ids[item]['vnum']]) {
							bought_item_ids[item_ids[item]['vnum']]['count'] = bought_item_ids[item_ids[item]['vnum']]['count'] + item_ids[item]['count'];
						}
						else {
							bought_item_ids[item_ids[item]['vnum']] = {
								"count": item_ids[item]['count'],
								"bought_all": false
							};
						}
					});
			
					var myAudio = new Audio("/mp3/buy.mp3");
					myAudio.volume = local_storage['sound'];
					myAudio.play();
					
					var language = local_storage['item_localization'];
					
					send_success_buy_notification(bought_item_ids, language);
				}
				else {
					console.log("Just created new historical object in storage.");
				}
			});
		}
	});
});


function send_success_buy_notification(bought_item_ids, language) {
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/items',
		data: {"ids": Object.keys(bought_item_ids).join(","), "lang": language},
		dataType: "json",
		cache: true,
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {
			$.each(bought_item_ids, function(index, value) {
				var data_index = findIndexByKeyValue(data, "id", index);
				
				var item_name = data[data_index]['name'];
				var item_icon = data[data_index]['icon'];
				
				chrome.notifications.create("notif_" + Date.now() + 'x' + Math.random(), {
					type: "basic",
					iconUrl: item_icon,
					title: chrome.i18n.getMessage("item_bought"),					
					message: item_name + ' (' + (value['bought_all'] ? chrome.i18n.getMessage("all") : value['count'] + " " + chrome.i18n.getMessage("items")) + ')',
					isClickable: false
				});
			});
		},
		error: function(x, t, m) {
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				console.log("Timeout error occured while trying to recieve item metadata.");
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				console.log(x['responseJSON']['text']);
			}
			else {
				console.log("Unknown error occured while trying to load item metadata.");
			}
			
			$.each(bought_item_ids, function(index, value) {
				chrome.notifications.create("notif_" + Date.now() + 'x' + Math.random(), {
					type: "basic",
					iconUrl: "/img/logo-359.png",
					title: chrome.i18n.getMessage("item_bought"),
					message: index + ' (' + (value['bought_all'] ? chrome.i18n.getMessage("all") : value['count'] + " " + chrome.i18n.getMessage("items")) + ')',
					isClickable: false
				});
			});
		}
	});
}
