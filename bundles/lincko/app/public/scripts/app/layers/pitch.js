
function app_layers_pitch_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_pitch_feedPage(param);

	$('#app_content_top_title_pitches').removeClass('display_none');
	$('#app_content_top_title_questions, #app_content_top_title_answers').addClass('display_none');
	$('#app_content_top_title_menu').find('.app_content_top_title_select_opened').removeClass('app_content_top_title_select_opened');
	$('#app_content_top_title_select_pitches').addClass('app_content_top_title_select_opened');
}

var app_layers_pitch_refresh_timer;
var app_layers_pitch_refresh = function(timer){
	if(typeof timer == 'undefined'){
		timer = wrapper_timeout_timer;
	}
	clearTimeout(app_layers_pitch_refresh_timer);
	app_layers_pitch_refresh_timer = setTimeout(function(){
		//Delete the last border in Mobile mode
		var layer = $('#app_layers_content');
		layer.find('.models_pitch_standard_last').removeClass('models_pitch_standard_last');
		layer.find('.models_pitch_standard').last().addClass('models_pitch_standard_last');
		wrapper_IScroll();
	}, timer);
};
$(window).resize(app_layers_pitch_refresh);

var app_layers_pitch_new_animation = false;
var app_layers_pitch_feedPage = function(param){
	if(typeof param == 'undefined'){ param = null; }
	var sub_layer = $('#app_layers_pitch');
	sub_layer.addClass('overthrow');
	sub_layer.recursiveEmpty();
	$('<div find="wrapper" class="app_layers_pitch_wrapper"></div>').appendTo(sub_layer);
	var position_wrapper = sub_layer.find("[find=wrapper]");

	Elem = $('#-app_layers_pitch_add_icon').clone();
	Elem.prop('id', 'app_layers_pitch_add_icon');
	Elem.click(param, function(event){
		event.stopPropagation();
		if(!$(this).find("[find=add]").hasClass("display_none")){
			$(this).addClass("app_layers_pitch_add_icon_fixed");
			$(this).find("[find=add]").addClass("display_none");
			$(this).find("[find=input]").removeClass("display_none");
			$(this).css('cursor', 'default');
			var items = Lincko.storage.list('pitch');
			var param = {
				number: items.length+1,
			};
			$(this).find("[find=input_textarea]")
				.val(Lincko.Translation.get('app', 2103, 'html', param)) //Pitch #[{number]}
				.focus()
				.select()
				.textareaRows();
			wrapper_IScroll();
		}
	});
	//Create new item
	Elem.find("[find=input_textarea]").on('keyup', function(event){
		if(event.which == 13){
			app_layers_pitch_icon_create();
			event.preventDefault();
		}
		return false;
	});
	//Disable New Line
	Elem.find("[find=input_textarea]").on('keydown keypress change copy paste cut input', function(event){
		if(event.type=="copy" || event.type=="paste" || event.type=="cut"){
			setTimeout(function(that){
				var str = that.val();
				if(str.match(/(\r\n|\n|\r)/gm)){
					str = str.replace(/(\r\n|\n|\r)/gm, " ");
					that.val(str);
				}
				var rows_prev = parseInt(that.attr('rows'), 10);
				that.textareaRows();
				if(rows_prev != parseInt(that.attr('rows'), 10)){
					wrapper_IScroll();
				}
			}, 0, $(this));
		} else {
			var str = $(this).val();
			if(str.match(/(\r\n|\n|\r)/gm)){
				str = str.replace(/(\r\n|\n|\r)/gm, " ");
				$(this).val(str);
			}
		}
		if(event.which == 13){
			event.preventDefault();
		} else if(event.which == 27){
			app_layers_pitch_icon_back();
		}
		var rows_prev = parseInt($(this).attr('rows'), 10);
		$(this).textareaRows();
		if(rows_prev != parseInt($(this).attr('rows'), 10)){
			wrapper_IScroll();
		}
	});
	Elem.find("[find=input_cancel]").on('click', function(event){
		app_layers_pitch_icon_back();
		event.preventDefault();
		return false;
	});
	Elem.find("[find=input_create]").on('click', function(event){
		app_layers_pitch_icon_create();
		event.preventDefault();
		return false;
	});
	Elem.appendTo(position_wrapper);

	var layer = $('#app_layers_content');
	Elem = $('#-app_layers_pitch_add_corner').clone();
	Elem.prop('id', '');
	Elem.click(param, function(event){
		event.stopPropagation();
		$('#app_layers_pitch_add_icon').click();
	});
	Elem.appendTo(layer);

	app_layers_pitch_refresh(0);

	app_application_lincko.add("app_layers_pitch", "pitch_delete", function(){
		$('#app_layers_pitch').find("[pitch_id]").filter(function() {
			var id = parseInt($(this).attr("pitch_id"), 10);
			var item = Lincko.storage.get('pitch', id);
			if(!item){
				$(this)
					.find("[find=delete]")
					.recursiveOff()
					.css("cursor", "default")
				$(this)
					.recursiveOff()
					.css("cursor", "default")
					.velocity(
						'transition.expandOut',
						{
							mobileHA: hasGood3Dsupport,
							duration: 500,
							delay: 10,
							complete: function(){
								$(this).recursiveRemove();
								app_layers_pitch_refresh();
							},
						}
					);
			}
			return false;
		});
	});

	app_layers_pitch_new_animation = false;
	app_application_lincko.add("app_layers_pitch", "pitch", function(){
		var items = Lincko.storage.list('pitch');
		items = Lincko.storage.sort_items(items, 'sort', 0, -1, false);
		var item;
		var Elem;
		var position;
		var time_limit = Lincko.now.getTimeServer()-(10*1000);
		for(var i in items){
			item = items[i];
			if($('#models_pitch_'+item['id']).length==0){
				Elem = $('#-models_pitch').clone();
				Elem.prop('id', 'models_pitch_'+item['id']);
				Elem.attr('created_at', item['created_at']);
				Elem.attr('pitch_id', item['id']);
				Elem.find("[find=title]").html( wrapper_to_html(item['title']) );
				Elem.find("[find=delete]").click(
					item['id'],
					function(event){
						event.stopPropagation();
						if(confirm(Lincko.Translation.get('app', 26, 'js'))){ //Are you sure you want to delete this item?
							var data = {};
							data.delete = {};
							data.delete.pitch = {};
							var item = Lincko.storage.get('pitch', event.data);
							data.delete.pitch[item['id']] = {
								id: item['id'],
								md5: item['md5'],
							};
							var action_cb_success = function(msg, error, status, extra){
								storage_cb_success(msg, error, status, extra);
								app_content_menu.selection("pitch");
							}
							var action_cb_complete = function(){
								storage_cb_complete();
								app_application_lincko.prepare("pitch", true);
							};
							if(storage_offline(data)){
								wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
							}
						}
					}
				);
				Elem.find("[find=ppt]").click(
					item['id'],
					function(event){
						event.stopPropagation();
						Lincko.storage.downloadPPT(event.data);
					}
				);
				Elem.click(
					item['id'],
					function(event){
						event.stopPropagation();
						app_content_menu.selection("question", event.data);
					}
				);

				position = $('#app_layers_pitch').find("[created_at]").filter(function() { return parseInt($(this).attr("created_at"), 10) <= item['created_at']; }).first();
				if(position.length==1){
					position.before(Elem);
				} else {
					position = $('#app_layers_pitch').find("[find=wrapper]");
					Elem.appendTo(position);
				}
				if(app_layers_pitch_new_animation && 1000*item['created_at'] > time_limit){
					Elem
					.velocity(
						'transition.expandIn',
						{
							mobileHA: hasGood3Dsupport,
							duration: 500,
							delay: 10,
							display: 'inline-table',
							complete: function(){
								app_layers_pitch_refresh();
							},
						}
					);
				}
			} else {
				Elem = $('#models_pitch_'+item['id']);
				Elem.find("[find=title]").html( wrapper_to_html(item['title']) );
			}
		}
		app_layers_pitch_new_animation = true;
		app_layers_pitch_refresh();
	}, param);

	app_application_lincko.prepare("pitch", true);

};

