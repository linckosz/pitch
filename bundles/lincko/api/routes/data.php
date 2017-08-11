<?php

namespace bundles\lincko\api\routes;

$app = \Slim\Slim::getInstance();

$app->group('/api/data', function () use ($app) {

	$app->post(
		'/latest',
		'\bundles\lincko\api\controllers\ControllerData:latest_post'
	)
	->name('api_data_latest_post');

	$app->post(
		'/set',
		'\bundles\lincko\api\controllers\ControllerData:set_post'
	)
	->name('api_data_set_post');

});
