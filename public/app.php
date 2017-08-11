<?php

$path = dirname(__FILE__).'/..';

require_once $path.'/vendor/autoload.php';

$app = new \Slim\Slim();

require_once $path.'/config/global.php';
require_once $path.'/config/language.php';
require_once $path.'/param/common.php';
require_once $path.'/param/unique/parameters.php';

// Only invoked if mode is "production"
$app->configureMode('production', function () use ($app) {
	$app->config(array(
		'log.enable' => true,
	));
	ini_set('display_errors', '0');
});

// Only invoked if mode is "development"
$app->configureMode('development', function () use ($app) {
	$app->config(array(
		'log.enable' => false,
		'cookies.secure' => false, //Allow non-SSL record
	));
	//ini_set('display_errors', '0');
	ini_set('opcache.enable', '0');
	$app->lincko->showError = true; //Force to see Error message
	$app->lincko->data['lincko_show_dev'] = 'true'; //Show some errors for Front end developpers (NOTE: it has to be a string because of Twig conversion to JS)
	//Only useful in rendering mode, useless in JSON mode
	//$debugbar = new \Slim\Middleware\DebugBar();
	//$app->add($debugbar);
});

require_once $path.'/config/autoload.php';
require_once $path.'/error/errorPHP.php';
require_once $path.'/config/eloquent.php';
require_once $path.'/config/session.php';

$app->run();
