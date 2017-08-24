<?php

namespace bundles\lincko\launch\routes;

use \libs\Vanquish;

$app = \Slim\Slim::getInstance();

$app->get('/', function () use($app) {
	if($app->lincko->data['logged']){
		$app->render('/bundles/lincko/app/templates/app/application.twig');
	} else {
		Vanquish::unsetAll(array('user_language'));
		$app->render('/bundles/lincko/app/templates/login.twig');
	}
})
->name('_get');

$app->post('/app/signout', function () use($app) {
	Vanquish::unsetAll(array('user_language'));
	\bundles\lincko\wrapper\hooks\SetLogin();
	$app->render('/bundles/lincko/app/templates/login.twig');
})
->name('app_signout_post');

$app->post(
	'/app/refresh',
	'\bundles\lincko\app\controllers\ControllerApp:refresh_post'
)
->name('app_refresh_get');

$app->post('/signout', function () use($app) {
	Vanquish::unsetAll(array('user_language'));
	\bundles\lincko\wrapper\hooks\SetLogin();
	$app->render('/bundles/lincko/app/templates/login.twig');
})
->name('_signout_post');

	

$app->group('/app/sample', function () use ($app) {

	$app->get(
		'/pitch/:pitchid',
		'\bundles\lincko\app\controllers\ControllerApp:sample_pitch_get'
	)
	->conditions(array(
		'pitchid' => '[a-z0-9]+',
	))
	->name('app_sample_pitch_get');

});

/*
$app->get('/app/login', function () use($app) {
	$app->render('/bundles/lincko/app/templates/login.twig');
})
->name('app_login_get');
*/
