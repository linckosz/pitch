<?php

namespace bundles\lincko\wrapper\middlewares;

class Twig extends \Slim\Middleware {

	public function __construct(){
		$app = \Slim\Slim::getInstance();
		$app->config(array(
			'view' => new \libs\Twig(),
		));
		$twig = $app->view->getInstance();
		$twig->addExtension(new \libs\Twig_Extension());
		return true;
	}

	public function call() {
		$this->next->call();
	}
	
}