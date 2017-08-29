
var base_error_timing;
var base_show_error_running = false;
var base_show_error = function(msg, error, time, escape_html) {
	if(typeof error == 'undefined'){ error = false; }
	if(typeof time == 'undefined'){ time = 4000; }
	if(typeof escape_html == 'undefined'){ escape_html = true; }
	if(error && $('#base_error').hasClass('base_message')){
		$('#base_error').removeClass('base_message');
	} else if(!error && !$('#base_error').hasClass('base_message')){
		$('#base_error').addClass('base_message');
	}
	clearTimeout(base_error_timing);
	//This avoid a double call
	if(escape_html){
		msg = wrapper_to_html(msg); //Escape the whole string for HTML displaying
	}
	if(typeof msg == "string" && $('#base_error').length > 0 && php_nl2br(php_br2nl(msg)) != php_nl2br(php_br2nl($('#base_error').html()))){
		$('#base_error').html(msg);
		if(!base_show_error_running && $('#base_error').is(':hidden')){
			$("#base_error").velocity("transition.slideRightBigIn", {
				mobileHA: hasGood3Dsupport,
				duration: 260,
				delay: 120,
			});
		} else {
			$("#base_error").fadeTo( 60 , 0.9).fadeTo( 120 , 1);
		}
		base_show_error_running = true;
	} else if(typeof msg != "string"){
		JSerror.sendError(msg, 'base_show_error', 0);
	}
	base_error_timing = setTimeout(function(){ base_hide_error(); }, time);
};

var base_hide_error = function(now) {
	if(typeof now == 'undefined'){ now = false; }
	$('#base_error').velocity("stop");
	base_show_error_running = false;
	if(now){
		clearTimeout(base_error_timing);
		$('#base_error').hide().empty();
	} else if($('#base_error').is(':visible')){
		$("#base_error").velocity("transition.slideRightBigOut", {
			mobileHA: hasGood3Dsupport,
			duration: 160,
			delay: 80,
			complete: function(){
				clearTimeout(base_error_timing);
				$('#base_error').hide().empty();
			},
		});
	}
};

$('#base_error').click(function(){
	base_hide_error();
});


var base_showProgress = function(Elem){
	Elem.addClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.css("display", "block");
		submit_progress_bar.removeClass('display_none');
	}
};

var base_hideProgress = function(Elem){
	Elem.removeClass('cursor_progress');
	var submit_progress_bar = Elem.find("[find=submit_progress_bar]");
	if(submit_progress_bar.length>0){
		base_format_form_single(submit_progress_bar);
		submit_progress_bar.addClass('display_none');
	}
}

//This function is only for IE which gives the wrong width when the element is hidden
var base_format_form_single = function(Elem){
	Elem.each(function() {
		$(this).width("100%");
		$(this).width($(this).width() - 4);
	});
}

var base_video_device_current = 0;
var base_video_device = [];
var base_has_webcam = false;
var base_has_webcam_sub = false;

var base_removeLineBreaks = function(str){
	if(typeof str != 'string'){ return false; }
	return str.replace(/(\r\n|\n|\r)/gm, "");
}

//Only keep special characters line unicode
var base_remove_stdchar = function(str){
	if(typeof str != 'string'){ return ""; }
	return str.replace(/[\u0000-\u007F]/gm, "");
}

var base_toggle_myQRcode = function(display){
	var elem = $('#base_myQRcode_popup');
	if(Lincko.storage.generateMyQRcode()){
		elem.find('img').attr('src', Lincko.storage.generateMyQRcode());
	}
	if(typeof display == 'boolean'){
		if(!display){
			elem.addClass('visibility_hidden');
		} else {
			elem.removeClass('visibility_hidden');
		}
	} else {
		elem.toggleClass('visibility_hidden');
	}
}

JSfiles.finish(function(){
	$('body')
		//Avoid seeing highlited element on mobile
		.addClass('base_tapHighlight_off')
		//Avoid having scroll top/bottom browser (especially on wechat)
		.on('touchmove pointermove MSPointerMove mousemove', function(event){
			event.preventDefault();
		});
});
