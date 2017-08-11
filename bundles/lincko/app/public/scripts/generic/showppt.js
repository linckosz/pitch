var showppt_question_id = false;
var showppt_current_page = 'question';

var showppt_iframe_css = {

	//These are actual value of overlay picture
	frame_width: 720,
	frame_height: 680,
	screen_width: 587,
	screen_height: 361,
	screen_left: 67,
	screen_top: 120,

	html_zoom: 1,
	html_width: 0,
	html_height: 0,

	iframe_height: 0,
	iframe_width: 0,
	iframe_left: 0,
	iframe_top: 0,

	info: function(){
		return {
			html_zoom: showppt_iframe_css.html_zoom,
			html_width: showppt_iframe_css.html_width,
			html_height: showppt_iframe_css.html_height,
		};
	},

	get: function(start, body_width){
		if(typeof start == "undefined"){ start=true; }
		if(typeof body_width == "number"){
			showppt_iframe_css.init(body_width);
		}
		var get = '';
		var prefix = '&';
		if(start){
			prefix = '?';
		}
		var info = showppt_iframe_css.info();
		for(var i in info){
			get += prefix+i+"="+info[i];
			prefix = "&";
		}
		return get;
	},

	init: function(body_width){
		var orientation = ($(window).width() / $(window).height() ) <  ( showppt_iframe_css.frame_width / showppt_iframe_css.frame_height );
		if(orientation){
			showppt_iframe_css.iframe_width = Math.round( $(window).width() * showppt_iframe_css.screen_width / showppt_iframe_css.frame_width );
			showppt_iframe_css.iframe_height = Math.round( showppt_iframe_css.iframe_width * showppt_iframe_css.screen_height / showppt_iframe_css.screen_width );
			showppt_iframe_css.iframe_left = Math.round( showppt_iframe_css.screen_left * $(window).width() / showppt_iframe_css.frame_width );
			var extra = Math.round( ( $(window).height() - ( showppt_iframe_css.frame_height * $(window).width() / showppt_iframe_css.frame_width ) ) /2);
			showppt_iframe_css.iframe_top = extra + Math.round( showppt_iframe_css.screen_top * $(window).width() / showppt_iframe_css.frame_width );
		} else {
			showppt_iframe_css.iframe_height = Math.round( $(window).height() * showppt_iframe_css.screen_height / showppt_iframe_css.frame_height );
			showppt_iframe_css.iframe_width = Math.round( showppt_iframe_css.iframe_height * showppt_iframe_css.screen_width / showppt_iframe_css.screen_height );
			showppt_iframe_css.iframe_top = Math.round( showppt_iframe_css.screen_top * $(window).height() / showppt_iframe_css.frame_height );
			var extra = Math.round( ( $(window).width() - ( showppt_iframe_css.frame_width * $(window).height() / showppt_iframe_css.frame_height ) ) /2);
			showppt_iframe_css.iframe_left = extra + Math.round( showppt_iframe_css.screen_left * $(window).height() / showppt_iframe_css.frame_height );
		}

		if(typeof body_width=="undefined"){
			showppt_iframe_css.html_zoom = 1;
		} else {
			showppt_iframe_css.html_zoom = Math.round( 1000 * showppt_iframe_css.iframe_width / body_width) / 1000;
		}

		showppt_iframe_css.html_width = Math.round(showppt_iframe_css.iframe_width / showppt_iframe_css.html_zoom);
		showppt_iframe_css.html_height = Math.round(showppt_iframe_css.iframe_height / showppt_iframe_css.html_zoom);
	},

};

app_application_lincko.add(function(){
	if(showppt_question_id){
		var item = Lincko.storage.get('question', showppt_question_id);
		if(item){
			showppt_iframe_css.init(1024);
			var preview_url = Lincko.storage.getURL(showppt_question_id, showppt_current_page) + showppt_iframe_css.get();
			$('#showppt_iframe').prop('src', preview_url);
			screenshot_iframe();
		}
	}
}, "resize");

var showppt = function(question_id){

	showppt_iframe_css.init(1024);

	$("#showppt_next")
		.data('next', true)
		.html(Lincko.Translation.get('app', 97, 'html')); //Next Page	
	
	if(question_id){
		var item = Lincko.storage.get('question', question_id);
		if(item){

			if(item['style']==3){ //Statistics
				$("#showppt_next")
					.data('next', false)
					.html( Lincko.Translation.get('app', 25, 'html') ); //Close	
			}

			//Question
			var question_url = Lincko.storage.getURL(question_id, 'question');
			$("#showppt_top_question").removeClass('display_none');
			$("#showppt_top_question").find("[find=question_url]").html(question_url);
			$("#showppt_top_question").find("[find=question]").attr('data-clipboard-text', question_url);

			//Answer
			var answer_url = Lincko.storage.getURL(question_id, 'answer');
			$("#showppt_top_answer").addClass('display_none');
			$("#showppt_top_answer").find("[find=answer_url]").html(answer_url);
			$("#showppt_top_answer").find("[find=answer]").attr('data-clipboard-text', answer_url);

			showppt_question_id = question_id;
			$("#showppt").removeClass('display_none');
			showppt_current_page = 'question';
			var preview_url = Lincko.storage.getURL(question_id, 'question') + showppt_iframe_css.get();
			$('#showppt_iframe').prop('src', preview_url);
			screenshot_iframe();
			app_generic_state.change({
				showppt: true,
			}, null, 1);
			return true;
		}
	}

	$("#showppt_top_question").addClass('display_none');
	$("#showppt_top_answer").addClass('display_none');
	$('#showppt_iframe').prop('src', '');
	$("#showppt").addClass('display_none');
	showppt_question_id = false;
	app_generic_state.change({
		showppt: false,
	}, null, -1);

	return false;
};

