$("document").ready(function() {
	Handlebars.registerHelper("loc", function(str, args) {
		return new Handlebars.SafeString(chrome.i18n.getMessage(str));
	});
	
	$("html").attr("lang", chrome.i18n.getMessage("@@ui_locale"));
	
	// External links
	$('body').on("click", "a[href], [data-href]", function() {
		chrome.tabs.create({url: $(this).attr('href') ? $(this).attr('href') : $(this).data('href')});
		return false;
	});
	
	var template = Handlebars.compile($("#options").html());
	$("main").html(template());
	
	$("title").html(chrome.i18n.getMessage("options"));
	
	
	chrome.storage.local.get(function(local_storage) {
		cbf.storage.sync.get(function(sync_storage) {
			// Load all API keys in <select> 
			if (Object.size(sync_storage["access_token"]) > 0) {
				$.each(sync_storage["access_token"], function(index, value) {
					$("#current_api_key").find("select").append('<option value="' + index + '">' + value + '</option>');
				});
				
				if (local_storage["current_api_key"]) {
					$("#current_api_key").find("option[value=" + local_storage["current_api_key"] + "]").attr("selected", true);
				}
			}
			
			// Graph tool
			$("#graph_tool").find("option[value=" + local_storage['graph_tool'] + "]").attr("selected", true);
			
			// Algorithm
			$("#algorithm").find("input[value=" + local_storage['algorithm'] + "]").attr("checked", true);
			
			// Item localization
			$("#item_language").find("option[value=" + local_storage['item_localization'] + "]").attr("selected", true);
			
			// Notifications
			$("#sound").find("input").val(local_storage['sound']);
			
			// Default page
			$("#default_page").find("option[value=" + local_storage['default_page'] + "]").attr("selected", true);
		});
	});
});

// Add API-key
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
		tryCount: 0,
		retryLimit: 3,
		success: function(data, textStatus, XMLHttpRequest) {					
			if (data['permissions'].indexOf("tradingpost") == -1) {
				$(el).find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("tradingpost_required") + '</p>');
			}
			else {
				cbf.storage.sync.get(function(sync_storage) {
					sync_storage['access_token'][api_key] = data['name'];

					chrome.storage.local.set({"current_api_key": api_key}, function() {
						cbf.storage.sync.set({"access_token": sync_storage['access_token']}, function() {
							$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("api_key_saved", [data['name']]) + '</p>');
						
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
				});
			}
			
			$(el).find("fieldset").removeAttr("disabled");
		},
		error: function(x, t, m) {			
			if (++this.tryCount <= this.retryLimit) {
				$.ajax(this);
				return;
			}
			
			if (t === "timeout") {
				$(el).find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("connection_timeout") + '</p>');
			}
			else if (x['responseJSON'] && x['responseJSON']['text']) {
				$(el).find(".js-notifications").html('<p class="text-danger"><span class="text-fl-uppercase">' + x['responseJSON']['text'] + '.</span></p>');
			}
			else {
				$(el).find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("unknown_error_try_again") + '</p>');
			}
		
			$(el).find("fieldset").removeAttr("disabled");
		}
	});
});

// Reset all options
$(document).off("click", "#reset_all").on("click", "#reset_all", function() {
	cbf.storage.sync.clear(function() {
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
		$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("select_api_key_to_remove") + '</p>');
		
		return;
	}

	cbf.storage.sync.get(function(sync_storage) {
		chrome.storage.local.get(function(local_storage) {
			if (local_storage['current_api_key'] == $("#current_api_key select").find("option:selected").attr("value")) {
				$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("cannot_remove_current_key") + '</p>');
				
				return;
			}
			
			delete sync_storage['access_token'][$("#current_api_key select").find("option:selected").attr("value")];
			
			cbf.storage.sync.set({"access_token": sync_storage['access_token']}, function() {
				$("#current_api_key").find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("api_key_removed", [$("#current_api_key select").find("option:selected").text()]) + '</p>');
				
				$("#current_api_key select").find("option:selected").remove();
				$("#current_api_key").find("option[value=" + local_storage['current_api_key'] + "]").attr("selected", true);
			});
		});
	});
});

// Select API key
$(document).off("click", "#use_selected").on("click", "#use_selected", function() {
	if (!$("#current_api_key select").find("option:selected").attr("value")) {
		$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("select_api_key_to_use") + '</p>');
		
		return;
	}

	chrome.storage.local.get(function(local_storage) {
		if (local_storage['current_api_key'] == $("#current_api_key select").find("option:selected").attr("value")) {
			$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("you_are_using_this_key") + '</p>');
			
			return;
		}
		
		chrome.storage.local.set({"current_api_key": $("#current_api_key select").find("option:selected").attr("value")}, function() {
			$("#current_api_key").find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("api_key_switched", [$("#current_api_key select").find("option:selected").text()]) + '</p>');
		});
	});
});

// Select graph tool
$("body").off("submit", "#graph_tool").on("submit", "#graph_tool", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var graph_tool = $(el).find("option:selected").val();
	

	chrome.storage.local.set({"graph_tool": parseInt(graph_tool)}, function() {
		$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("changes_saved") + '</p>');
	});
});

// Select item language
$("body").off("submit", "#item_language").on("submit", "#item_language", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var item_language = $(el).find("option:selected").val();
	
	chrome.storage.local.set({"item_localization": item_language}, function() {
		$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("changes_saved") + '</p>');
	});
});

// Select algorithm
$("body").off("submit", "#algorithm").on("submit", "#algorithm", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var algorithm = $(el).find("input:checked").val();

	chrome.storage.local.set({"algorithm": parseInt(algorithm), "historical_bought": [], "historical_sold": [], "buying_track_list": {}, "selling_track_list": {}}, function() {
		$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("changes_saved") + '</p>');
	});	
});

// Select sound volume
$("body").off("submit", "#sound").on("submit", "#sound", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var sound = $(el).find("input").val();
	
	chrome.storage.local.set({"sound": parseFloat(sound)}, function() {			
		$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("changes_saved") + '</p>');
	});
});

// Select default page
$("body").off("submit", "#default_page").on("submit", "#default_page", function(event) {
	event.preventDefault();
	
	var el = $(this);
	
	var default_page = $(el).find("option:selected").val();

	chrome.storage.local.set({"default_page": default_page}, function() {
		$(el).find(".js-notifications").html('<p class="text-success">' + chrome.i18n.getMessage("changes_saved") + '</p>');
	});
});

$('body').off('click', '#what_is_this_api').on('click', '#what_is_this_api', function(event) {
	$("#add_api_key").find(".js-notifications").html('<p>' + chrome.i18n.getMessage("faq_question_access_token") + '</p>');
});

$('body').off('click', '#what_is_this_algorithm').on('click', '#what_is_this_algorithm', function(event) {
	$("#algorithm").find(".js-notifications").html(chrome.i18n.getMessage("faq_question_algorithm"));
});
