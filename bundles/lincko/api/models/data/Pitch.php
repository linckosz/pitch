<?php

namespace bundles\lincko\api\models\data;

use \libs\Json;
use \libs\STR;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Question;

class Pitch extends ModelLincko {

	protected $connection = 'data';

	protected $table = 'pitch';
	protected $morphClass = 'pitch';

	protected $primaryKey = 'id';

	public $timestamps = true;

	protected static $pivot_include = true;

	protected $visible = array(
		'id',
		'md5',
		'created_at',
		'updated_ms',
		'updated_json',
		'title',
		'file_id',
		'sort',
	);

	protected $model_integer = array(
		'file_id',
		'sort',
	);

////////////////////////////////////////////

	//Many(Pitch) to Many(User)
	public function user(){
		return $this->belongsToMany('\\bundles\\lincko\\api\\models\\data\\User', 'user_x_pitch', 'pitch_id', 'user_id')->withPivot('access');
	}

	//One(Pitch) to One(File)
	public function file(){
		return $this->hasOne('\\bundles\\lincko\\api\\models\\data\\File', 'id', 'file_id');
	}

	//One(Pitch) to Many(Question)
	public function question(){
		return $this->hasMany('\\bundles\\lincko\\api\\models\\data\\Question', 'parent_id'); //parent_id => pitch_id
	}

////////////////////////////////////////////

	public static function setItem($form){
		$app = ModelLincko::getApp();

		$model = false;
		$errfield = 'undefined';
		$error = false;
		$new = true;

		//Convert to object
		$form = json_decode(json_encode($form, JSON_FORCE_OBJECT));
		foreach ($form as $key => $value) {
			if(!is_numeric($value) && empty($value)){ //Exclude 0 to become an empty string
				$form->$key = '';
			}
		}

		$md5 = false;
		if(isset($form->md5) && is_string($form->md5) && strlen($form->md5)==32){
			$md5 = $form->md5;
		}
		if(isset($form->id)){
			$new = false;
			$error = true;
			if($md5 && is_numeric($form->id)){
				$id = (int) $form->id;
				if($model = static::find($id)){
					if($model->md5 == $md5){
						$error = false;
					}
				}
			}
			if($error){
				$errfield = 'id';
				goto failed;
			}
		} else {
			if(!$md5){
				$md5 = md5(uniqid('', true));
			}
			$model = new self;
			$model->md5 = $md5;
			//Give access to the user itself
			$pivot = new \stdClass;
			$pivot->{'user>access'} = new \stdClass;
			$pivot->{'user>access'}->{$app->lincko->data['uid']} = true;
			$model->pivots_format($pivot);
		}

		if(isset($form->title)){
			$error = true;
			if(is_string($form->title)){
				$error = false;
				$model->title = STR::break_line_conv($form->title, '');
			}
			if($error){
				$errfield = 'title';
				goto failed;
			}
		}

		if(isset($form->file_id)){
			$error = true;
			if(is_object($form->file_id)){
				$form->file_id = (array) $form->file_id;
			}
			//Only valid the detachment
			if(empty($form->file_id)){
				$error = false;
				$model->file_id = null;
			}
			if($error){
				$errfield = 'file_id';
				goto failed;
			}
		}

		if(isset($form->sort)){
			$error = true;
			if(is_numeric($form->sort)){
				$error = false;
				$model->sort = (int) $form->sort;
			}
			if($error){
				$errfield = 'sort';
				goto failed;
			}
		}

		return $model;

		failed:
		if($new){
			$errmsg = $app->trans->getBRUT('data', 9, 1)."\n"; //Pitch creation failed.
		} else {
			$errmsg = $app->trans->getBRUT('data', 9, 5)."\n"; //Pitch update failed.
		}
		$errmsg .= $app->trans->getBRUT('data', 1, 0); //We could not validate the format.
		\libs\Watch::php(array($errmsg, $form), 'failed', __FILE__, __LINE__, true);
		$msg = array('msg' => $errmsg, 'field' => $errfield);

		if(!$new){
			//Return the original element for overwriting on front
			$nosql = $model->getNoSQL();
			if($nosql && isset($nosql->$errfield)){
				$result = new \stdClass;
				$result->reset = new \stdClass;
				$result->reset->{$model->getTable()} = new \stdClass;
				$result->reset->{$model->getTable()}->{$model->id} = new \stdClass;
				$result->reset->{$model->getTable()}->{$model->id}->$errfield = $nosql->$errfield;
				$msg['data'] = $result;
			}
		}
		
		(new Json($msg, true, 401, true))->render();
		return exit(0);
	}

////////////////////////////////////////////

	public function scopegetItems($query, &$list=array(), $get=false){
		if(!isset($list['user'])){ $list['user']=array(); }
		$query = $query
		->whereHas('user', function ($query) use ($list) {
			$query
			->whereIn('user_x_pitch.user_id', $list['user'])
			->where('user_x_pitch.access', 1);
		});
		if($get){
			return $query->get();
		} else {
			return $query;
		}
	}

////////////////////////////////////////////

	//Get all question in correct order
	public function questions($arr=array('*')){
		return $this->question()->orderBy('sort', 'DESC')->orderBy('id', 'ASC')->get($arr);
	}

	//Get all question in correct order
	public function question_first($arr=array('*')){
		return $this->question()->orderBy('sort', 'DESC')->orderBy('id', 'ASC')->first($arr);
	}

	//Get all question in correct order
	public function question_last($arr=array('*')){
		return $this->question()->orderBy('sort', 'ASC')->orderBy('id', 'DESC')->first($arr);
	}

}
