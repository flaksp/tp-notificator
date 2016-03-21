$("document").ready(function() {
	var template = Handlebars.compile($("#faq").html());
	$("main").html(template());
});
