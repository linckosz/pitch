<?php

namespace bundles\lincko\wrapper\routes;

$app = \Slim\Slim::getInstance();

$app->group('/wrapper/integration', function () use ($app) {

	$app->group('/wechat', function () use ($app) {

		//Redirect URL
		$app->get(
			'/redirect/:account/:redirect',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:redirect_get'
		)
		->conditions(array(
			'account' => 'pub|dev',
			'redirect' => '[A-Za-z0-9+/=]+',
		))
		->name('wrapper_integration_wechat_redirect_get');

		$app->post(
			'/get_token',
			'\bundles\lincko\wrapper\controllers\integration\ControllerWechat:get_token_post'
		)
		->name('wrapper_integration_wechat_get_token_post');

		//Opened on Mobile after scanning after scanning Lincko integration QR code
		$app->post(
			'/code(/:code)',
			'\bundles\lincko\wrapper\controllers\integration\ControllerIntegration:code_post'
		)
		->conditions(array(
			'code' => '^\S{8}$',
		))
		->name('wrapper_integration_wechat_code_post');

		$app->post(
			'/setcode',
			'\bundles\lincko\wrapper\controllers\integration\ControllerIntegration:setcode_post'
		)
		->name('wrapper_integration_wechat_setcode_post');

	});

});
