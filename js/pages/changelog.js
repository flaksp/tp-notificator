$("document").ready(function() {
	var template = Handlebars.compile($("#changelog").html());
	$("main").html(template());
});
