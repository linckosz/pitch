submenu_list['app_answer_new'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2113, 'html'), //Answer
	},
	"answertitle": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": function(Elem, subm){
			var items = Lincko.storage.list('answer', -1, null, 'question', subm.param);
			var param = {
				number: items.length+1,
			};
			return Lincko.Translation.get('app', 2109, 'html', param); //Answer #[{number]}
		},
		"class": "submenu_input_text",
		"now": function(Elem, subm){
			Elem.on('keypress', subm, function(event) {
				event.stopPropagation(); 
				if (event.which == 13) {
					event.data.Wrapper().find("[form=submit]").click();
				}
			});
		},

	},
	"create": {
		"style": "bottom_button",
		"title": Lincko.Translation.get('app', 41, 'html'), //Create
		"action": function(Elem, subm){
			var data = {};
			data.set = {};
			data.set.answer = {};
			var md5id = Lincko.storage.getMD5("answer");
			var parent = Lincko.storage.get("question", subm.param);
			data.set.answer[md5id] = {
				md5: md5id,
				parent_id: parent['id'],
				parent_md5: parent['md5'],
				title: subm.Wrapper().find("[name=title]").val(),
			};
			var Elem_bis = Elem;
			var subm_bis = subm;
			var action_cb_success = function(msg, error, status, extra){
				storage_cb_success(msg, error, status, extra);
				if(!error){
					subm_bis.Hide();
				}
			}
			var action_cb_complete = function(){
				storage_cb_complete();
				base_hideProgress(Elem_bis);
				app_application_lincko.prepare("answer", true);
			};
			if(storage_offline(data)){
				base_showProgress(Elem);
				wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
			}
		},
		"now": function(Elem, subm){
			Elem.find("[find=submenu_bottom_button]").attr('form', 'submit');
		},
	},
	"cancel": {
		"style": "bottom_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		"action": function(Elem, subm){
			subm.Hide();
		},
	},
};

submenu_list['app_answer_edit'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2113, 'html'), //Answer
	},
	"answer_title": {
		"style": "input_text",
		"title": Lincko.Translation.get('app', 28, 'html'), //Title
		"name": "title",
		"value": function(Elem, subm){
			return Lincko.storage.get('answer', subm.param, 'title');
		},
		"class": "submenu_input_text",
		"now": function(Elem, subm){
			Elem.on('keypress', subm, function(event) {
				event.stopPropagation(); 
				if (event.which == 13) {
					event.data.Wrapper().find("[form=submit]").click();
				}
			});
		},

	},
	"edit": {
		"style": "bottom_button",
		"title": Lincko.Translation.get('app', 43, 'html'), //Edit
		"action": function(Elem, subm){
			var data = {};
			data.set = {};
			data.set.answer = {};
			var item = Lincko.storage.get('answer', subm.param);
			data.set.answer[item['id']] = {
				id: item['id'],
				md5: item['md5'],
				title: subm.Wrapper().find("[name=title]").val(),
			};
			var Elem_bis = Elem;
			var subm_bis = subm;
			var action_cb_success = function(msg, error, status, extra){
				storage_cb_success(msg, error, status, extra);
			}
			var action_cb_complete = function(){
				storage_cb_complete();
				base_hideProgress(Elem_bis);
				app_application_lincko.prepare("answer", true);
			};
			if(storage_offline(data)){
				base_showProgress(Elem);
				wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
			}
			subm_bis.Hide();
		},
		"now": function(Elem, subm){
			Elem.find("[find=submenu_bottom_button]").attr('form', 'submit');
		},
	},
	"cancel": {
		"style": "bottom_button",
		"title": Lincko.Translation.get('app', 7, 'html'), //Cancel
		"action": function(Elem, subm){
			subm.Hide();
		},
	},
};

