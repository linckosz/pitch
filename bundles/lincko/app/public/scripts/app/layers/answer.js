
function app_layers_answer_launchPage(param){
	if(typeof param === 'undefined'){ param = null; }
	app_layers_answer_feedPage(param);

	$('#app_content_top_title_pitches, #app_content_top_title_questions, #app_content_top_title_answers').removeClass('display_none');

	$('#app_content_top_title_menu').find('.app_content_top_title_select_opened').removeClass('app_content_top_title_select_opened');
	$('#app_content_top_title_select_answers').addClass('app_content_top_title_select_opened');
}

var app_layers_answer_refresh_timer;
var app_layers_answer_refresh = function(timer){
	if(typeof timer == 'undefined'){
		timer = wrapper_timeout_timer;
	}
	clearTimeout(app_layers_answer_refresh_timer);
	app_layers_answer_refresh_timer = setTimeout(function(){
		//Delete the last border in Mobile mode
		var layer = $('#app_layers_content');
		layer.find('.models_answer_standard_last').removeClass('models_answer_standard_last');
		layer.find('.models_answer_standard').last().addClass('models_answer_standard_last');
		wrapper_IScroll();
	}, timer);
}
$(window).resize(app_layers_answer_refresh);

var app_layers_answer_clipboard_question = false;
var app_layers_answer_clipboard_answer = false;

