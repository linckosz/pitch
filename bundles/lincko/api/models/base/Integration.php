<?php

namespace bundles\lincko\api\models\base;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use \bundles\lincko\api\models\ModelLincko;

class Integration extends Model {

	protected $connection = 'base';

	protected $table = 'integration';

	protected $primaryKey = 'code';
	public $incrementing = false; //This helps to get primary key as a string instead of an integer

	public $timestamps = true;

	protected $visible = array();

	/////////////////////////////////////

	public static function clean(){
		$app = ModelLincko::getApp();
		$limit = Carbon::now();
		$limit->second = $limit->second - intval($app->lincko->security['expired']);
		return self::Where('updated_at', '<', $limit)->delete();
	}

}
