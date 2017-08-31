var showppt_list_url = [];
var showppt_list_scan = [];
var showppt_list_index = 0;
var showppt_pitch_id = false;

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

	wrapper_width: 0,
	wrapper_height: 0,
	wrapper_left: 0,
	wrapper_top: 0,

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
		showppt_iframe_css.wrapper_width = 0;
		showppt_iframe_css.wrapper_height = 0;
		showppt_iframe_css.wrapper_left = 0;
		showppt_iframe_css.wrapper_top = 0;

		var orientation = ($(window).width() / $(window).height() ) <  ( showppt_iframe_css.frame_width / showppt_iframe_css.frame_height );
		if(orientation){
			showppt_iframe_css.iframe_width = Math.round( $(window).width() * showppt_iframe_css.screen_width / showppt_iframe_css.frame_width );
			showppt_iframe_css.iframe_height = Math.round( showppt_iframe_css.iframe_width * showppt_iframe_css.screen_height / showppt_iframe_css.screen_width );
			showppt_iframe_css.iframe_left = Math.round( showppt_iframe_css.screen_left * $(window).width() / showppt_iframe_css.frame_width );
			var extra = Math.round( ( $(window).height() - ( showppt_iframe_css.frame_height * $(window).width() / showppt_iframe_css.frame_width ) ) /2);
			showppt_iframe_css.iframe_top = extra + Math.round( showppt_iframe_css.screen_top * $(window).width() / showppt_iframe_css.frame_width );
			showppt_iframe_css.wrapper_width = $(window).width();
			showppt_iframe_css.wrapper_height = Math.round( showppt_iframe_css.frame_height * $(window).width() / showppt_iframe_css.frame_width );
			showppt_iframe_css.wrapper_left = 0;
			showppt_iframe_css.wrapper_top = extra;
		} else {
			showppt_iframe_css.iframe_height = Math.round( $(window).height() * showppt_iframe_css.screen_height / showppt_iframe_css.frame_height );
			showppt_iframe_css.iframe_width = Math.round( showppt_iframe_css.iframe_height * showppt_iframe_css.screen_width / showppt_iframe_css.screen_height );
			showppt_iframe_css.iframe_top = Math.round( showppt_iframe_css.screen_top * $(window).height() / showppt_iframe_css.frame_height );
			var extra = Math.round( ( $(window).width() - ( showppt_iframe_css.frame_width * $(window).height() / showppt_iframe_css.frame_height ) ) /2);
			showppt_iframe_css.iframe_left = extra + Math.round( showppt_iframe_css.screen_left * $(window).height() / showppt_iframe_css.frame_height );
			showppt_iframe_css.wrapper_width = Math.round( showppt_iframe_css.frame_width * $(window).height() / showppt_iframe_css.frame_height );
			showppt_iframe_css.wrapper_height = $(window).height();
			showppt_iframe_css.wrapper_left = extra;
			showppt_iframe_css.wrapper_top = 0;
		}

		if(typeof body_width=="undefined"){
			showppt_iframe_css.html_zoom = 1;
		} else {
			showppt_iframe_css.html_zoom = Math.round( 1000 * showppt_iframe_css.iframe_width / body_width) / 1000;
		}

		showppt_iframe_css.html_width = Math.round(showppt_iframe_css.iframe_width / showppt_iframe_css.html_zoom);
		showppt_iframe_css.html_height = Math.round(showppt_iframe_css.iframe_height / showppt_iframe_css.html_zoom);

		$('#showppt_width_wrapper').css({
			'width': showppt_iframe_css.wrapper_width,
			'margin-left': showppt_iframe_css.wrapper_left,
		});
		
		var iframe_border = Math.round( (showppt_iframe_css.wrapper_width - showppt_iframe_css.iframe_width) / 2);
		$('#showppt_scrollbar').css({
			'width': Math.round( iframe_border / 2),
			'height': Math.round( showppt_iframe_css.iframe_height - 8),
			'right': Math.round( iframe_border / 4),
			'top': Math.round( showppt_iframe_css.iframe_top + 4),
		});

		var ratio = 0.70;
		if(responsive.test("minMobileL")){
			var ratio = 0.50;
		}
		$("#showppt_scrollbar_ppt").css({
			'font-size': Math.round( iframe_border * ratio),
			'left': Math.round( iframe_border * ((1-ratio)/2) ),
			'top': Math.round( showppt_iframe_css.iframe_top + 8),
		});

		var ratio = 0.15;
		$("#showppt_scanner").css({
			'right': Math.round( iframe_border + (((0.30-ratio)/2) * showppt_iframe_css.iframe_width) ),
			'bottom': Math.round( $(window).height() - (showppt_iframe_css.iframe_top + showppt_iframe_css.iframe_height + 16) - (ratio * showppt_iframe_css.iframe_width) ),
			'width': Math.round( ratio * showppt_iframe_css.iframe_width ),
			'height': Math.round( ratio * showppt_iframe_css.iframe_width ),
		});
		$("#showppt_lazer").css({
			'right': Math.round( iframe_border ),
			'bottom': Math.round( $(window).height() - (showppt_iframe_css.iframe_top + showppt_iframe_css.iframe_height + 16) ),
			'width': Math.round( 0.30 * showppt_iframe_css.iframe_width ),
			'height': Math.round( showppt_iframe_css.iframe_height),
		});
	},

};

