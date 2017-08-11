<?php

namespace param;

////////////////////////////////////
// FOLDER PERMISSIONS
////////////////////////////////////
/*
cd /path/to/appli
chown -R apache:apache logs
chown -R apache:apache public
*/

////////////////////////////////////
// CALLBACK ORDER
////////////////////////////////////
/*
Before run (no $app | no environment)
MyMiddleware Before (with $app | no environment)
slim.before (with environment)
MyMiddleware After
slim.before.router
slim.before.dispatch
Before render
[render]
After render
slim.after.dispatch
slim.after.router (before buffer rendering)
slim.after (after buffer rendering)
After run
*/

////////////////////////////////////
// DEFAULT SETTING
////////////////////////////////////

//Create a default class to store special data
$app->lincko = new \stdClass;

//Used to track operation time
$app->lincko->time_record = false; //Turn at true to track and \time_checkpoint('ok');
$app->lincko->time_start = 0;

//Application title
$app->lincko->title = 'Pitch Enhancer';

//Domain name
if(isset($_SERVER['SERVER_HOST'])){
	$app->lincko->domain = $_SERVER['SERVER_HOST'];
} else if(strpos($_SERVER['HTTP_HOST'], ':')){
	$app->lincko->domain = strstr($_SERVER['HTTP_HOST'], ':', true);
} else {
	$app->lincko->domain = $_SERVER['HTTP_HOST'];
}

//$app->lincko->cookies_lifetime = time()+1200; //Valid 20 minutes
$app->lincko->cookies_lifetime = time()+(3600*24*90); //Valid 3 months

//Do not enable debug when we are using json ajax respond
$app->config(array(
	'debug' => false,
	'mode' => 'production',
	'cookies.encrypt' => true, //Must use $app->getCookie('foo', false);
	'cookies.secret_key' => 'au6G7dbSh87Ws',
	'cookies.lifetime' => $app->lincko->cookies_lifetime,
	'cookies.secure' => false, //At true it keeps record only on SSL connection
	'cookies.path' => '/',
	'cookies.httponly' => true,
	'templates.path' => '..',
	'debug' => false,
));

//Root directory (which is different from landing page which is in public folder)
$app->lincko->path = $path;

//Insure the the folder is writable by chown apache:apache slim.api/logs and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applilogs
$app->lincko->logPath = $app->lincko->path.'/logs';

//Insure the the folder is writable by chown apache:apache slim.api/public and is in share(=writable) path in gluster mode.
//chown apache:apache /path/to/applipublic
$app->lincko->publicPath = $app->lincko->path.'/public';

//For uploading
//$app->lincko->filePath is redefined in parameters.php
$app->lincko->filePath = $app->lincko->publicPath.'/upload';

//False if we want to use Slim error display, use True for json application
$app->lincko->jsonException = false;

$app->lincko->enableSession = true;
$app->lincko->session = array(); //Used to edit and keep some session variable value before session_start command

//Use true for development to show error message on browser screen
//Do not allow that for production, in case of any single bug, all users will see the message
$app->lincko->showError = false;

//List all bundles to load (routes are loaded in the order of appearance)
$app->lincko->bundles = array(
	//'bundle name'
	'lincko/wrapper', //Must for front end server
	'lincko/api',
	'lincko/app',
	'lincko/ppt',
	'lincko/quiz',
);

//Give the bundle name if need
$app->lincko->bundle = false;

//List all middlewares to load in the order of appearance
$app->lincko->middlewares = array_reverse(array(
	//Full path of classes (including namespace)
	//['bundle name', 'subfolder\class name'],
	['lincko/wrapper', 'Twig'],
));

//List all hooks to load in the order of appearance and pound
$app->lincko->hooks = array(
	//Full path of classes (including namespace)
	//['bundle name', 'subfolder\function name', 'the.hook.name', priority value],
	['lincko/wrapper', 'SetData', 'slim.before', 10],
	['lincko/wrapper', 'SetCookies', 'slim.after.router', 10],
);

//Class with email default parameters, it use local Sendmail.postfix function
$app->lincko->email = new \stdClass;
$app->lincko->email->CharSet = 'utf-8';
$app->lincko->email->Abuse = 'abuse@'.$app->lincko->domain;
$app->lincko->email->Sender = 'noreply@'.$app->lincko->domain;
$app->lincko->email->From = 'noreply@'.$app->lincko->domain;
$app->lincko->email->FromName = $app->lincko->title.' server';
$app->lincko->email->Port = 587;
$app->lincko->email->Host = 'localhost';
$app->lincko->email->List = array();

//Translator parameters
//microsoft@lincko.com/ lin**2**5**@#
$app->lincko->translator = array(
	'text_key1' => '8b5032784084462c97cfe442cf489577',
);

//Translation list
$app->lincko->translation = array(
	'domain' => $app->lincko->domain,
	'title' => $app->lincko->title,
);

//Some generic data for translation twig
$app->lincko->data = array(
	'logged' => false,
	'uid' => false,
	'guest_id' => false,
	'domain' => $app->lincko->domain,
	'title' => $app->lincko->title,
	'lincko_dev' => $_SERVER['LINCKO_DEV'],
	'lincko_wechat' => $_SERVER['LINCKO_WECHAT'],
	'lincko_show_dev' => 'false', //Display some error for developpers on JS (NOTE: it has to be a string because of Twig conversion to JS)
	'integration_wechat_appid' => '',
	'integration_wechat_new' => false,
	'integration_wechat_stop' => false, //At true it help to not having an infinte looping
	'integration_connection_error' => false,
);

//Messages to be sent along with rendering
$app->lincko->flash = array();

//Integration data
$app->lincko->integration = new \stdClass;
$app->lincko->integration->wechat = array(
	'public_appid' => 'wx268709cdc1a8e280', //Official (lincko.com)
	'public_secretapp' => '03fab389a36166cd1f75a2c94f5257a0', //Official (lincko.com)
	'dev_appid' => 'wx8f20e5f247408c94', //Official (lincko.com)
	'dev_secretapp' => 'c088e2b2e3c690c6570f875ce0505d19', //Official (lincko.com)
	'public_token' => 'weixin360',
);

$app->lincko->data['integration_wechat_public_appid'] = $app->lincko->integration->wechat['public_appid'];
$app->lincko->data['integration_wechat_dev_appid'] = $app->lincko->integration->wechat['dev_appid'];

$app->lincko->security = array(
	'expired' => '7200', //Expiration time in seconds (2H)
);

$app->lincko->method_suffix = '_'.strtolower($app->request->getMethod());
