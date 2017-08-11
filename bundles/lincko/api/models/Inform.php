<?php

namespace bundles\lincko\api\models;

use \bundles\lincko\api\models\ModelLincko;

class Inform {

	protected $content = '';

	protected $item = false;

	protected $sha = array();

	public function __construct($content, array $sha, $item=false){
		$app = ModelLincko::getApp();

		$this->content = $content;
		$this->item = $item;
		$this->sha = $sha;

		return true;
	}

	public function send(){
		
		//Send to websocket

	}

}
