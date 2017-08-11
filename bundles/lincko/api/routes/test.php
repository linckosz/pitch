<?php

namespace bundles\lincko\api\routes;

$app = \Slim\Slim::getInstance();

$app->group('/api/test', function () use ($app) {

	$app->map(
		'/',
		'\bundles\lincko\api\controllers\ControllerTest:test'
	)
	->via('GET', 'POST')
	->name('api_test_post');

});
