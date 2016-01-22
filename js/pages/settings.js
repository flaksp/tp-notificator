$("document").ready(function() {
	parse_templare("#settings", "main");

	chrome.storage.sync.get(function(sync_storage) {
		// Load all API keys in <select> 
		if (sync_storage) {
			if (sync_storage["access_token"]) {
				$.each(sync_storage["access_token"], function(index, value) {
					$("#current_api_key").find("select").append('<option value="' + index + '">' + value + '</option>');
				});
				
				if (sync_storage["current_api_key"]) {
					$("#current_api_key").find("option[value=" + sync_storage["current_api_key"] + "]").attr("selected", true);
				}
			}
			
			// Graph tool
			if (sync_storage['settings'] && sync_storage['settings']['graph_tool']) {
				$("#graph_tool").find("option[value=" + sync_storage['settings']['graph_tool'] + "]").attr("selected", true);
			}
			
			// Algorithm
			if (sync_storage['settings'] && sync_storage['settings']['algorithm']) {
				$("#algorithm").find("input[value=" + sync_storage['settings']['algorithm'] + "]").attr("checked", true);
			}
			else {
				$("#algorithm").find("input[value=0]").attr("checked", true);
			}
			
			// Item localization
			if (sync_storage['settings'] && sync_storage['settings']['item_localization']) {
				$("#item_language").find("option[value=" + sync_storage['settings']['item_localization'] + "]").attr("selected", true);
			}
			else {
				$("#item_language").find("option[value=en]").attr("selected", true);
			}
			
			// Notifications
			if (sync_storage['settings'] && typeof sync_storage['settings']['sound'] !== "undefined") {
				$("#sound").find("input").val(sync_storage['settings']['sound']);
			}
			else {
				$("#sound").find("input").val("0.1");
			}
		}
	});
});