app_application_lincko.add(function(){
	showppt();
}, "resize");

var showppt_launch = function(question_id){
	var index = 0;
	var result = false;
	showppt_list_url = [];
	showppt_list_scan = [];
	showppt_list_index = 0;
	showppt_pitch_id = false;
	var pitch = Lincko.storage.getParent("question", question_id);	
	if(pitch){
		showppt_pitch_id = pitch['id'];
		showppt_list_url.push(top.location.protocol+'//'+document.domain+'/ppt/pitch/start/'+wrapper_integer_map(pitch["id"]));
		showppt_list_scan.push(false);
		index++;
		var items = Lincko.storage.list('question', -1, null, 'pitch', pitch["id"]);
		items = Lincko.storage.sort_items(items, 'id', 0, -1, true);
		items = Lincko.storage.sort_items(items, 'sort', 0, -1, false);
		for(var i in items){
			if(items[i]["id"]==question_id){
				showppt_list_index = index;
			}
			showppt_list_url.push(top.location.protocol+'//'+document.domain+'/ppt/question/'+wrapper_integer_map(items[i]["id"]));
			showppt_list_scan.push(top.location.protocol+'//'+document.domain+'/quiz/question/0/'+wrapper_integer_map(items[i]["id"]));
			index++;
			if(items[i]["style"]!=3){
				showppt_list_url.push(top.location.protocol+'//'+document.domain+'/ppt/answer/'+wrapper_integer_map(items[i]["id"]));
				showppt_list_scan.push(false);
				index++;
			}
		}
		showppt_list_url.push(top.location.protocol+'//'+document.domain+'/ppt/pitch/end/'+wrapper_integer_map(pitch["id"]));
		showppt_list_scan.push(false);
		index++;
		if(typeof showppt_list_url[showppt_list_index] != 'string'){
			showppt_list_index = 0;
		}
		showppt_insert_slide(index);
		result = showppt(showppt_list_index);
	}
	if(!result){
		base_show_error(Lincko.Translation.get('app', 51, 'js')); //Operation not allowed
	}
	return result;
};

var showppt_insert_slide = function(slides){
	var odd = true;
	var slide;
	var scrollbar_list = $("#showppt_scrollbar_list");
	scrollbar_list.recursiveEmpty();
	for(var index = 0; index < slides; index++){
		slide = $("#-showppt_scrollbar_list_slide").clone();
		slide
			.prop('id', '')
			.attr('index', index);
		if(odd){
			slide.find('[find=info]').addClass('odd');
		}
		odd = !odd;
		slide.on('click', index, function(event){
			showppt(event.data);
		});
		slide.appendTo(scrollbar_list);
	}
};

var showppt_quiz_close = function(){
	$('#showppt_iframe_quiz').prop('src', '');
	$('#showppt_iframe_quiz, #showppt_iframe_quiz_close').addClass('display_none');
};

var showppt_close = function(){
	$('#showppt_iframe').prop('src', '');
	$("#showppt").addClass('display_none');
	$("#showppt_lazer").velocity("stop");
	showppt_list_url = [];
	showppt_list_scan = [];
	showppt_list_index = 0;
	showppt_pitch_id = false;
	showppt_quiz_close();
	app_generic_state.change({
		showppt: false,
	}, null, -1);
};

