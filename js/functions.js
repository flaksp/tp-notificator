function load_page(local_page, fade_in) {
	var fade_speed = (typeof fade_in === 'undefined') ? 350 : 0;
	
	//$("main").hide().html('<div style="display: table; width: 100%"><div class="text-xs-center" style="display: table-cell; vertical-align: middle; height: calc(100vh - 2rem)"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div></div>').fadeIn(fade_speed);

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
				$("main").hide().html('<div class="alert alert-danger" role="alert"><strong>Error.</strong> ' + chrome.i18n.getMessage("connection_timeout") + '</div>').fadeIn(fade_speed);
			}
			else {
				$("main").hide().html('<div class="alert alert-danger" role="alert"><strong>Error.</strong> ' + chrome.i18n.getMessage("loc_page_not_found", [local_page]) + '</div>').fadeIn(fade_speed);
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
			/* Fix */ if (typeof current_page !== "undefined" && current_page != obj['local_page']) { load_page(current_page, true); return; }
			
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
			/* Fix */ if (typeof current_page !== "undefined" && current_page != obj['local_page']) { load_page(current_page, true); return; }
			
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

function remind_to_vote_up(selector) {
	chrome.storage.sync.get(function(sync_storage) {
		if (sync_storage['vote_remind'] === false && sync_storage['install_date'] + 60 * 60 * 24 * 14 * 1000 < Date.now()) {
			$(selector).prepend('<div class="alert alert-info alert-dismissible fade in" id="vote_reminder_alert" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("vote_reminder") + '</div>');
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

function parse_templare(load_from, load_to) {
	if ($(load_from) && $(load_from).length > 0) {
		var template = Handlebars.compile($(load_from).html());
		$(load_to).html(template());
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