$("body").off("submit", "#add_api_key").on("submit", "#add_api_key", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var api_key = $(el).find("input").val();
	
	$(el).find("fieldset").attr("disabled", true);
	
	$.ajax({
		type: 'GET',
		url: 'https://api.guildwars2.com/v2/tokeninfo',
		dataType: "json",
		headers: {"Authorization": "Bearer " + api_key},
		timeout: 10000,
		success: function(data, textStatus, XMLHttpRequest) {
			if (current_page != "settings") {
				load_page(current_page, true);
				return;
			}
					
			if (data['permissions'].indexOf("tradingpost") == -1) {
				$(el).find(".js-notifications").prepend('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("tradingpost_required") + '</div>');
			}
			else {
				chrome.storage.sync.get(function(sync_storage) {
					var array = Object.size(sync_storage['access_token']) > 0 ? sync_storage['access_token'] : {};
					
					array[api_key] = data['name'];

					chrome.storage.sync.set({"access_token": array, "current_api_key": api_key}, function() {
						$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("api_key_saved", [data['name']]) + '</div>');
					
						if ($("#current_api_key").find("option[value=" + api_key + "]").length > 0) {
							$("#current_api_key").find("option[value=" + api_key + "]").html(data['name']);
						}
						else {
							$("#current_api_key select").append('<option value="' + api_key + '">' + data['name'] + '</option>');
						}
						
						$("#current_api_key").find("option[selected]").removeAttr("selected");
						$("#current_api_key").find("option[value=" + api_key + "]").attr("selected", true);
					});
				});
			}
			
			$(el).find("fieldset").removeAttr("disabled");
		},
		error: function(x, t, m) {
			if (current_page != "settings") {
				load_page(current_page, true);
				return;
			}
			
			if (t === "timeout") {
				$(el).find(".js-notifications").prepend('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("connection_timeout") + '</div>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$(el).find(".js-notifications").prepend('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="text-fl-uppercase">' + x['responseJSON']['text'] + '.</span></div>');
			}
			else {
				$(el).find(".js-notifications").prepend('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("unknown_error_try_again") + '</div>');
			}
		
			$(el).find("fieldset").removeAttr("disabled");
		}
	});
});

// Reset all settings
$(document).off("click", "#reset_all").on("click", "#reset_all", function() {
	chrome.storage.sync.clear(function() {
		chrome.storage.local.clear(function() {
			chrome.alarms.clearAll(function() {
				chrome.runtime.reload();
			});
		});
	});
});

// Remove API key
$(document).off("click", "#remove_selected").on("click", "#remove_selected", function() {
	if (!$("#current_api_key select").find("option:selected").attr("value")) {
		$("#current_api_key").find(".js-notifications").append('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("select_api_key_to_remove") + '</div>');
		
		return;
	}

	chrome.storage.sync.get(function(sync_storage) {
		if (sync_storage['current_api_key'] == $("#current_api_key select").find("option:selected").attr("value")) {
			$("#current_api_key").find(".js-notifications").append('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("cannot_remove_current_key") + '</div>');
			
			return;
		}
		
		delete sync_storage['access_token'][$("#current_api_key select").find("option:selected").attr("value")];
		
		chrome.storage.sync.set({"access_token": sync_storage['access_token']}, function() {
			$("#current_api_key").find(".js-notifications").append('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("api_key_removed", [$("#current_api_key select").find("option:selected").text()]) + '</div>');
			
			$("#current_api_key select").find("option:selected").remove();
			$("#current_api_key").find("option[value=" + sync_storage['current_api_key'] + "]").attr("selected", true);
		});
	});
});

// Select API key
$(document).off("click", "#use_selected").on("click", "#use_selected", function() {
	if (!$("#current_api_key select").find("option:selected").attr("value")) {
		$("#current_api_key").find(".js-notifications").append('<div class="alert alert-danger alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("select_api_key_to_use") + '</div>');
		
		return;
	}

	chrome.storage.sync.get(function(sync_storage) {
		if (sync_storage['current_api_key'] == $("#current_api_key select").find("option:selected").attr("value")) {
			$("#current_api_key").find(".js-notifications").append('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("you_are_using_this_key") + '</div>');
			
			return;
		}
		
		chrome.storage.sync.set({"current_api_key": $("#current_api_key select").find("option:selected").attr("value")}, function() {
			$("#current_api_key").find(".js-notifications").append('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("api_key_switched", [$("#current_api_key select").find("option:selected").text()]) + '</div>');
		});
	});
});

$("body").off("submit", "#graph_tool").on("submit", "#graph_tool", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var graph_tool = $(el).find("option:selected").val();
	
	chrome.storage.sync.get(function(sync_storage) {
		if (!sync_storage['settings']) {
			sync_storage['settings'] = {};
		}
		
		sync_storage['settings']['graph_tool'] = graph_tool;
		
		chrome.storage.sync.set({"settings": sync_storage['settings']}, function() {
			$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("graph_tool_changed") + '</div>');
		});
	});	
});

$("body").off("submit", "#item_language").on("submit", "#item_language", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var item_language = $(el).find("option:selected").val();
	
	chrome.storage.sync.get(function(sync_storage) {
		if (!sync_storage['settings']) {
			sync_storage['settings'] = {};
		}
		
		sync_storage['settings']['item_localization'] = item_language;
		
		chrome.storage.sync.set({"settings": sync_storage['settings']}, function() {
			$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("items_language_changed") + '</div>');
		});
	});	
});

$("body").off("submit", "#algorithm").on("submit", "#algorithm", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var algorithm = $(el).find("input:checked").val();
	
	chrome.storage.sync.get(function(sync_storage) {
		if (!sync_storage['settings']) {
			sync_storage['settings'] = {};
		}
		
		sync_storage['settings']['algorithm'] = algorithm;
		
		chrome.storage.sync.set({"settings": sync_storage['settings']}, function() {			
			chrome.storage.local.remove(["historical_bought", "historical_sold"], function() {
				$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("algorithm_changed") + '</div>');
			});
		});
	});	
});

$("body").off("submit", "#sound").on("submit", "#sound", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var sound = $(el).find("input").val();
	
	chrome.storage.sync.get(function(sync_storage) {
		if (!sync_storage['settings']) {
			sync_storage['settings'] = {};
		}
		
		sync_storage['settings']['sound'] = sound;
		
		chrome.storage.sync.set({"settings": sync_storage['settings']}, function() {			
			$(el).find(".js-notifications").prepend('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + chrome.i18n.getMessage("sound_changed") + '</div>');
		});
	});	
});