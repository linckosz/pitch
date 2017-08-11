<?php

namespace bundles\lincko\wrapper\hooks;

use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Guest;
use \bundles\lincko\wrapper\controllers\integration\ControllerWechat;
use \libs\Vanquish;

function checkRoute(){
	$app = ModelLincko::getApp();

	$route = $app->router->getMatchedRoutes($app->request->getMethod(), $app->request->getResourceUri());
	if (is_array($route) && count($route) > 0) {
		$route = $route[0];
	}
	
	if($route){
		return $route->getName();
	}
	return false;
}

function SetData(){
	$app = ModelLincko::getApp();

	$data = json_decode($app->request->getBody());
	if(!$data){
		if($app->lincko->method_suffix=='_get' && $get = (object) $app->request->get()){
			$data = $get;
		} else if($app->lincko->method_suffix=='_post' && $post = (object) $app->request->post()){
			$data = $post;
		}
	}
	$data = json_decode(json_encode($data, JSON_FORCE_OBJECT)); //Force to object convertion
	ModelLincko::setData($data);

	$route = \bundles\lincko\wrapper\hooks\checkRoute();
	if(in_array($route, array('_get', 'app_signout_post', '_signout_post'))){
		$app->lincko->bundle = 'app';
	} else if(in_array($route, array('ppt_question_get', 'ppt_answer_get', 'ppt_stats_get', 'ppt_statsjson_get', 'ppt_statsjs_get', 'ppt_qrcode_get'))){
		$app->lincko->bundle = 'ppt';
	} else if(in_array($route, array('quiz_question_get', 'quiz_answer_get'))){
		$app->lincko->bundle = 'quiz';
	}

	if($app->lincko->bundle == 'ppt'){
		//Do nothing
	} else if($app->lincko->bundle == 'quiz'){
		$app->lincko->data['guest_id'] = $guest_id = Vanquish::get('guest_id');
		$app->lincko->data['integration_wechat_stop'] = true;
		$isWechat = false;
		if(stripos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger')){
			$isWechat = true;
			if(!Guest::find($guest_id)){
				$guest_id = false;
			}
			if(!$guest_id){
				$app->lincko->data['integration_wechat_stop'] = false;
				if(isset($data->wechat_response)){
					if($response = base64_decode($data->wechat_response)){
						if($response = json_decode($response)){
							if(isset($data->wechat_account)){
								$app->lincko->data['guest_id'] = $guest_id = (new ControllerWechat)->guestID($response);
								Vanquish::set(array('guest_id' => $guest_id,));
							}
						}
					}
					//In case wechat bug, we use a temp_id
					if(!$guest_id){
						$guest_temp_id = Vanquish::get('guest_temp_id');
						if(!$guest_temp_id){
							$app->lincko->data['guest_id'] = $guest_temp_id = md5(uniqid('', true));
							Vanquish::set(array('guest_temp_id' => $guest_temp_id,));
						}
					}
				}
			}
		} else if(!$guest_id){
			$guest_temp_id = Vanquish::get('guest_temp_id');
			if(!$guest_temp_id){
				$app->lincko->data['guest_id'] = $guest_temp_id = md5(uniqid('', true));
				Vanquish::set(array('guest_temp_id' => $guest_temp_id,));
			}
		}

		if(!$app->lincko->data['guest_id']){
			$app->lincko->data['guest_id'] = md5(uniqid('', true));
		}
	} else {
		if(isset($data->wechat_response)){
			if($response = base64_decode($data->wechat_response)){
				if($response = json_decode($response)){
					if(isset($data->wechat_account)){
						(new ControllerWechat)->response($response, $data->wechat_account);
					} else {
						(new ControllerWechat)->response($response);
					}
				}
			}
		}
		\bundles\lincko\wrapper\hooks\SetLogin();
	}
}

function SetLogin(){
	$app = ModelLincko::getApp();

	//It will give null if not set
	$user_id = Vanquish::get('user_id');
	$user_md5 = Vanquish::get('user_md5');
	$user_username = Vanquish::get('user_username');
	$user_language = Vanquish::get('user_language');

	$logged = false;
	$app->lincko->data['uid'] = false;
	if($user_id && $user_md5 && $user_language && $user_username){
		$logged = true;
		$app->lincko->data['uid'] = $user_id;
	} else {
		Vanquish::unsetAll(array('user_language'));
		$user_id = null;
		$user_md5 = null;
		$user_username = null;
	}
	
	$app->lincko->data['logged'] = $logged;
	$app->lincko->data['user_id'] = $user_id;
	$app->lincko->data['user_md5'] = $user_md5;
	$app->lincko->data['user_username'] = $user_username;

	return true;
}
