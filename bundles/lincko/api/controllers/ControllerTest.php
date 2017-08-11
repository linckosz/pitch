<?php

namespace bundles\lincko\api\controllers;

use \libs\Controller;
use \libs\Email;
use \libs\Folders;
use \libs\Json;
use \libs\STR;
use \libs\Network;
use \libs\Datassl;
use \libs\Translation;
use \bundles\lincko\api\models\Data;
use \bundles\lincko\api\models\Inform;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\base\Action;
use \bundles\lincko\api\models\base\Integration;
use \bundles\lincko\api\models\base\Token;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\File;
use \bundles\lincko\api\models\data\Login;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\User;
use \bundles\lincko\api\models\data\Guest;
use GeoIp2\Database\Reader;
use Illuminate\Database\Capsule\Manager as Capsule;
use Carbon\Carbon;
use WideImage\WideImage;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ControllerTest extends Controller {

	public function test(){
		$app = ModelLincko::getApp();
		$data = ModelLincko::getData();
		if($app->config('mode') != 'development'){
			$app->render(200, array('msg' => 'Unauthorized access',));
			return true;
		}
		$msg = 'The application is reading';
		$db = Capsule::connection('data');
		$db->enableQueryLog();
		$app->lincko->time_record = true; //Display timing
		$tp = null;


		$tp = STR::integer_map(124789456);
		\libs\Watch::php( $tp, time(), __FILE__, __LINE__, false, false, true);
		$tp = STR::integer_map($tp, true);

		//wrapper_sendAction('', 'post', 'api/test');
		//\libs\Watch::php( $db->getQueryLog() , 'QueryLog', __FILE__, __LINE__, false, false, true);
		\libs\Watch::php( $tp, time(), __FILE__, __LINE__, false, false, true);


		$msg = array('msg' => $msg);
		(new Json($msg))->render();
		return exit(0);
	}

}
