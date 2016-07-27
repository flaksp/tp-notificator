function load_page(local_page, fade_in) {
	var fade_speed = (typeof fade_in === 'undefined') ? 350 : 0;

	$.ajax({
		url: "/pages/" + local_page + ".html",
		dataType: "html",
		timeout: 10000,
		
		success: function(data) {
			current_page = local_page;
			
			$('body, html, main').animate({scrollTop: 0}, 0);
			$("main").hide().html(data).fadeIn(fade_speed);
		},
		
		error: function(x, t, m) {
			if (t === "timeout") {
				$("main").hide().html('<div class="fluid-vp-wrapper"><div class="text-xs-center text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</div></div>').fadeIn(fade_speed);
			}
			else {
				$("main").hide().html('<div class="fluid-vp-wrapper"><div class="text-xs-center text-danger">' + chrome.i18n.getMessage("loc_page_not_found", [local_page]) + '</div></div>').fadeIn(fade_speed);
			}
		}
	});
}

function deep_ajax_load(obj, callback_func) {	
	$.ajax({
		type: 'GET',
		url: obj['url'],
		data: {"page": obj['api_page'], "page_size": 200},
		dataType: "json",
		headers: {"Authorization": "Bearer " + obj['api_key']},
		timeout: 3000,
		success: function(data, textStatus, XMLHttpRequest) {
			if (obj['api_page'] + 1 < XMLHttpRequest.getResponseHeader('X-Page-Total')) {
				deep_ajax_load({
					"url": obj['url'],
					"api_key": obj['api_key'],
					"local_page": obj['local_page'],
					"api_page": obj['api_page'] + 1,
					"iteration": obj['iteration'] ? obj['iteration'] + 1 : 1,
					"transferred_data": obj['transferred_data'] ? obj['transferred_data'].concat(data) : data
				}, callback_func);
			}
			else {
				if (callback_func && typeof(callback_func) === "function") {
					callback_func("success", obj['transferred_data'] ? obj['transferred_data'].concat(data) : data);
				}
			}
		},
		error: function(x, t, m) {			
			if (obj['iteration'] >= 10) {
				if (callback_func && typeof(callback_func) === "function") {
					callback_func("fail", [x, t, m]);
				}
				
				return;
			}
			
			deep_ajax_load({
				"url": obj['url'],
				"api_key": obj['api_key'],
				"local_page": obj['local_page'],
				"api_page": obj['api_page'],
				"iteration": obj['iteration'] ? obj['iteration'] + 1 : 1,
				"transferred_data": obj['transferred_data'] ? obj['transferred_data'] : null
			}, callback_func);
		}
	});
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function format_coins(coins) {
	coins = coins.toString();
	
	var copper = coins.slice(-2);
	var silver = coins.slice(-4, -2);
	var gold = coins.slice(0, -4);
	
	var formatted_string = copper + '<span class="coin coin-copper"></span>';
	
	if (silver) {
		formatted_string = silver + '<span class="coin coin-silver"></span>' + formatted_string;
		
		if (gold) {
			formatted_string = gold + '<span class="coin coin-gold"></span>' + formatted_string;
		}
	}
	
	return formatted_string;
}

function format_coins_clean(coins) {
	coins = coins.toString();
	
	var copper = coins.slice(-2);
	var silver = coins.slice(-4, -2);
	var gold = coins.slice(0, -4);
	
	var formatted_string = copper + ' c.';
	
	if (silver) {
		formatted_string = silver + ' s. ' + formatted_string;
		
		if (gold) {
			formatted_string = gold + ' g. ' + formatted_string;
		}
	}
	
	return formatted_string;
}

/*
function find_in_array(array, id) {
	if (typeof array != 'undefined') {
		for (var i = 0; i < array.length; i++) {
			if (array[i].id == id) return [id];
			var a = find(array[i].sub, id);
			if (a != null) {
				a.unshift(array[i].id);
				return a;
			}
		}
	}
	return null;
}
*/
function findIndexByKeyValue(arraytosearch, key, valuetosearch) {
	for (var i = 0; i < arraytosearch.length; i++) {
		if (arraytosearch[i][key] == valuetosearch) {
			return i;
		}
	}
	return null;
}

function time_ago(time) {
	var difference = Math.floor((Date.now() - time) / 1000);
	
	if (difference <= 0) {
		return '0 ' + chrome.i18n.getMessage("secs");
	}
	else if (difference < 60) {
		return difference + ' ' + chrome.i18n.getMessage("secs");
	}
	else if (difference < 60 * 60) {
		return Math.floor(difference / 60) + ' ' + chrome.i18n.getMessage("mins");
	}
	else if (difference < 60 * 60 * 24) {
		return Math.floor(difference / (60 * 60)) + ' ' + chrome.i18n.getMessage("hours");
	}
	else {
		return Math.floor(difference / (60 * 60 * 24)) + ' ' + chrome.i18n.getMessage("days");
	}
}

function create_graph_url(id, graph_id) {
	var graph_list = [
		"http://www.gw2shinies.com/item/" + id,
		"http://www.gw2spidy.com/item/" + id,
		"http://www.gw2tp.com/item/" + id
	];
	
	return graph_list[graph_id - 1];
}

function create_graph_gem_url(graph_id) {
	var graph_list = [
		"https://www.gw2shinies.com/gem.php",
		"http://www.gw2spidy.com/gem",
		"https://www.gw2tp.com/gems"
	];
	
	return graph_list[graph_id - 1];
}

function build_price_chart(selector, item_vnum) {
	//https://www.gw2spidy.com/api/v0.9/json/listings/13364/sell
	//https://www.gw2spidy.com/api/v0.9/json/listings/13364/buy

	$.ajax({
		type: 'GET',
		url: 'https://www.gw2spidy.com/api/v0.9/json/listings/' + item_vnum + '/sell',
		dataType: "json",
		timeout: 10000,
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {
			if (typeof data['results'] === 'object') {
				var sells = [];
				var sells_count = [];

				data['results'].forEach(function(item, i, arr) {
					sells.push([
						Date.parse(item['listing_datetime']), item['quantity'] === 0 ? null : item['unit_price']
					]);

					sells_count.push([
						Date.parse(item['listing_datetime']), item['quantity']
					]);
				});

				$.ajax({
					type: 'GET',
					url: 'https://www.gw2spidy.com/api/v0.9/json/listings/' + item_vnum + '/buy',
					dataType: "json",
					timeout: 10000,
					tryCount: 0,
					retryLimit: 3,
					success: function(data, textStatus, XMLHttpRequest) {
						if (typeof data['results'] === 'object') {
							var buys = [];

							data['results'].forEach(function(item, i, arr) {
								buys.push([
									Date.parse(item['listing_datetime']), item['quantity'] === 0 ? null : item['unit_price']
								]);
							});

							$(selector).highcharts('StockChart', {
								credits : {
									href : 'http://www.gw2spidy.com/',
									text : chrome.i18n.getMessage("gw2spidy_credits")
								},

								scrollbar : {
									enabled: false
								},

								legend : {
									enabled: true
								},

								colors: ['#cc0000', '#434348', '#90ed7d'],

								rangeSelector : {
									selected : 1,
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

								xAxis: {
									crosshair: {
										zIndex: 10
									}
								},

								yAxis: [
									{
										showFirstLabel: false
									},
									{ // Column
										labels: {
											align: 'left',
											x: 3,
											y: 16,
										},
										showFirstLabel: false,
										opposite: false
									}
								],

								series : [
									{
										type: "line",
										yAxis: 0,
										zIndex: 3,
										dataGrouping: {
											enabled: false
										},
										name : chrome.i18n.getMessage("selling_price"),
										data : sells.reverse(),
										tooltip: {
											pointFormatter: function() {
												return '<span style="color: ' + this.color + '">\u25CF</span> ' + this.series.name + ': ' + format_coins_clean(this.y) + '<br>';
											}
										}
									},
									{
										type: "line",
										yAxis: 0,
										zIndex: 2,
										dataGrouping: {
											enabled: false
										},
										name : chrome.i18n.getMessage("buying_price"),
										data : buys.reverse(),
										tooltip: {
											pointFormatter: function() {
												return '<span style="color: ' + this.color + '">\u25CF</span> ' + this.series.name + ': ' + format_coins_clean(this.y) + '<br>';
											}
										}
									},
									{
										type: "column",
										yAxis: 1,
										zIndex: 1,
										dataGrouping: {
											enabled: false
										},
										name : chrome.i18n.getMessage("volume"),
										data : sells_count.reverse(),
										tooltip: {
											pointFormatter: function() {
												return '<span style="color: ' + this.color + '">\u25CF</span> ' + this.series.name + ': ' + addCommas(this.y) + '<br>';
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
					}
				});
			}
		},
		error: function(x, t, m) {					
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
		}
	});
}

var urlParams;
(window.onpopstate = function () {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

	urlParams = {};
	while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);
})();

function titleCase(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + '.' + '$2');
	}
	return x1 + x2;
}