var showppt_timer = false;
var showppt = function(index, timer){
	clearTimeout(showppt_timer);
	if(typeof index == 'undefined'){
		//Help to refresh the page
		index = showppt_list_index;
	}
	if(typeof timer == 'undefined'){
		timer = 500;
	}
	if(typeof index == 'number'){
		if(typeof showppt_list_url[index] == 'string'){
			showppt_list_index = index;
			showppt_iframe_css.init(1024);
			$("#showppt_prev").removeClass('disabled');
			$("#showppt_next").removeClass('disabled');
			if(showppt_list_index<=0){
				$("#showppt_prev").addClass('disabled');
			} else if(showppt_list_index>=showppt_list_url.length-1){
				$("#showppt_next").addClass('disabled');
			}
			$("#showppt_top_clipboard").find("[find=url]").html(showppt_list_url[index]);
			$("#showppt_top_clipboard").find("[find=clipboard]").attr('data-clipboard-text', showppt_list_url[index]);
			$("#showppt").removeClass('display_none');
			var preview_url = showppt_list_url[index] + showppt_iframe_css.get();
			showppt_timer = setTimeout(function(preview_url){
				$('#showppt_iframe').prop('src', preview_url);
			}, timer, preview_url);
			screenshot_iframe();
			var slide = $("#showppt_scrollbar_list").find("[index="+index+"]").first();
			if(slide.length==1){
				$("#showppt_scrollbar_indicator").css({
					'width': slide.width()+4,
					'height': slide.height()+4,
				})
				.velocity({
					'top': slide.position().top,
					'duration': timer,
				});
			}
			//Scanner button
			if(typeof showppt_list_scan[index] == 'string'){
				$("#showppt_scanner").removeClass('display_none');
			} else {
				$("#showppt_scanner").addClass('display_none');
			}
			app_generic_state.change({
				showppt: true,
			}, null, 1);
			return true;
		}
	}
	return false;
};

var screenshot_iframe = function(){
	$('#showppt_iframe')
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
};

$("#showppt_prev").on('click', function(event){
	event.stopPropagation();
	showppt(showppt_list_index-1);
});

$("#showppt_next").on('click', function(event){
	event.stopPropagation();
	showppt(showppt_list_index+1);
});

//Close the preview
$("#showppt_scanner").on('click', function(event){
	if(typeof showppt_list_scan[showppt_list_index] == 'string' && showppt_list_scan[showppt_list_index]){
		$("#showppt_lazer")
			.css({
				height: Math.round( showppt_iframe_css.iframe_height),
			})
			.velocity("stop")
			.velocity(
				{
					height: Math.round( showppt_iframe_css.iframe_height - (0.50 * showppt_iframe_css.iframe_height)),
				},
				{
					mobileHA: hasGood3Dsupport,
					duration: 1500,
					delay: 10,
					begin: function(){
						$("#showppt_lazer").removeClass('display_none');
						if(showppt_pitch_id){
							$('#showppt_iframe_quiz').prop('src', showppt_list_scan[showppt_list_index]);
						}
					},
					progress: function(){
						//blinking
						var opacity = Math.round( 20 + (70 * Math.random()) );
						$("#showppt_lazer")
							.css({
								'filter': 'alpha(opacity='+opacity+')',
								'opacity': '0.'+opacity,
								'-moz-opacity': '0.'+opacity,
								'-khtml-opacity': '0.'+opacity,
							});
					},
					complete: function(){
						$("#showppt_lazer").addClass('display_none');
						$('#showppt_iframe_quiz, #showppt_iframe_quiz_close').removeClass('display_none');
					},
				}
			);
	}
	event.stopPropagation();
});

//Close the preview
$("#showppt, #showppt_close").on('click', function(event){
	event.stopPropagation();
	showppt_close();
});

//Close the quiz preview
$("#showppt_iframe_quiz_close").on('click', function(event){
	event.stopPropagation();
	showppt_quiz_close();
});

$("#showppt_scrollbar").on('click', function(event){
	event.stopPropagation();
});

$("#showppt_scrollbar_ppt").on('click', function(event){
	if(showppt_pitch_id){
		Lincko.storage.downloadPPT(showppt_pitch_id);
	}
	event.stopPropagation();
});

//Stop click event to propagate on background
$("#showppt_top_clipboard").on('click', function(event){
	if(!navigator.userAgent.match(/MicroMessenger/i)){
		if(typeof showppt_list_url[showppt_list_index] == 'string'){
			window.open(showppt_list_url[showppt_list_index], '_blank');
		}
	}
	event.stopPropagation();
});

if(navigator.userAgent.match(/MicroMessenger/i)){
	var showppt_clipboard = new Clipboard($("#showppt_top_clipboard").find("[find=clipboard]")[0]);
	showppt_clipboard.on('success', function(event) {
		var showppt_current_url = false;
		if(typeof showppt_list_url[showppt_list_index] == 'string'){
			var msg = Lincko.Translation.get('app', 70, 'html')+"\n"+showppt_list_url[showppt_list_index]; //URL copied to the clipboard
			base_show_error(msg, false); 
		}
		event.clearSelection();
	});
	showppt_clipboard.on('error', function(event) {
		var msg = Lincko.Translation.get('app', 71, 'html'); //Your system does not allow to copy to the clipboard
		base_show_error(msg, true);
		event.clearSelection();
	});
}

JSfiles.finish(function(){
	$("#showppt_picture").css("background-image", "url('"+showppt_pitch.src+"')");
});