var app_layers_pitch_icon_back = function(){
	if($("#app_layers_pitch_add_icon").length>0){
		$("#app_layers_pitch_add_icon").removeClass("app_layers_pitch_add_icon_fixed");
		$("#app_layers_pitch_add_icon").find("[find=add]").removeClass("display_none");
		$("#app_layers_pitch_add_icon").find("[find=input]").addClass("display_none");
		$("#app_layers_pitch_add_icon").css('cursor', '');
		$("#app_layers_pitch_add_icon").find("[find=input_textarea]").val("");
		$("#app_layers_pitch_add_icon").blur();
		wrapper_IScroll();
	}
};

var app_layers_pitch_icon_create = function(){
	if($("#app_layers_pitch_add_icon").length>0){
		var data = {};
		data.set = {};
		data.set.pitch = {};
		var md5id = Lincko.storage.getMD5("pitch");
		var title = $("#app_layers_pitch_add_icon").find("[find=input_textarea]").val();
		title = title.replace(/(\r\n|\n|\r)/gm, " ");
		data.set.pitch[md5id] = {
			md5: md5id,
			title: title,
		};
		var Elem_bis = $("#app_layers_pitch_add_icon").find("[find=input_create]");
		var action_cb_success = function(msg, error, status, extra){
			storage_cb_success(msg, error, status, extra);
			if(!error){
				app_layers_pitch_icon_back();
			}
		}
		var action_cb_complete = function(){
			storage_cb_complete();
			base_hideProgress(Elem_bis);
			app_application_lincko.prepare("pitch", true);
			var item = Lincko.storage.findMD5(md5id, "pitch");
			if(item){
				setTimeout(function(parent_id){
					app_content_menu.selection("question", parent_id);
				}, 400, item['id']);
			}
		};
		if(storage_offline(data)){
			base_showProgress(Elem_bis);
			wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
		}
	}
};
