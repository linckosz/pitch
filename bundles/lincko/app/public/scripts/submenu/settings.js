submenu_list['settings'] = {
	//Set the title of the top
	"_title": {
		"style": "title",
		"title": Lincko.Translation.get('app', 2, 'html'), //Settings
	},
	"profile_picture": {
		"style": "profile_photo",
		"title": "",
		"value": function(Elem, subm){
			return Lincko.storage.get('user', wrapper_localstorage.user_id, 'username');
		},
	},
	//Change the language
	"language": {
		"style": "next",
		"title": Lincko.Translation.get('app', 1, 'html'), //Language
		"next": "language",
		"value": submenu_language_full,
		"class": "",
	},
	"signout": {
		"style": "button",
		"title": Lincko.Translation.get('app', 38, 'html'), //Sign out
		"action": function(){
			if(!navigator.userAgent.match(/MicroMessenger/i)){
				wrapper_sendAction('', 'post', 'app/signout', null, null, wrapper_signout_cb_begin, wrapper_signout_cb_complete);
			}
		},
		"class": "display_none",
		"now": function(Elem, subm){
			if(!navigator.userAgent.match(/MicroMessenger/i)){
				Elem.removeClass('display_none');
			}
		},
	},
};

Submenu.prototype.style['profile_photo'] = function(submenu_wrapper, subm) {
	var user_id = wrapper_localstorage.user_id;
	var perso = Lincko.storage.get('user', user_id);
	var that = subm;
	var attribute = subm.attribute;
	var Elem = $('#-submenu_personal_profile').clone();
	var range = 'user_'+user_id;
	var temp_id = false;
	Elem.prop("id", '');
	if ("class" in attribute) {
		Elem.addClass(attribute['class']);
	}
	if ("value" in attribute) {
		if(typeof attribute.value == "function"){
			var value = attribute.value(Elem, that);
			Elem.find("[find=submenu_profile_user]").html(value);
		} else {
			Elem.find("[find=submenu_profile_user]").html(attribute.value);
		}
	}
	if ("now" in attribute && typeof attribute.now == "function") {
		attribute.now(Elem, that);
	}
	var Elem_pic = Elem.find("[find=submenu_profile_upload_picture]");
	Elem_pic
		.attr("preview", "0")
		.prop("id", that.id+"_submenu_profile_upload_picture")
		.css('background-image','url("'+app_application_icon_single_user.src+'")');
	var src = Lincko.storage.getProfile(user_id);
	if(src){
		Elem_pic.css('background-image','url("'+src+'")');
	} 

	Elem_pic.addClass("no_shadow");
	
	submenu_wrapper.find("[find=submenu_wrapper_content]").append(Elem);
	return true;
};
