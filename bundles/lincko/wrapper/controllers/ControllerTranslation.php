<?php

namespace bundles\lincko\wrapper\controllers;

use \bundles\lincko\wrapper\models\TranslationListJS;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\User;
use \libs\Vanquish;
use \libs\Controller;
use \libs\Json;
use \libs\STR;

class ControllerTranslation extends Controller {

	public function list_get(){
		$app = ModelLincko::getApp();
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$this->setList();
	}

	public function language_set(){
		$data = ModelLincko::getData();
		if(isset($data->translation_language) && is_string($data->translation_language)){
			$data = strtolower($data->translation_language);
			if(preg_match("/[\w-]{2,}/ui", $data)){
				Vanquish::set(array('user_language' => $data));
				if($user = User::getUser()){
					$user->setLanguage();
				}
			}
		}
		(new Json())->render();
		return exit(0);
	}

	public function setList(){
		echo TranslationListJS::setList();
	}

	public function auto_post(){
		$app = ModelLincko::getApp();
		$data = json_decode($app->request->getBody());
		if(isset($data->data) && !is_object($data->data)){
			$data->data = (object) $data->data;
		}
		if(!isset($data->data)){
			$msg = $app->trans->getBRUT('data', 0, 4); //No data form received.
			(new Json(array('msg' => $msg), true, 400, true))->render();
			return exit(0);
		}
		$form = $data->data;
		if(isset($form->text)){
			$translator = new \libs\OnlineTranslator();
			$msg = $translator->translate($form->text);
			(new Json(array('msg' => $msg)))->render();
			return exit(0);
		} else {
			$msg = $app->trans->getBRUT('data', 2, 6); //No text found to be translated
			(new Json(array('msg' => $msg), true, 400, true))->render();
			return exit(0);
		}
	}

}
