<?php

namespace bundles\lincko\launch\routes;

use \libs\Vanquish;

$app = \Slim\Slim::getInstance();

$app->group('/ppt', function () use ($app) {

	$app->get(
		'/question/:questionid',
		'\bundles\lincko\ppt\controllers\ControllerPPT:question_get'
	)
	->conditions(array(
		'questionid' => '[a-z0-9]+',
	))
	->name('ppt_question_get');

	$app->get(
		'/answer/:questionid',
		'\bundles\lincko\ppt\controllers\ControllerPPT:answer_get'
	)
	->conditions(array(
		'questionid' => '[a-z0-9]+',
	))
	->name('ppt_answer_get');

	$app->get(
		'/stats/:statisticsid(/:refresh)',
		'\bundles\lincko\ppt\controllers\ControllerPPT:stats_get'
	)
	->conditions(array(
		'statisticsid' => '[a-z0-9]+',
		'refresh' => 'refresh|static',
	))
	->name('ppt_stats_get');

	$app->get(
		'/statsjson/:statisticsid',
		'\bundles\lincko\ppt\controllers\ControllerPPT:statsjson_get'
	)
	->conditions(array(
		'statisticsid' => '[a-z0-9]+',
	))
	->name('ppt_statsjson_get');

	$app->get(
		'/statsjs/:statisticsid.js',
		'\bundles\lincko\ppt\controllers\ControllerPPT:statsjs_get'
	)
	->conditions(array(
		'statisticsid' => '[a-z0-9]+',
	))
	->name('ppt_statsjs_get');

	$app->get(
		'/qrcode/:statisticsid.jpg',
		'\bundles\lincko\ppt\controllers\ControllerPPT:qrcode_get'
	)
	->conditions(array(
		'statisticsid' => '[a-z0-9]+',
	))
	->name('ppt_qrcode_get');

});
