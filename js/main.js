// Google Analytics
(function(i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function() {
		(i[r].q = i[r].q || []).push(arguments)
	},
	i[r].l = 1 * new Date();
	a = s.createElement(o),
	m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', {
	trackingId: 'UA-63968909-3',
	cookieDomain: 'auto'
});

ga('set', 'checkProtocolTask', function() {});
ga('require', 'displayfeatures');

ga('set', 'appName', chrome.runtime.getManifest().name);
ga('set', 'appVersion', chrome.runtime.getManifest().version);
ga('set', 'appId', chrome.i18n.getMessage("@@extension_id"));

var current_page;

window.onload = function() {
	// Define 'loc' helper
	Handlebars.registerHelper("loc", function(str, args) {
		return new Handlebars.SafeString(chrome.i18n.getMessage(str));
	});

	// Define 'browser' helper
	Handlebars.registerHelper("browser", function() {
		return new Handlebars.SafeString(browser_info['name']);
	});

	$("html").attr("lang", chrome.i18n.getMessage("@@ui_locale"));

	// Parse extension window
	var template = Handlebars.compile($("#main").html());
	$("#content").html(template());

	// Open default page defined via options
	chrome.storage.local.get(function(local_storage) {
		// Sends data to Google Analytics
		ga('set', 'title', local_storage['default_page']);
		ga('set', 'screenName', local_storage['default_page']);
		ga('send', 'pageview', '/' + local_storage['default_page']);
		load_page(local_storage['default_page']);
	});

	// Local pages
	$(document).on("click", "[data-local-page]", function() {
		// Sends data to Google Analytics
		ga('set', 'title', $(this).data("local-page"));
		ga('set', 'screenName', $(this).data("local-page"));
		ga('send', 'pageview', '/' + $(this).data("local-page"));

		if ($(this).data("local-page") == 'options') {
			chrome.runtime.openOptionsPage();
		} else if ($(this).data("local-page") == 'full-tab') {
			chrome.tabs.create({
				url: 'chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/popup.html?full-tab=yes'
			});
		} else {
			load_page($(this).data("local-page"));
		}
	});

	// External links
	$('body').on("click", "a[href], [data-href]", function() {
		chrome.tabs.create({
			url: $(this).attr('href')
				? $(this).attr('href')
				: $(this).data('href')
		});
		return false;
	});

	// Hide vote remind forever
	$(document).on('close.bs.alert', '#vote_reminder_alert', function() {
		cbf.storage.sync.set({
			"vote_remind": true
		}, function() {
			console.log("Notification hidden forever.");
		});
	});

	if (urlParams['full-tab'] && urlParams['full-tab'] === "yes") {
		$('body, html').css('width', '100%');
		$('html, body, main').css('height', '100%');
		$('main').removeClass('custom-scrollbar');
	}

	// Init clipboard
	new Clipboard('.js-clipboard');

	// Basic fonfigs for highstock
	Highcharts.setOptions({
		global: {
			timezoneOffset: new Date().getTimezoneOffset()
		}
	});

	// Add all API keys to switch modal
	chrome.storage.local.get(function(local_storage) {
		cbf.storage.sync.get(function(sync_storage) {
			if (Object.size(sync_storage["access_token"]) > 0) {
				$.each(sync_storage["access_token"], function(index, value) {
					$("#current_api_key").find("select").append('<option value="' + index + '">' + value + '</option>');
				});

				if (local_storage["current_api_key"]) {
					$("#current_api_key").find("option[value=" + local_storage["current_api_key"] + "]").attr("selected", true);
				}
			}
		});
	});

	// Select API key in modal
	$(document).off("submit", "#current_api_key").on("submit", "#current_api_key", function(event) {
		event.preventDefault();

		if (!$("#current_api_key select").find("option:selected").attr("value")) {
			$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("select_api_key_to_use") + '</p>');

			return;
		}

		chrome.storage.local.get(function(local_storage) {
			if (local_storage['current_api_key'] == $("#current_api_key select").find("option:selected").attr("value")) {
				$("#current_api_key").find(".js-notifications").html('<p class="text-danger">' + chrome.i18n.getMessage("you_are_using_this_key") + '</p>');

				return;
			}

			chrome.storage.local.set({"current_api_key": $("#current_api_key select").find("option:selected").attr("value"), "historical_sold": [], "historical_bought": [], "selling_track_list": {}, "buying_track_list": {}});

			window.location.reload();
		});
	});
}
