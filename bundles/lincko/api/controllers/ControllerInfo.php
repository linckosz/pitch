<?php
// Category 11

namespace bundles\lincko\api\controllers;

use \libs\Json;
use \libs\Controller;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\base\Action;

class ControllerInfo extends Controller {

	public function action_post(){
		$app = ModelLincko::getApp();
		if(isset($this->data->data) && isset($this->data->data->action)){
			$action = $this->data->data->action;
			if(is_numeric($action)){
				//Always use negative for outside value, Positives value are used to follow history
				if($action>0){
					$action = -$action;
				}
				$info = null;
				if(isset($this->data->data->info)){
					$info = $this->data->data->info;
				}
				Action::record($action, $info);
			}
		}
		$msg = array('msg' => 'ok');
		(new Json($msg))->render();
		return exit(0);
	}

}