var screenshot_iframe = function(){
	/*
	$('#showppt_iframe')
		//.prop('zoom', showppt_iframe_css.iframe_zoom)
		//.css('transform', 'scale('+showppt_iframe_css.html_zoom+')')
		.prop('width', showppt_iframe_css.iframe_width)
		.css('width', showppt_iframe_css.iframe_width)
		.prop('height', showppt_iframe_css.iframe_height)
		.css('height', showppt_iframe_css.iframe_height)
		.css('left', showppt_iframe_css.iframe_left)
		.css('top', showppt_iframe_css.iframe_top)
		;
	*/
	$('#showppt_iframe')
		//.prop('zoom', showppt_iframe_css.iframe_zoom)
		//.css('transform', 'scale('+showppt_iframe_css.html_zoom+')')
		.prop('width', showppt_iframe_css.html_width)
		.css('width', showppt_iframe_css.html_width)
		.prop('height', showppt_iframe_css.html_height)
		.css('height', showppt_iframe_css.html_height)
		.css('left', showppt_iframe_css.iframe_left)
		.css('top', showppt_iframe_css.iframe_top)
		.css({
			'-webkit-transform' : 'scale(' + showppt_iframe_css.html_zoom + ')',
			'-moz-transform'    : 'scale(' + showppt_iframe_css.html_zoom + ')',
			'-ms-transform'     : 'scale(' + showppt_iframe_css.html_zoom + ')',
			'-o-transform'      : 'scale(' + showppt_iframe_css.html_zoom + ')',
			'transform'         : 'scale(' + showppt_iframe_css.html_zoom + ')',
		})
		.css({
			'-webkit-transform-origin' : 'top left',
			'-moz-transform-origin'    : 'top left',
			'-ms-transform-origin'     : 'top left',
			'-o-transform-origin'      : 'top left',
			'transform-origin'         : 'top left',
		})
		;
}

$("#showppt").on('click', function(event){
	event.stopPropagation();
	showppt(false);
});

$("#showppt_top_question, #showppt_top_answer").on('click', function(event){
	event.stopPropagation();
});

$("#showppt_next").on('click', function(event){
	event.stopPropagation();
	var next = $(this).data('next');
	$(this).data('next', false);
	if(next){
		$("#showppt_next").html( Lincko.Translation.get('app', 25, 'html') ); //Close
		$("#showppt_top_question").addClass('display_none');
		$("#showppt_top_answer").removeClass('display_none');
		showppt_current_page = 'answer';
		var preview_url = Lincko.storage.getURL(showppt_question_id, 'answer') + showppt_iframe_css.get();
		$('#showppt_iframe').prop('src', preview_url);
		screenshot_iframe();
	} else {
		showppt(false);
	}
});

$("#showppt_webviewer").on('click', function(event){
	event.stopPropagation();
	device_download(video_webviewer, "_blank", "Web Viewer (Power Point).mp4");
});

var showppt_clipboard_question = new Clipboard($("#showppt_top_question").find("[find=question]")[0]);
showppt_clipboard_question.on('success', function(event) {
	var msg = Lincko.Translation.get('app', 70, 'html')+"\n"+event.text; //URL copied to the clipboard
	base_show_error(msg, false); 
	event.clearSelection();
});
showppt_clipboard_question.on('error', function(event) {
	var msg = Lincko.Translation.get('app', 71, 'html'); //Your system does not allow to copy to the clipboard
	base_show_error(msg, true);
	event.clearSelection();
});

var showppt_clipboard_answer = new Clipboard($("#showppt_top_answer").find("[find=answer]")[0]);
showppt_clipboard_answer.on('success', function(event) {
	var msg = Lincko.Translation.get('app', 70, 'html')+"\n"+event.text; //URL copied to the clipboard
	base_show_error(msg, false); 
	event.clearSelection();
});
showppt_clipboard_answer.on('error', function(event) {
	var msg = Lincko.Translation.get('app', 71, 'html'); //Your system does not allow to copy to the clipboard
	base_show_error(msg, true);
	event.clearSelection();
});

JSfiles.finish(function(){
	$("#showppt_picture").css("background-image", "url('"+showppt_pitch.src+"')");
});
