<?php


namespace bundles\lincko\wrapper\models;

use \bundles\lincko\api\models\base\Token;
use \libs\Wechat;
use \libs\STR;

//This class help to reuse token and ticket stored in backend
class WechatPublic {

	protected static $access_token = false;
	protected static $expire_access_token = 0;

	protected static $jsapi_ticket = false;
	protected static $expire_jsapi_ticket = 0;

	protected static function refresh(){
		$app = \Slim\Slim::getInstance();
		$options = array(
			'appid' => $app->lincko->integration->wechat['public_appid'],
			'secret' => $app->lincko->integration->wechat['public_secretapp'],
		);
	
		$access_token = false;
		$expire_access_token = 0;
		if($token = Token::getToken('wechat_pub')){
			$access_token = $options['access_token'] = $token->token;
			$expire_access_token = $token->expired_at->getTimestamp();
		}
		$wechat = new Wechat($options);
		if(!$access_token){
			if($access_token = $wechat->getToken()){
				$token = Token::setToken('wechat_pub', $access_token, 3600); //toto => need to observe, it seems that the token is quickly unvalid (at least for .co)
				$expire_access_token = $token->expired_at->getTimestamp();
			}
		}

		$jsapi_ticket = false;
		$expire_jsapi_ticket = 0;
		if($token = Token::getToken('wechat_jsapi_ticket')){
			$jsapi_ticket = $token->token;
			$expire_jsapi_ticket = $token->expired_at->getTimestamp();
		}
		if(!$jsapi_ticket){
			if($jsapi_ticket = $wechat->getJsapiTicket()){
				$token = Token::setToken('wechat_jsapi_ticket', $jsapi_ticket, 3600);
				$expire_jsapi_ticket = $token->expired_at->getTimestamp();
			}
		}
			
		if(!$jsapi_ticket){
			unset($options['access_token']);
			$wechat = new Wechat($options);

			$access_token = $wechat->getToken();
			Token::setToken('wechat_pub', $access_token, 3600);
			$expire_access_token = $token->expired_at->getTimestamp();

			$jsapi_ticket = $wechat->getJsapiTicket();
			$token = Token::setToken('wechat_jsapi_ticket', $jsapi_ticket, 3600);
			$expire_jsapi_ticket = $token->expired_at->getTimestamp();
		}

		self::$access_token = $access_token;
		self::$expire_access_token = $expire_access_token;
		self::$jsapi_ticket = $jsapi_tickett;
		self::$expire_jsapi_ticket = $expire_jsapi_ticket;

	}

	public static function access_token(){
		$app = \Slim\Slim::getInstance();
		if(self::$expire_access_token <= time() || !self::$access_token){
			self::refresh();
			if(self::$expire_access_token <= time() || !self::$access_token){
				self::$access_token = false;
				self::$expire_access_token = 0;
				$option = array();
				$option['appid'] = $app->lincko->integration->wechat['public_appid'];
				$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
				$wechat = new Wechat($option);
				if(self::$access_token = $wechat->getToken()){
					self::$expire_access_token = time() + 3600;
				}
			}
		}
		return self::$access_token;
	}

	public static function jsapi_ticket(){
		$app = \Slim\Slim::getInstance();
		if(self::$expire_jsapi_ticket <= time() || !self::$jsapi_ticket){
			self::refresh();
			if(self::$expire_jsapi_ticket <= time() || !self::$jsapi_ticket){
				self::$jsapi_ticket = false;
				self::$expire_jsapi_ticket = 0;
				$option = array();
				$option['appid'] = $app->lincko->integration->wechat['public_appid'];
				$option['secret'] = $app->lincko->integration->wechat['public_secretapp'];
				if($option['access_token'] = self::access_token()){
					$wechat = new Wechat($option);
					if(self::$jsapi_ticket = $wechat->getJsapiTicket()){
						self::$expire_jsapi_ticket = time() + 3600;
					}
				}
			}
		}
		return self::$jsapi_ticket;
	}

	//added by Sky Park
	//used for wechat JSSDK, for javascript wx.config parameters
	public static function getPackage(){
		$app = \Slim\Slim::getInstance();
		$ticket = self::jsapi_ticket();
		$url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];
		if($app->lincko->data['user_info_0'] == 'Macintosh'){
			$url .= $_SERVER['REQUEST_URI'];
		} else {
			$url .= '/';
		}
		$nonceStr = STR::random(16);
		$timestamp = time();
		$signature = sha1("jsapi_ticket=$ticket&noncestr=$nonceStr&timestamp=$timestamp&url=$url");
		$result['appId'] = $app->lincko->integration->wechat['public_appid'];
		$result['timestamp'] = $timestamp;
		$result['nonceStr'] = $nonceStr;
		$result['signature'] = $signature;
		return $result;
	}

}
