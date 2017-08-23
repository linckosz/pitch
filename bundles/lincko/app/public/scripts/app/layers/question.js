
function app_layers_question_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_question_feedPage(param);

	$('#app_content_top_title_pitches, #app_content_top_title_questions').removeClass('display_none');
	$('#app_content_top_title_answers').addClass('display_none');
	$('#app_content_top_title_menu').find('.app_content_top_title_select_opened').removeClass('app_content_top_title_select_opened');
	$('#app_content_top_title_select_questions').addClass('app_content_top_title_select_opened');
}

var app_layers_question_refresh_timer;
var app_layers_question_refresh = function(timer){
	if(typeof timer == 'undefined'){
		timer = wrapper_timeout_timer;
	}
	clearTimeout(app_layers_question_refresh_timer);
	app_layers_question_refresh_timer = setTimeout(function(){
		//Delete the last border in Mobile mode
		var layer = $('#app_layers_content');
		layer.find('.models_question_standard_last').removeClass('models_question_standard_last');
		layer.find('.models_question_standard').last().addClass('models_question_standard_last');
		wrapper_IScroll();
	}, timer);
}
$(window).resize(app_layers_question_refresh);

var app_layers_question_new_animation = false;
var app_layers_question_feedPage = function(param){
	if(typeof param == 'undefined'){ param = null; }
	var sub_layer = $('#app_layers_question');
	sub_layer.addClass('overthrow');
	sub_layer.recursiveEmpty();
	$('<div find="wrapper" class="app_layers_question_wrapper"></div>').appendTo(sub_layer);
	var position_wrapper = sub_layer.find("[find=wrapper]");

	var pitch = Lincko.storage.get('pitch', param);
	var pitch_timer = {};
	if(pitch){
		var item = pitch;
		app_content_top_title._set('pitch', item['id']);
		Elem = $('#-models_pitch_top').clone();
		Elem.prop('id', 'models_pitch_top_'+item['id']);
		
		Elem.find("[find=input_textarea]").val(item['title']);
		//Create new item
		pitch_timer[item['id']] = null;
		Elem.find("[find=input_textarea]").on('blur keyup input', item['id'], function(event){
			var str = $(this).val();
			var pitch_id = event.data;
			var pitch = Lincko.storage.get('pitch', pitch_id);
			if(pitch){
				title = str.replace(/(\r\n|\n|\r)/gm, " ");
				var data = {};
				data.set = {};
				data.set.pitch = {};
				data.set.pitch[pitch['id']] = {
					id: pitch['id'],
					md5: pitch['md5'],
					title: title,
				};
			}
			clearTimeout(pitch_timer[pitch_id]);
			pitch_timer[pitch_id] = setTimeout(function(pitch_id, data){
				if(storage_offline(data)){
					wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
				}
			}, 2000, pitch_id, data);
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
					that.textareaRows(3);
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
			if(event.which == 13 || event.which == 27){
				$(this).blur();
			}
			var rows_prev = parseInt($(this).attr('rows'), 10);
			$(this).textareaRows(3);
			if(rows_prev != parseInt($(this).attr('rows'), 10)){
				wrapper_IScroll();
			}
		});


		Elem.appendTo(position_wrapper);
		app_application_lincko.add('models_pitch_top_'+pitch['id'], "pitch_"+pitch['id'], function(){
			var item = Lincko.storage.get('pitch', this.action_param);
			if(item){
				$("#"+this.id).find("[find=title]").val( item['title'] );
			}
		}, pitch['id']);
	} else {
		app_content_top_title._set('pitch', null);
		app_content_top_title._set('question', null);
		app_content_top_title._set('answer', null);
		app_content_menu.selection("pitch");
		return false;
	}

	Elem = $('#-app_layers_question_add_icon').clone();
	Elem.prop('id', 'app_layers_question_add_icon');
	Elem.click(param, function(event){
		event.stopPropagation();
		if(!$(this).find("[find=add]").hasClass("display_none")){
			$(this).addClass("app_layers_question_add_icon_fixed");
			$(this).find("[find=add]").addClass("display_none");
			$(this).find("[find=input]").removeClass("display_none");
			$(this).css('cursor', 'default');
			var items = Lincko.storage.list('question', -1, null, 'pitch', event.data);
			var param = {
				number: items.length+1,
			};
			$(this).find("[find=input_textarea]").val(Lincko.Translation.get('app', 2106, 'html', param)); //Question #[{number]}
			$(this).find("[find=input_textarea]").focus();
			wrapper_IScroll();
		}
	});
	//Create new item
	Elem.find("[find=input_textarea]").on('keyup', param, function(event){
		if(event.which == 13){
			app_layers_question_icon_create(event.data);
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
			app_layers_question_icon_back();
		}
		var rows_prev = parseInt($(this).attr('rows'), 10);
		$(this).textareaRows();
		if(rows_prev != parseInt($(this).attr('rows'), 10)){
			wrapper_IScroll();
		}
	});
	Elem.find("[find=input_cancel]").on('click', function(event){
		app_layers_question_icon_back();
		event.preventDefault();
		return false;
	});
	Elem.find("[find=input_create]").on('click', param, function(event){
		app_layers_question_icon_create(event.data);
		event.preventDefault();
		return false;
	});
	Elem.appendTo(position_wrapper);

	position_wrapper.find("[find=input_textarea]").textareaRows();

	var layer = $('#app_layers_content');
	Elem = $('#-app_layers_question_add_corner').clone();
	Elem.prop('id', '');
	Elem.click(param, function(event){
		event.stopPropagation();
		submenu_Build("app_question_new", 1, true, event.data);
	});
	Elem.appendTo(layer);

	app_layers_question_refresh(0);

	app_application_lincko.add("app_layers_question", "question_delete", function(){
		$('#app_layers_question').find("[question_id]").filter(function() {
			var id = parseInt($(this).attr("question_id"), 10);
			var item = Lincko.storage.get('question', id);
			if(!item){
				$(this)
					.find("[find=edit]")
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
								app_layers_question_refresh();
							},
						}
					);
			}
			return false;
		});
	});

	app_layers_question_new_animation = false;
	app_application_lincko.add("app_layers_question", "question", function(){
		var items = Lincko.storage.list('question', -1, null, 'pitch', this.action_param);
		var item;
		var Elem;
		var position;
		var time_limit = Lincko.now.getTimeServer()-(10*1000);
		for(var i in items){
			item = items[i];
			if($('#models_question_'+item['id']).length==0){
				Elem = $('#-models_question').clone();
				Elem.prop('id', 'models_question_'+item['id']);
				Elem.attr('created_at', item['created_at']);
				Elem.attr('question_id', item['id']);
				Elem.find("[find=title]").html( wrapper_to_html(item['title']) );
				Elem.find("[find=edit]").click(
					item['id'],
					function(event){
						event.stopPropagation();
						submenu_Build("app_question_edit", 1, true, event.data);
					}
				);
				Elem.click(
					item['id'],
					function(event){
						event.stopPropagation();
						app_content_menu.selection("answer", event.data);
					}
				);

				position = $('#app_layers_question').find("[created_at]").filter(function() { return parseInt($(this).attr("created_at"), 10) <= item['created_at']; }).first();
				if(position.length==1){
					position.before(Elem);
				} else {
					position = $('#app_layers_question').find("[find=wrapper]");
					Elem.appendTo(position);
				}
				if(app_layers_question_new_animation && 1000*item['created_at'] > time_limit){
					Elem
					.velocity(
						'transition.expandIn',
						{
							mobileHA: hasGood3Dsupport,
							duration: 500,
							delay: 10,
							display: 'inline-table',
							complete: function(){
								app_layers_question_refresh();
							},
						}
					);
				}
			} else {
				Elem = $('#models_question_'+item['id']);
				Elem.find("[find=title]").html( wrapper_to_html(item['title']) );
			}
		}
		app_layers_question_new_animation = true;
		app_layers_question_refresh();
	}, param);

	app_application_lincko.prepare("question", true);

};

