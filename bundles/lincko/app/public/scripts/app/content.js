$('#app_content_top_settings').click(function(){
	submenu_Build('settings');
});

function app_content_dynamic_position() {
	$('#app_content_dynamic, #app_content_dynamic_sub').height(function(){
		return $(window).height() - $('#app_content_top').height();
	});
	$('#app_content_dynamic_sub').width($('#app_content_dynamic').width());
}
app_content_dynamic_position();
var app_content_dynamic_position_timer;
$(window).resize(function(){
	clearTimeout(app_content_dynamic_position_timer);
	app_content_dynamic_position_timer = setTimeout(app_content_dynamic_position, wrapper_timeout_timer);
});

var app_content_menu = {

	menu: null,

	param: null,

	param_md5: null,

	selection: function(menu, param){
		if(typeof menu == 'undefined'){ menu = 'pitch'; }
		if(typeof param == 'undefined'){ param = null; }

		if(app_content_menu.menu == menu && app_content_menu.param_md5 == md5(param)){
			return true;
		}

		//Clean all submenu before opening a new project (even if the same as current one)
		submenu_Hideall(true);

		var index_state = 0;
		var order_state = {
			pitch: 0,
			question: 1,
			answer: 2,
		};
		if(typeof order_state[menu] != 'undefined'){
			index_state = order_state[menu];
		}
		app_generic_state.change(
			{
				menu: index_state,
			},
			param,
			1
		);

		app_content_menu.menu = menu;
		app_content_menu.param = param;

		app_layers_changePage(menu, param);

		return true;
	},
}

$('#app_content_top_home').click(function(){
	app_content_menu.selection('pitch');
});

var app_content_resize_timer;
var app_content_resize = function(){
	clearTimeout(app_content_resize_timer);
	app_content_resize_timer = setTimeout(function(){
		if($("#app_content_dynamic_sub").length > 0){
			if($("#app_content_dynamic_sub").width() <= 900){
				$("#app_content_dynamic_sub").addClass("max-width-900");
			} else {
				$("#app_content_dynamic_sub").removeClass("max-width-900");
			}
		}
		app_application_lincko.prepare("resize", true);
	}, 400);
};

$(window).resize(function(){
	app_content_resize();
});

var app_content_top_title = {
	pitch: null,
	question: null,
	answer: null,
	_set: function(type, id){
		if(type in app_content_top_title){
			app_content_top_title[type] = id;
			app_application_save_page(type, id);
		}
	},
};

$("#app_content_top_title_select_pitches").on('click', function(){
	app_content_top_title._set('pitch', null);
	app_content_top_title._set('question', null);
	app_content_top_title._set('answer', null);
	app_content_menu.selection("pitch");
});
$("#app_content_top_title_select_questions").on('click', function(){
	app_content_top_title._set('question', null);
	app_content_top_title._set('answer', null);
	app_content_menu.selection("question", app_content_top_title.pitch);
});
$("#app_content_top_title_select_answers").on('click', function(){
	app_content_top_title._set('answer', null);
	app_content_menu.selection("answer",app_content_top_title.question);
});

JSfiles.finish(function(){
	app_content_menu.selection("pitch");
	if(device_type()!='computer'){
		$('#app_content_pc').removeClass('display_none');
		$('#app_content_powered').addClass('display_none');
	} else {
		$('#app_content_pc').addClass('display_none');
		$('#app_content_powered').removeClass('display_none');
	}
});

