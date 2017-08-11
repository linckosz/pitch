<?php

namespace bundles\lincko\api\models\data;

use \libs\Json;
use \bundles\lincko\api\models\ModelLincko;

class User extends ModelLincko {

	protected $connection = 'data';

	protected $table = 'user';
	protected $morphClass = 'user';

	protected $primaryKey = 'id';

	public $timestamps = true;

	protected static $pivot_include = true;

	protected $visible = array(
		'id',
		'md5',
		'created_at',
		'updated_ms',
		'updated_json',
		'username',
		'gender',
		'headimgurl',
	);

	protected $model_integer = array(
		'gender',
	);

	protected static $me = false;

////////////////////////////////////////////

	//One(User) to Many(Login)
	public function login(){
		return $this->hasMany('\\bundles\\lincko\\api\\models\\data\\Login', 'user_id');
	}

	//Many(User) to Many(Pitch)
	public function pitch(){
		return $this->belongsToMany('\\bundles\\lincko\\api\\models\\data\\Pitch', 'user_x_pitch', 'user_id', 'pitch_id')->withPivot('access');
	}

////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

	public function scopegetItems($query, &$list=array(), $get=false){
		$app = ModelLincko::getApp();
		$query = $query->where('id', $app->lincko->data['uid']);
		if($get){
			return $query->get();
		} else {
			return $query;
		}
	}

////////////////////////////////////////////

	public static function getUser($force=false){
		$app = ModelLincko::getApp();
		if($force){
			static::$me = false;
		}
		if(!static::$me && $app->lincko->data['uid']){
			if($me = self::where('id', $app->lincko->data['uid'])->first()){
				static::$me = $me;
			}
		} 
		return static::$me;
	}

	public function setLanguage(){
		$app = ModelLincko::getApp();
		$language = $app->trans->getClientLanguage();
		if(!empty($language) && $language!=$this->language){
			$this->language = strtolower($language);
			$this->brutSave(); //Because the language settings doesn't need to be shown on front
		}
	}

}
