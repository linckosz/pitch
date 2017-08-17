
var integration_wechat = function(){
	if(typeof account_integration == 'object'){
		if(!account_integration.wechat.stop){
			window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+account_integration.wechat.public_appid+"&redirect_uri="+encodeURIComponent(top.location.protocol)+"%2F%2F"+document.linckoWechat+"%2Fintegration%2Fwechat%2Fredirect%2Fpub%2F"+account_integration.wechat.redirect+"&response_type=code&scope=snsapi_base&state=snsapi_base#wechat_redirect";
		}
	}
}