var app_layers_answer_new_animation = false;
var app_layers_answer_feedPage = function(param){
	if(typeof param == 'undefined'){ param = null; }
	var sub_layer = $('#app_layers_answer');
	sub_layer.addClass('overthrow');
	sub_layer.recursiveEmpty();
	$('<div find="wrapper" class="app_layers_answer_wrapper"></div>').appendTo(sub_layer);
	var position_wrapper = sub_layer.find("[find=wrapper]");

	app_content_top_title._set('question', param);
	var question = Lincko.storage.get('question', param);
	var pitch = false;
	if(question){
		pitch = Lincko.storage.getParent('question', question['id']);
	}

	var pitch_timer = {};
	if(pitch){
		var item = pitch;
		app_content_top_title._set('pitch', item['id']);
		Elem = $('#-models_pitch_top').clone();
		Elem.prop('id', 'models_pitch_top_'+item['id']);

		Elem.find("[find=ppt]").click(
			item['id'],
			function(event){
				event.stopPropagation();
				Lincko.storage.downloadPPT(event.data);
			}
		);
		
		Elem.find("[find=input_textarea]").val(item['title']);
		//Create new item
		pitch_timer[item['id']] = null;
		Elem.find("[find=input_textarea]").on('blur keyup input', item['id'], function(event){
			var timer = 2000;
			if(event.type=="blur"){
				timer = 0;
			}
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
			}, timer, pitch_id, data);
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
			if(event.which == 13 || event.which == 27){
				$(this).blur();
			}
			var rows_prev = parseInt($(this).attr('rows'), 10);
			$(this).textareaRows();
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

	var question_timer = {};
	if(question){
		var item = question;
		app_content_top_title._set('question', item['id']);
		Elem = $('#-models_question_top').clone();
		Elem.prop('id', 'models_question_top_'+item['id']);

		Elem.find("[find=input_textarea]").val(item['title']);
		//Create new item
		question_timer[item['id']] = null;
		Elem.find("[find=input_textarea]").on('blur keyup input', item['id'], function(event){
			var timer = 2000;
			if(event.type=="blur"){
				timer = 0;
			}
			var str = $(this).val();
			var question_id = event.data;
			var question = Lincko.storage.get('question', question_id);
			if(question){
				title = str.replace(/(\r\n|\n|\r)/gm, " ");
				var data = {};
				data.set = {};
				data.set.question = {};
				data.set.question[question['id']] = {
					id: question['id'],
					md5: question['md5'],
					title: title,
				};
			}
			clearTimeout(question_timer[question_id]);
			question_timer[question_id] = setTimeout(function(question_id, data){
				if(storage_offline(data)){
					wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
				}
			}, timer, question_id, data);
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
			if(event.which == 13 || event.which == 27){
				$(this).blur();
			}
			var rows_prev = parseInt($(this).attr('rows'), 10);
			$(this).textareaRows();
			if(rows_prev != parseInt($(this).attr('rows'), 10)){
				wrapper_IScroll();
			}
		});

		Elem.appendTo(position_wrapper);
		app_application_lincko.add('models_question_top_'+question['id'], "question_"+question['id'], function(){
			var item = Lincko.storage.get('question', this.action_param);
			if(item){
				$("#"+this.id).find("[find=title]").val( item['title'] );
			}
		}, question['id']);
	} else {
		app_content_top_title._set('pitch', null);
		app_content_top_title._set('question', null);
		app_content_top_title._set('answer', null);
		app_content_menu.selection("pitch");
		return false;
	}

	Elem = $('#-app_layers_answer_style').clone();
	Elem.prop('id', '');
	Elem.find("[find=select_style]").on('change', question['id'], function(event){
		var data = {};
		data.set = {};
		data.set.question = {};
		var item = Lincko.storage.get('question', event.data);
		if(item){
			data.set.question[item['id']] = {
				id: item['id'],
				md5: item['md5'],
				style: this.value,
			};
			if(storage_offline(data)){
				app_layers_answer_answers_style(this.value);
				app_layers_answer_answers_correct(item, false, true);
				wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
			}
		}
		$(this).css("background-image", "url('"+app_layers_icon_source30(this.value)+"')");
	});
	Elem.find("[find=select_style]").css("background-image", "url('"+app_layers_icon_source30(question['style'])+"')");
	//Preselect
	Elem.find("option").each(function(){
		if($(this).val() == question['style']){
			this.selected = true;
		}
	});
	Elem.appendTo(position_wrapper);
	app_application_lincko.add("app_layers_answer", "question_"+question['id']+"_style", function(){
		var question = Lincko.storage.get("question", this.action_param);
		var style = question["style"];
		var current = $("#app_layers_answer").find("[find=select_style]").val();
		if(style && style!=current){
			$("#app_layers_answer").find("[find=select_style]").val(style).change();
			app_layers_answer_answers_style(style);
			app_layers_answer_answers_correct(question, false, true);
		}
	}, question['id']);

	//Preview button
	Elem = $('#-app_layers_answer_preview').clone();
	Elem.prop('id', 'app_layers_answer_preview');
	Elem.on('click', question['id'], function(event){
		showppt_launch(event.data);
	});
	Elem.appendTo(position_wrapper);

	//Question image
	Elem = $('#-app_layers_answer_question').clone();
	Elem.prop('id', 'app_layers_answer_question');
	Elem.find("[find=add]").on('click', question['id'], function(event){
		var item = Lincko.storage.get('question', event.data);
		var temp_id = app_upload_open_photo_single('question', item['id'], item['md5'], false, true);	
		app_layers_answer_upload_status($(this), temp_id, true);
	});
	Elem.find("[find=image]").on('click', question['id'], function(event){
		var item = Lincko.storage.get('question', event.data);
		previewer(item['file_id']);
	});
	Elem.appendTo(position_wrapper);
	app_layers_answer_answers_question_image(question['id']);
	app_application_lincko.add("app_layers_answer_question", "question_"+question['id'], function(){
		app_layers_answer_answers_question_image(this.action_param);
	}, question['id']);

	//Add 4 answer (2 last are optional)
	var answer_timer = {};
	var answers_wrapper = $('<div find="answers_wrapper" class="app_layers_answer_answers_table app_layers_answer_answers_wrapper"></div>');
	var items = Lincko.storage.list('answer', 4, null, 'question', question['id']);
	items = Lincko.storage.sort_items(items, 'number');
	for(var i in items){
		var item = items[i];
		Elem = $('#-app_layers_answer_answers').clone();
		Elem.prop('id', 'app_layers_answer_answers_'+item['id']);
		Elem.data('id', item['id']);
		Elem.data('unavailable', false);
		Elem.addClass('number_'+item['number']);
		Elem.find("[find=number]").html(item['number']);
		//Change correct answer
		Elem.find("[find=answer_select]").on('click', [question['id'], item['id']], function(event){
			event.stopPropagation();
			var question = Lincko.storage.get('question', event.data[0]);
			var answer_id = event.data[1];
			app_layers_answer_answers_correct(question, answer_id, true);
		});
		Elem.find("[find=input_textarea]").val(item['title']);
		var letter = String.fromCharCode(64 + parseInt(item['number']), 10);
		letter = letter.replace(/(\r\n|\n|\r)/gm, "");
		Elem.find("[find=answer_letter]").text(letter);
		//Create new item
		answer_timer[item['id']] = null;
		Elem.find("[find=input_textarea]").on('blur keyup input', item['id'], function(event){
			var timer = 2000;
			if(event.type=="blur"){
				timer = 0;
			}
			var str = $(this).val();
			var answer_id = event.data;
			var answer = Lincko.storage.get('answer', answer_id);
			if(answer){
				title = str.replace(/(\r\n|\n|\r)/gm, " ");
				var data = {};
				data.set = {};
				data.set.answer = {};
				data.set.answer[answer['id']] = {
					id: answer['id'],
					md5: answer['md5'],
					title: title,
				};
				if(storage_offline(data)){
					var question = Lincko.storage.getParent('answer', answer_id);
					if(question){
						app_layers_answer_answers_correct(question, false, true);
					}
				}
				clearTimeout(answer_timer[answer_id]);
				answer_timer[answer_id] = setTimeout(function(answer_id, data){
					wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
				}, timer, answer_id, data);
			}
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
			if(event.which == 13 || event.which == 27){
				$(this).blur();
			}
			var rows_prev = parseInt($(this).attr('rows'), 10);
			$(this).textareaRows();
			if(rows_prev != parseInt($(this).attr('rows'), 10)){
				wrapper_IScroll();
			}
		});

		Elem.find("[find=answer_add]").on('click', item['id'], function(event){
			event.stopPropagation();
			var answer = Lincko.storage.get('answer', event.data);
			var temp_id = app_upload_open_photo_single('answer', answer['id'], answer['md5'], false, true);
			app_layers_answer_upload_status($(this), temp_id, true);
		});
		Elem.find("[find=answer_image]").on('click', item['id'], function(event){
			event.stopPropagation();
			var answer = Lincko.storage.get('answer', event.data);
			previewer(answer['file_id']);
		});

		Elem.on('click', [question['id'], item['id']], function(event){
			if(Lincko.storage.get('question', event.data[0], 'style')==2){ //Only only for picture style
				event.stopPropagation();
				var answer = Lincko.storage.get('answer', event.data[1]);
				if(answer['file_id'] && Lincko.storage.get('file', answer['file_id'])){
					previewer(answer['file_id']);
				} else {
					var temp_id = app_upload_open_photo_single('answer', answer['id'], answer['md5'], false, true);
					app_layers_answer_upload_status($(this), temp_id, true);
				}
			}
		});

		Elem.appendTo(answers_wrapper);
	}
	answers_wrapper.appendTo(position_wrapper);

	//URL buttons
	Elem = $('#-app_layers_answer_url').clone();
	Elem.prop('id', 'app_layers_answer_url');

	var question_url = Lincko.storage.getURL(question['id'], 'question');
	Elem.find("[find=question_url]").html(question_url);
	Elem.find("[find=question]").attr('data-clipboard-text', question_url);
	if(app_layers_answer_clipboard_question && destroy in app_layers_answer_clipboard_question){
		app_layers_answer_clipboard_question.destroy();
	}
	var app_layers_answer_clipboard_question = new Clipboard(Elem.find("[find=question]")[0]);
	app_layers_answer_clipboard_question.on('success', function(event) {
		var msg = Lincko.Translation.get('app', 70, 'html')+"\n"+event.text; //URL copied to the clipboard
		base_show_error(msg, false); 
		event.clearSelection();
	});
	app_layers_answer_clipboard_question.on('error', function(event) {
		var msg = Lincko.Translation.get('app', 71, 'html'); //Your system does not allow to copy to the clipboard
		base_show_error(msg, true);
		event.clearSelection();
	});

	var answer_url = Lincko.storage.getURL(question['id'], 'answer');
	Elem.find("[find=answer_url]").html(answer_url);
	Elem.find("[find=answer]").attr('data-clipboard-text', answer_url);
	if(app_layers_answer_clipboard_answer && destroy in app_layers_answer_clipboard_answer){
		app_layers_answer_clipboard_answer.destroy();
	}
	var app_layers_answer_clipboard_answer = new Clipboard(Elem.find("[find=answer]")[0]);
	app_layers_answer_clipboard_answer.on('success', function(event) {
		var msg = Lincko.Translation.get('app', 70, 'html')+"\n"+event.text; //URL copied to the clipboard
		base_show_error(msg, false); 
		event.clearSelection();
	});
	app_layers_answer_clipboard_answer.on('error', function(event) {
		var msg = Lincko.Translation.get('app', 71, 'html'); //Your system does not allow to copy to the clipboard
		base_show_error(msg, true);
		event.clearSelection();
	});

	Elem.find("[find=ppt]").on('click', pitch['id'], function(event){
		event.stopPropagation();
		Lincko.storage.downloadPPT(event.data);
	});

	Elem.appendTo(position_wrapper);

	//Draw to DOM

	position_wrapper.find("[find=input_textarea]").textareaRows();

	for(var i in items){
		var item = items[i];
		$('#app_layers_answer_answers_'+item['id']).find("[find=input_textarea]").textareaRows();
		app_layers_answer_answers_picture_image(item['id']);
		app_application_lincko.add("app_layers_answer_answers_"+item['id'], "answer_"+item['id'], function(){
			$('#app_layers_answer_answers_'+this.action_param[1]).find("[find=input_textarea]").textareaRows();
			app_layers_answer_answers_picture_image(this.action_param[1]);
			var question = Lincko.storage.get('question', this.action_param[0]);
			if(question){
				app_layers_answer_answers_correct(question, false, true);
			}
		}, [question['id'], item['id']]);
	}

	app_layers_answer_answers_style(question['style']);
	
	app_layers_answer_answers_correct(question, question['answer_id'], true);

	app_layers_answer_refresh(0);

	app_application_lincko.add("app_layers_answer", ["question_"+question['id']+"_answer_id", "answer"], function(){
		var question = Lincko.storage.get('question', this.action_param);
		app_layers_answer_answers_correct(question, question['answer_id'], true);
	}, question['id']);

	app_application_lincko.add("app_layers_answer", "answer_delete", function(){
		$('#app_layers_answer').find("[answer_id]").filter(function() {
			var id = parseInt($(this).attr("answer_id"), 10);
			var item = Lincko.storage.get('answer', id);
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
								app_layers_answer_refresh();
							},
						}
					);
			}
			return false;
		});
	});

	app_layers_answer_new_animation = false;
	app_application_lincko.add("app_layers_answer", "answer", function(){
		var items = Lincko.storage.list('answer', -1, null, 'question', this.action_param);
		var item;
		var Elem;
		var position;
		var time_limit = Lincko.now.getTimeServer()-(10*1000);
		for(var i in items){
			item = items[i];
			if($('#models_answer_'+item['id']).length==1){
				Elem = $('#models_answer_'+item['id']);
				Elem.find("[find=title]").html( wrapper_to_html(item['title']) );
			}
		}
		app_layers_answer_new_animation = true;
		app_layers_answer_refresh();
	}, param);

	app_application_lincko.prepare("answer", true);

	//Launch onboarding
	if(!Lincko.storage.onboarding_stop){
		var tuto = Lincko.storage.get('user', wrapper_localstorage.user_id, 'tuto');
		if(tuto){
			var item = app_generic_state.getItem(tuto);
			if(typeof item.id != 'undefined' && item.id == param && item._type == 'question'){
				Lincko.storage.onboarding_stop = true;
				setTimeout(function(){
					//app_layers_answer_grumble_mask(); //Note: Can be annoying for UX because of the double click
					app_layers_answer_grumble_1();
					app_layers_answer_grumble_2();
					app_layers_answer_grumble_3();
				}, 400);
			}
		}
	}
};

