<?php

namespace bundles\lincko\launch\routes;

use \libs\Vanquish;

$app = \Slim\Slim::getInstance();

$app->group('/quiz', function () use ($app) {

	$app->get(
		'/question/:sessionid',
		'\bundles\lincko\quiz\controllers\ControllerQuiz:question_get'
	)
	->conditions(array(
		'sessionid' => '[a-z0-9]+',
	))
	->name('quiz_question_get');

	$app->get(
		'/answer/:sessionid/:answerid',
		'\bundles\lincko\quiz\controllers\ControllerQuiz:answer_get'
	)
	->conditions(array(
		'sessionid' => '[a-z0-9]+',
		'answerid' => '[a-z0-9]+',
	))
	->name('quiz_answer_get');

});
