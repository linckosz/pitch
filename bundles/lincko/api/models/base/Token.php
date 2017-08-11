<?php

namespace bundles\lincko\api\models\base;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use \bundles\lincko\api\models\ModelLincko;

class Token extends Model {

	protected $dates = ['expired_at'];

	protected $connection = 'base';

	protected $table = 'token';

	protected $primaryKey = 'party';
	public $incrementing = false; //This helps to get primary key as a string instead of an integer

	public $timestamps = false;

	protected $visible = array();

	/////////////////////////////////////

	public static function getToken($party){
		$app = ModelLincko::getApp();
		$limit = Carbon::now();
		if($item = self::Where('party', $party)->where('expired_at', '>', Carbon::now())->first()){
			return $item;
		}
		return false;
	}

	public static function setToken($party, $token, $lifetime=3600){
		$app = ModelLincko::getApp();
		$limit = Carbon::now();
		$limit->second = $limit->second + $lifetime;
		$item = self::find($party);
		if(!$item){
			$item = new self();
			$item->party = $party;
		}
		$item->token = $token;
		$item->expired_at = $limit;
		$item->save();
		return $item;
	}

}
