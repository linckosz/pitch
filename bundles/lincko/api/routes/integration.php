<?php

namespace bundles\lincko\api\routes;

$app = \Slim\Slim::getInstance();

$app->group('/api/integration', function () use ($app) {

	$app->post(
		'/connect',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:connect_post'
	)
	->name('integration_connect_post');

	$app->get(
		'/code(:get)',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:code_get'
	)
	->conditions(array(
		'get' => '\?.*',
	))
	->name('integration_code_post');

	$app->post(
		'/setcode',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:setcode_post'
	)
	->name('integration_setcode_post');

	$app->post(
		'/set_wechat_qrcode',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:set_wechat_qrcode_post'
	)
	->name('integration_set_wechat_qrcode_post');

	$app->post(
		'/get_wechat_token',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:get_wechat_token_post'
	)
	->name('integration_get_wechat_token_post');

//We use get here because we do a direct connection to display the QR code
	$app->get(
		'/qrcode(/:mini)',
		'\bundles\lincko\api\controllers\integration\ControllerIntegration:qrcode_get'
	)
	->conditions(array(
		'mini' => '[\w\d]+',
	))
	->name('integration_qrcode_get');

});
