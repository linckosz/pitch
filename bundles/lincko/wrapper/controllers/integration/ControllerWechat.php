<?php

namespace bundles\lincko\wrapper\controllers\integration;

use \bundles\lincko\api\models\base\Token;
use \bundles\lincko\api\models\data\Login;
use \bundles\lincko\api\models\data\User;
use \bundles\lincko\api\models\data\Guest;
use \libs\Controller;
use \libs\Vanquish;
use \libs\Wechat;
use \libs\Json;
use \libs\Translation;

class ControllerWechat extends Controller {

	protected $app = NULL;
	protected $get = NULL;
	protected $appid = NULL;
	protected $secret = NULL;

	public function __construct(){
		$app = $this->app = \Slim\Slim::getInstance();
		$this->get = (array) $app->request->get();
		return true;
	}

	public function lincko_get($timeoffset=0){
		$app = $this->app;
		$this->appid = $app->lincko->integration->wechat['public_appid'];
		$this->secret = $app->lincko->integration->wechat['public_secretapp'];
		$this->process('pub', $timeoffset);
	}

	//This function help to log within wechat browser because wechat does not allow multiple subdomain confirmation
	public function redirect_get($account, $redirect){
		$app = $this->app;
		$app->response->headers->set('Content-Type', 'text/html; charset=UTF-8');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$url = base64_decode($redirect).'?wechat_account='.$account.'&wechat_response='.base64_encode(json_encode($_GET));
		echo '
			<script>
				window.location.href = "'.$url.'";
			</script>
		';
		return true;
	}

	public function response($response, $account='pub'){
		$app = $this->app;
		$this->get = (array) $response;
		if($account=='dev'){
			$this->appid = $app->lincko->integration->wechat['dev_appid'];
			$this->secret = $app->lincko->integration->wechat['dev_secretapp'];
		} else {
			$account = 'pub';
			$this->appid = $app->lincko->integration->wechat['public_appid'];
			$this->secret = $app->lincko->integration->wechat['public_secretapp'];
		}
		$this->process($account);
	}

	public function get_token_post(){

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

		$msg = array(
			'access_token' => $access_token,
			'expire_access_token' => $expire_access_token,
			'jsapi_ticket' => $jsapi_ticket,
			'expire_jsapi_ticket' => $expire_jsapi_ticket,
		);
		(new Json($msg))->render();
		return exit(0);
	}

	protected function process($account){
		$app = $this->app;
		$response = $this->get;
		$access_token = false;
		$unionid = false;
		$openid = false;
		$state = false;
		$valid = false;

		if($response && isset($response['code']) && isset($response['state'])){
			$state = $response['state'];
			$param = array(
				'appid' => $this->appid,
				'secret' => $this->secret,
				'code' => $response['code'],
			);
			$response = $this->curl_get('authorization_code', $param);
			if($response && $result = json_decode($response)){
				if(isset($result->errcode)){
					$response = false;
				}
			}
		} else {
			$response = false;
		}

		if($state == 'snsapi_userinfo'){
			if($response && $result = json_decode($response)){
				if(isset($result->unionid)){
					$unionid = $result->unionid;
				}
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid)){
					$access_token = $result->access_token;
					$openid = $result->openid;
					$param = array(
						'access_token' => $access_token,
						'openid' => $openid,
						'lang' => $app->trans->getClientLanguage(),
					);
					$response = $this->curl_get('snsapi_userinfo', $param);
					if($response && $result = json_decode($response)){
						if(isset($result->errcode)){
							$response = false;
						}
					}
				}
			} else {
				$response = false;
			}

