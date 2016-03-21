$("document").ready(function() {
	var template = Handlebars.compile($("#translations").html());
	$("main").html(template());
});
