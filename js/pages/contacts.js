$("document").ready(function() {
	var template = Handlebars.compile($("#contacts").html());
	$("main").html(template());
});