var app_layers_question_icon_back = function(){
	if($("#app_layers_question_add_icon").length>0){
		$("#app_layers_question_add_icon").removeClass("app_layers_question_add_icon_fixed");
		$("#app_layers_question_add_icon").find("[find=add]").removeClass("display_none");
		$("#app_layers_question_add_icon").find("[find=input]").addClass("display_none");
		$("#app_layers_question_add_icon").css('cursor', '');
		$("#app_layers_question_add_icon").find("[find=input_textarea]").val("");
		$("#app_layers_question_add_icon").blur();
		wrapper_IScroll();
	}
};

var app_layers_question_icon_create = function(pitch_id){
	if($("#app_layers_question_add_icon").length>0){
		var data = {};
		data.set = {};
		data.set.question = {};
		var md5id = Lincko.storage.getMD5("question");
		var parent = Lincko.storage.get("pitch", pitch_id);
		var title = $("#app_layers_question_add_icon").find("[find=input_textarea]").val();
		title = title.replace(/(\r\n|\n|\r)/gm, " ");
		data.set.question[md5id] = {
			md5: md5id,
			parent_id: parent['id'],
			parent_md5: parent['md5'],
			title: title,
		};
		var Elem_bis = $("#app_layers_question_add_icon").find("[find=input_create]");
		var action_cb_success = function(msg, error, status, extra){
			storage_cb_success(msg, error, status, extra);
			if(!error){
				app_layers_question_icon_back();
			}
		}
		var action_cb_complete = function(){
			storage_cb_complete();
			base_hideProgress(Elem_bis);
			app_application_lincko.prepare("question", true);
			var item = Lincko.storage.findMD5(md5id, "question");
			if(item){
				setTimeout(function(parent_id){
					app_content_menu.selection("answer", parent_id);
				}, 400, item['id']);
			}
		};
		if(storage_offline(data)){
			base_showProgress(Elem_bis);
			wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
		}
	}
};