var app_layers_answer_grumble_mask = function(){
	Elem = $('#-app_layers_answer_mask').clone();
	Elem.prop('id', 'app_layers_answer_mask');
	Elem.on('click', function(event){
		$(document.body).trigger('click.bubble');
		event.stopPropagation();
		return false;
	});
	$('#app_layers_answer').find("[find=wrapper]").append(Elem);
};

var app_layers_answer_grumble_mask_hide = function(){
	if($("#app_layers_answer_mask").length>0){
		$("#app_layers_answer_mask").recursiveRemove();
	}
};

var app_layers_answer_grumble_action = function(){
	var data = {};
	data.set = {};
	data.set.user = {};
	var item = Lincko.storage.get('user', wrapper_localstorage.user_id);
	data.set.user[item['id']] = {
		id: item['id'],
		md5: item['md5'],
		tuto: null,
	};
	
	if(storage_offline(data)){
		wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
	}
};

var app_layers_answer_grumble_1 = function(){
	//http://jamescryer.github.io/grumble.js/
	$('#app_content_top_home').grumble(
		{
			text: Lincko.Translation.get('app', 129, 'html'), //Main Menu
			size: 100,
			sizeRange: [100],
			angle: 140,
			distance: 8,
			showAfter: 200,
			hideOnClick: true,
			type: 'alt-',
			useRelativePositioning: false,
			onBeginHide: function(){
				app_layers_answer_grumble_action();
			},
		}
	);
};

