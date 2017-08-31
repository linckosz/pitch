<?php

namespace bundles\lincko\launch\routes;

use \libs\Vanquish;

$app = \Slim\Slim::getInstance();

$app->group('/ppt', function () use ($app) {

	$app->get(
		'/question/:questionid(/:webviewer)',
		'\bundles\lincko\ppt\controllers\ControllerPPT:question_get'
	)
	->conditions(array(
		'questionid' => '[a-z0-9]+',
		'webviewer' => '[a-z]+',
	))
	->name('ppt_question_get');

	$app->get(
		'/answer/:questionid(/:webviewer)',
		'\bundles\lincko\ppt\controllers\ControllerPPT:answer_get'
	)
	->conditions(array(
		'questionid' => '[a-z0-9]+',
		'webviewer' => '[a-z]+',
	))
	->name('ppt_answer_get');

	$app->get(
		'/pitch/start/:pitchid(/:webviewer)',
		'\bundles\lincko\ppt\controllers\ControllerPPT:pitch_start_get'
	)
	->conditions(array(
		'pitchid' => '[a-z0-9]+',
		'webviewer' => '[a-z]+',
	))
	->name('ppt_pitch_start_get');

	$app->get(
		'/pitch/end/:pitchid(/:webviewer)',
		'\bundles\lincko\ppt\controllers\ControllerPPT:pitch_end_get'
	)
	->conditions(array(
		'pitchid' => '[a-z0-9]+',
		'webviewer' => '[a-z]+',
	))
	->name('ppt_pitch_end_get');

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
		'/qrcode/:questionid.jpg',
		'\bundles\lincko\ppt\controllers\ControllerPPT:qrcode_get'
	)
	->conditions(array(
		'questionid' => '[a-z0-9]+',
	))
	->name('ppt_qrcode_get');

});
