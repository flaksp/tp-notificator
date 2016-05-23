$("document").ready(function() {
	var template = Handlebars.compile($("#calculator").html());
	$("main").html(template());
	
	$('#price, #listing-fee, #selling-fee, #profit, #without-fee').html(format_coins(0));
});

$(document).off("change paste keyup", "#calculate-value, #calculate-count").on("change paste keyup", "#calculate-value, #calculate-count", function() {
	var value = parseInt($('#calculate-value').val());
	var count = parseInt($('#calculate-count').val());
	
	if (value > 0 && count > 0) {
		$('#price').html(format_coins(value));
		$('#without-fee').html(format_coins(Math.floor(value / 85 * 100)));
		
		$('#listing-fee').html(format_coins(Math.floor(value / 100 * 5) * count));
		$('#selling-fee').html(format_coins(Math.floor(value / 100 * 10) * count));
		
		$('#profit').html(format_coins(Math.floor(value - Math.floor(value / 100 * 5) - Math.floor(value / 100 * 10)) * count));
	}
	else {
		$('#price, #listing-fee, #selling-fee, #profit, #without-fee').html(format_coins(0));
	}
});