			if($response && $access_token && $unionid && !empty($unionid) && $result = json_decode($response)){

				$user = false;
				if($login_union = Login::where('party', 'unionid')->where('party_id', $unionid)->first()){
					if(!$user){
						$user = User::find($login_union->user_id);
					}
				} else {
					$login_union = new Login;
					$login_union->party = 'unionid';
					$login_union->party_id = $unionid;
				}
				$login_union->party_json = $response;

				if($login_open = Login::where('party', 'openid'.$account)->where('party_id', $openid)->first()){
					if(!$user){
						$user = User::find($login_union->user_id);
					}
				} else {
					$login_open = new Login;
					$login_open->party = 'openid'.$account;
					$login_open->party_id = $openid;
				}
				$login_open->party_json = $response;

				if(!$user){
					$user = new User;
					$user->md5 = md5(uniqid('', true));
				}

				$user->username = $result->nickname;
				$user->gender = intval($result->sex);
				if(isset($result->headimgurl)){
					$user->headimgurl = $result->headimgurl;
				}
				if(isset($result->language)){
					$translation = new Translation;
					$translation->getList('base');
					if($language = $translation->setLanguage($result->language)){
						$user->language = strtolower($language);
					}
				}
				if($user->save()){
					$login_union->user_id = $user->id;
					$login_union->save();
					$login_open->user_id = $user->id;
					$login_open->save();
					$app->lincko->data['uid'] = $user->id;
					Vanquish::set(array('user_id' => $user->id));
					Vanquish::set(array('user_md5' => $user->md5));
					Vanquish::set(array('user_username' => $user->username));
					Vanquish::set(array('user_language' => $user->language));
					\bundles\lincko\wrapper\hooks\SetLogin();
					$app->lincko->data['integration_wechat_new'] = false;
					$app->lincko->data['integration_wechat_stop'] = true; 
					$response = true;
				}
			} else {
				$response = false;
			}

		} else {
			$app->lincko->data['integration_wechat_new'] = true; //Check if OpenID exists, if not it redirect to create an account
			if($response && $result = json_decode($response)){
				if(isset($result->access_token) && isset($result->openid) && !empty($result->openid)){
					if($login = Login::where('party', 'openid'.$account)->where('party_id', $result->openid)->first()){
						if($user = User::find($login->user_id)){
							$app->lincko->data['uid'] = $user->id;
							Vanquish::set(array('user_id' => $user->id));
							Vanquish::set(array('user_md5' => $user->md5));
							Vanquish::set(array('user_username' => $user->username));
							Vanquish::set(array('user_language' => $user->language));
							\bundles\lincko\wrapper\hooks\SetLogin();
							$app->lincko->data['integration_wechat_new'] = false;
							$app->lincko->data['integration_wechat_stop'] = true; 
							$response = true;
						}
					}
				}
			} else {
				$response = false;
			}

		}
		if(!$response && !$app->lincko->data['integration_wechat_new']){
			$app->lincko->data['integration_connection_error'] = true;
			$app->lincko->translation['party'] = 'Wechat';
		}
		return true;
	}

	public function guestID($response){
		$app = $this->app;
		$this->appid = $app->lincko->integration->wechat['public_appid'];
		$this->secret = $app->lincko->integration->wechat['public_secretapp'];
		$access_token = false;
		$openid = false;
		$state = false;
		$valid = false;
		$response = (array) $response;

		$app->lincko->data['integration_wechat_stop'] = true; 

		if($response && isset($response['code']) && isset($response['state'])){
			$state = $response['state'];
			$param = array(
				'appid' => $this->appid,
				'secret' => $this->secret,
				'code' => $response['code'],
			);
			$response = $this->curl_get('authorization_code', $param);
			if($response && $result = json_decode($response)){
				if(isset($result->errcode)){
					$response = false;
				}
			}
		} else {
			$response = false;
		}

		if($response && $result = json_decode($response)){
			if(isset($result->access_token) && isset($result->openid) && !empty($result->openid)){
				if($guest = Guest::where('openidpub', $result->openid)->first(array('id'))){
					return $guest->id;
				} else {
					$guest = new Guest;
					$guest->openidpub = $result->openid;
					if($guest->save()){
						return $guest->id;
					}
				}
			}
		}

		return false;
	}

	public function curl_get($grant_type=false, $param=array()){
		$app = $this->app;
		if($grant_type=='authorization_code'){
			$url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$param['appid'].'&secret='.$param['secret'].'&code='.$param['code'].'&grant_type=authorization_code';
		} else if($grant_type=='snsapi_userinfo'){
			$url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$param['access_token'].'&openid='.$param['openid'].'&lang='.$param['lang'].'&grant_type=snsapi_userinfo'; //Need confirmation from user (used only the first time)
		} else {
			return false;
		}
		//\libs\Watch::php($url, '$url', __FILE__, __LINE__, false, false, true);
		$timeout = 8;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); //Port used is 10443 only
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip');

		$verbose_show = false;
		if($verbose_show){
			$verbose = fopen('php://temp', 'w+');
			curl_setopt($ch, CURLOPT_VERBOSE, true);
			curl_setopt($ch, CURLOPT_STDERR, $verbose);
		}

		$result = curl_exec($ch);

		if($verbose_show){
			\libs\Watch::php(curl_getinfo($ch), '$ch', __FILE__, __LINE__, false, false, true);
			$error = '['.curl_errno($ch)."] => ".htmlspecialchars(curl_error($ch));
			\libs\Watch::php($error, '$error', __FILE__, __LINE__, false, false, true);
			rewind($verbose);
			\libs\Watch::php(stream_get_contents($verbose), '$verbose', __FILE__, __LINE__, false, false, true);
			fclose($verbose);
			\libs\Watch::php(json_decode($result), '$result', __FILE__, __LINE__, false, false, true);
		}

		@curl_close($ch);
		return $result;
	}

}