var app_layers_answer_grumble_2 = function(){
	//http://jamescryer.github.io/grumble.js/
	$('#app_layers_answer_preview').find("[find=eye]").grumble(
		{
			text: Lincko.Translation.get('app', 125, 'html'), //See how cool it will be!
			size: 150,
			sizeRange: [150],
			angle: 200,
			distance: 8,
			showAfter: 400,
			hideOnClick: true,
			type: 'alt-',
			useRelativePositioning: true,
			onBeginHide: function(){
				app_layers_answer_grumble_mask_hide();
				app_layers_answer_grumble_action();
			},
		}
	);
};

var app_layers_answer_grumble_3 = function(){
	var grumble_3_distance = 2 + $('#app_layers_answer_url').find("[find=ppt]").outerHeight();
	$('#app_layers_answer_url').find("[find=ppt_wrapper]").grumble(
		{
			text: Lincko.Translation.get('app', 127, 'html'), //Download your PPT file here
			size: 150,
			sizeRange: [150],
			angle: 340,
			distance: grumble_3_distance,
			showAfter: 600,
			hideOnClick: true,
			type: 'alt-',
			useRelativePositioning: true,
			onBeginHide: function(){
				app_layers_answer_grumble_mask_hide();
			},
		}
	);
};

app_application_lincko.add(function(){
	$('#app_layers_answer').find("[find=input_textarea]").each(function(){
		$(this).textareaRows();
	});
}, "resize");

