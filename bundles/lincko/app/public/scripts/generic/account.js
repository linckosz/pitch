
var account_integration_code = false;

var account_error_timing;
var account_error_hide_timer = function(){
	clearTimeout(account_error_timing);
	account_error_timing = setTimeout(function(){ account_hide_error(); }, 2500);
}

function account_show() {
	account_hide_error();
	if(integration_wechat(true)){
		$('#account_integration_box').addClass('display_none');
		$('#account_integration_top_info').recursiveEmpty();
		return true;
	}
	$('#account_integration_top_info').recursiveEmpty();
	$('#account_integration_box').removeClass('display_none');
	$('#account_integration_top_text').html(wrapper_to_html(Lincko.Translation.get('base', 5, 'html'))); //Scan the QR code to sign in using your Wechat account
}

function account_hide_error(now) {
	if(typeof now == 'undefined'){ now = false; }
	if(now){
		$("#account_error, #account_error_mobile").hide();
	} else {
		if($('#account_error, #account_error_mobile').is(':visible')){
			$("#account_error, #account_error_mobile").velocity("transition.fadeOut", { duration: 500, delay: 100, });
		}
	}
}

var account_integration_wechat_timer;
var account_integration_wechat_qrcode = function(){
	clearInterval(account_integration_wechat_timer);
	if(isMobileApp()){
		//Call a native function
		if(device_type() == 'android' && typeof android == 'object' && typeof android.wxLogin == 'function'){ //android wechat login
			android.wxLogin(wrapper_timeoffset());
		} else if(device_type() == 'ios'){
			var login = {
				action: 'wxlogin',
				timeoffset: wrapper_timeoffset(),
			};
			window.webkit.messageHandlers.iOS.postMessage(login);
		}
	} else {
		var obj = new WxLogin({
			id: "account_integration_top_info",
			appid: account_integration.wechat.dev_appid, //This is using dev account, but openID is different from dev to public. Must use unionID to log in this scenario
			scope: "snsapi_login",
			redirect_uri: encodeURIComponent(top.location.protocol+"//"+document.linckoWechat+"/integration/wechat/redirect/dev/")+account_integration.wechat.redirect,
			state: "snsapi_userinfo",
			style: "black",
			href: account_integration.wechat.href,
		});
	}
};

$('#account_error, #account_error_mobile').click(function(){
	account_hide_error();
});

$('#account_language_select').on('change', function(){
	wrapper_change_language(this.value);
});

JSfiles.finish(function(){
	account_show();
	account_integration_wechat_qrcode();
	if(device_type()=='other'){ //allow click only for desktop
		$('#account_integration_top_info').find('img').click(function(){
			account_integration_wechat_qrcode();
		});
	}
});
