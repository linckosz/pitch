<?php

namespace bundles\lincko\wrapper\controllers;

use \libs\Controller;
use \libs\Json;

class ControllerInfo extends Controller {

	public function online_post(){
		(new Json('online'))->render();
		return exit(0);
	}

	public function timems_post(){
		$ms = \micro_seconds();
		(new Json(array('timems' => $ms)))->render();
		return exit(0);
	}

}
