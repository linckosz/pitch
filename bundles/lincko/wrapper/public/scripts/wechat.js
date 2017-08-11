var integration_wechat = function(force){
	if(typeof force == "undefined"){
		force = false;
	}
	if( ((!wrapper_localstorage.logged) || force) && navigator.userAgent.match(/MicroMessenger/i) && account_integration && account_integration.wechat && !account_integration.wechat.stop){
		if(account_integration.wechat.base){
			window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri="+encodeURIComponent(top.location.protocol)+"%2F%2F"+document.linckoWechat+"%2Fintegration%2Fwechat%2Fredirect%2Fpub%2F"+account_integration.wechat.redirect+"&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect";
			return true;
		} else {
			window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri="+encodeURIComponent(top.location.protocol)+"%2F%2F"+document.linckoWechat+"%2Fintegration%2Fwechat%2Fredirect%2Fpub%2F"+account_integration.wechat.redirect+"&response_type=code&scope=snsapi_userinfo&state=snsapi_userinfo#wechat_redirect";
			return true;
		}
	}
	return false;
}
integration_wechat();
