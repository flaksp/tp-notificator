(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
 
ga('create', 'UA-63968909-3', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');
ga('send', 'pageview', '/popup.html');

var current_page;

window.onload = function() {
	Handlebars.registerHelper("loc", function(str, args) {
		return new Handlebars.SafeString(chrome.i18n.getMessage(str));
	});
	
	parse_templare("#main", "#content");
	
	load_page("buying");
	
	// Local pages
	$(document).on("click", ".local-page", function() {		
		load_page($(this).data("page"));
	});
	
	// External links
	$('body').on("click", "a[href], [data-href]", function() {
		chrome.tabs.create({url: $(this).attr('href') ? $(this).attr('href') : $(this).data('href')});
		return false;
	});

	$(document).on('close.bs.alert', '#vote_reminder_alert', function () {
		chrome.storage.sync.get(function(sync_storage) {
			if (sync_storage && sync_storage['metadata'] && sync_storage['metadata']['vote_remind'] === false) {
				sync_storage['metadata']['vote_remind'] = true;
				
				chrome.storage.sync.set({"metadata": sync_storage['metadata']}, function() {
					console.log("Notification hidden forever.");
				});
			}
		});
	})	
}