var app_layers_answer_answers_correct = function(question, answer_id, force_update){
	if(question['style']!=3){ //Don't change for statistics
		if($('#app_layers_answer_answers_'+answer_id).data('unavailable')){
			//Skip the click if the selection is unavailable
			return false;
		}
		if(typeof answer_id == 'undefined'){ answer_id = question['answer_id']; }
		if(typeof force_update == 'undefined'){ force_update = false; }
		var answer = Lincko.storage.get('answer', answer_id);

		if(question['style']==2){ //Pictures
			if(!answer || !answer['file_id']){ //Exlude no file attach
				var answer = Lincko.storage.get('answer', question['answer_id']); //Keep current selection
				if(!answer || !answer['file_id']){ //Exlude no file attach
					var items = Lincko.storage.list('answer', 4, { file_id: ['!=', null], }, 'question', question['id']);
					items = Lincko.storage.sort_items(items, 'number');
					for(var i in items){
						if(Lincko.storage.get('file', items[i]['file_id'])){
							answer = items[i];
							break;
						}
					}
				}
			}
		} else {
			if(!answer || (answer['title']=="" && !answer['file_id'])){ //Exlude empty responses and no file attach
				var answer = Lincko.storage.get('answer', question['answer_id']); //Keep current selection
				if(!answer || (answer['title']=="" && !answer['file_id'])){ //Exlude empty responses and no file attach
					var items = Lincko.storage.list('answer', 4, [{ title: ['!=', ''], }, { file_id: ['!=', null], }], 'question', question['id']);
					items = Lincko.storage.sort_items(items, 'number');
					for(var i in items){
						if(Lincko.storage.get('file', items[i]['file_id'])){
							answer = items[i];
							break;
						}
					}
				}
			}
		}

		if(answer && answer['id'] != question['answer_id'] ){
			force_update = true;
			var data = {};
			data.set = {};
			data.set.question = {};
			data.set.question[question['id']] = {
				id: question['id'],
				md5: question['md5'],
				answer_id: answer['id'],
				answer_md5: answer['md5'],
			};
			if(storage_offline(data)){
				wrapper_sendAction(data, 'post', 'api/data/set', storage_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
			}
		}
		if(force_update){
			$('#app_layers_answer').find(".ok").removeClass('ok');
			if(answer){
				$('#app_layers_answer_answers_'+answer['id']).find("[find=answer_select], [find=row]").addClass('ok');
			}
		}
	}
	if(force_update){
		//Disable the empty answers
		$('#app_layers_answer').find("[find=answer]").each(function(){
			var answer = Lincko.storage.get('answer', $(this).data('id'));
			var unavailable = true;
			if(question['style']==2){ //Pictures
				if(answer && answer['file_id'] && Lincko.storage.get('file', answer['file_id'])){
					unavailable = false;
				}
			} else {
				if(answer && (answer['title']!='' || answer['file_id'] && Lincko.storage.get('file', answer['file_id']))){
					unavailable = false;
				}
			}
			if(unavailable){
				$(this).data('unavailable', true);
				$(this).find("[find=tickbox], [find=answer_select]").addClass('unavailable');
			} else {
				$(this).data('unavailable', false);
				$(this).find("[find=tickbox], [find=answer_select]").removeClass('unavailable');
			}
		});
	}
	return true;
}

var app_layers_answer_answers_style = function(style){
	//Change the display
	if(style==1){ //Questions
		$("#app_layers_answer").find("*").removeClass('pictures statistics').addClass('questions');
	} else if(style==2){ //Pictures
		$("#app_layers_answer").find("*").removeClass('questions statistics').addClass('pictures');
	} else if(style==3){ //Statistics
		$("#app_layers_answer").find("*").removeClass('questions pictures').addClass('statistics');
	}
};

var app_layers_answer_answers_question_image = function(question_id){
	var question = Lincko.storage.get('question', question_id);
	if(question){
		var file = Lincko.storage.get('file', question['file_id']);
		if(file){
			var thumbnail = Lincko.storage.getFile(file['id'], 'thumbnail');
			if(!thumbnail){
				thumbnail = Lincko.storage.getFile(file['id']);
			}
			$('#app_layers_answer_question').find("[find=add]").addClass('display_none');
			$('#app_layers_answer_question').find("[find=image]")
				.removeClass('display_none')
				.attr('src', thumbnail);
			return true;
		}
	}
	$('#app_layers_answer_question').find("[find=add]").removeClass('display_none');
	$('#app_layers_answer_question').find("[find=image]").addClass('display_none');
};

var app_layers_answer_answers_picture_image = function(answer_id){
	var answer = Lincko.storage.get('answer', answer_id);
	if(answer){
		var file = Lincko.storage.get('file', answer['file_id']);
		if(file){
			var thumbnail = Lincko.storage.getFile(file['id'], 'thumbnail');
			if(!thumbnail){
				thumbnail = Lincko.storage.getFile(file['id']);
			}
			$('#app_layers_answer_answers_'+answer_id).find("[find=answer_add]").addClass('display_none');
			$('#app_layers_answer_answers_'+answer_id).find("[find=answer_image]")
				.removeClass('display_none')
				.attr('src', thumbnail);
			$('#app_layers_answer_answers_'+answer_id).find("[find=row]")
				.css("background-image", "url('"+thumbnail+"')");
			return true;
		}
	}
	$('#app_layers_answer_answers_'+answer_id).find("[find=answer_add]").removeClass('display_none');
	$('#app_layers_answer_answers_'+answer_id).find("[find=answer_image]")
		.addClass('display_none')
		.attr('src', wrapper_neutral.src);
	$('#app_layers_answer_answers_'+answer_id).find("[find=row]")
			.css("background-image", "url('"+wrapper_neutral.src+"')");
};

var app_layers_answer_upload_status_list = {};
var app_layers_answer_upload_status_progress = {};
var app_layers_answer_upload_status = function(Elem, temp_id, fill){
	if(typeof fill != 'boolean'){ fill = false; }
	Elem.find("[find=progress]").addClass('display_none');
	Elem.find("[find=progress]").html('');
	if(!navigator.userAgent.match(/webkit/i)){
		fill = false;
	}
	Elem.find("[find=progress]").html('0%');
	app_layers_answer_upload_status_list[temp_id] = app_application_garbage.add(temp_id);
	app_application_lincko.add(app_layers_answer_upload_status_list[temp_id], 'upload', function() {
		var Elem = this.action_param[0];
		var temp_id = this.action_param[1];
		var data = app_upload_files.getData(temp_id);
		var fill = this.action_param[2];
		if(typeof app_layers_answer_upload_status_progress[temp_id] != 'undefined' && (!data || Elem.length<=0)){
			delete app_layers_answer_upload_status_list[temp_id];
			delete app_layers_answer_upload_status_progress[temp_id];
			Elem
				.css('background', '')
				.removeClass('app_layers_answer_webkit_progress')
				.removeClass('app_layers_answer_upload_error');
			Elem.find("[find=progress]")
				.addClass('display_none')
				.html('');
			app_application_garbage.remove(this.id);
		} else if(data){
			var progress = Math.floor(data.lincko_progress);
			var error = false;
			if($.inArray(data.lincko_status, ['abort', 'failed', 'error', 'deleted']) >= 0){
				error = true;
				Elem.addClass('app_layers_answer_upload_error');
			} else {
				if(progress<100 && data.lincko_status!='done'){
					app_layers_answer_upload_status_progress[temp_id] = Math.floor(data.lincko_progress);
				}
				if(data.lincko_status=='done'){
					app_layers_answer_upload_status_progress[temp_id] = 100;
				}
				Elem.removeClass('app_layers_answer_upload_error');
			}
			progress = app_layers_answer_upload_status_progress[temp_id];
			if(fill){
				Elem.addClass('app_layers_answer_webkit_progress');
				if(error){
					Elem.css('background', '-webkit-linear-gradient(bottom, rgba(185, 124, 103, 0.8) '+(progress-5)+'%, rgba(255, 255, 255, 0.2) '+(progress+5)+'%');
				} else {
					Elem.css('background', '-webkit-linear-gradient(bottom, rgba(255, 255, 255, 0.8) '+(progress-5)+'%, rgba(255, 255, 255, 0.2) '+(progress+5)+'%');
				}
			} else {
				Elem.find("[find=progress]").removeClass('display_none');
			}
			if(error){
				Elem.find("[find=progress]").html('');
			} else {
				Elem.find("[find=progress]").html(progress+'%');
			}
		}
	}, [Elem, temp_id, fill]);
};
