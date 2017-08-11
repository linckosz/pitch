<?php

namespace bundles\lincko\api\models\data;

use \libs\Json;
use \libs\STR;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Question;

class Answer extends ModelLincko {

	protected $connection = 'data';

	protected $table = 'answer';
	protected $morphClass = 'answer';

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
		'number',
		'parent_type',
		'parent_id',
		'file_id',
	);

	public $parent_type = 'question';

	protected $model_integer = array(
		'number',
	);

////////////////////////////////////////////

	//Many(Answer) to One(Question)
	public function question(){
		return $this->belongsTo('\\bundles\\lincko\\api\\models\\data\\Question', 'parent_id'); //parent_id => question_id
	}

	//One(Answer) to One(File)
	public function file(){
		return $this->hasOne('\\bundles\\lincko\\api\\models\\data\\File', 'id', 'file_id');
	}

////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

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
			//We don't allow manual answer creation, they are generated at the time of the question
			$errfield = 'id';
			goto failed;
		}
		
		if($new){
			$error = true;
			if(isset($form->parent_id) && isset($form->parent_md5)){
				if(is_numeric($form->parent_id) && is_string($form->parent_md5)){
					if(Question::Where('id', $form->parent_id)->where('md5', $form->parent_md5)->first()){
						$error = false;
						$model->parent_id = (int) $form->parent_id;
					}
				}
			}
			if($error){
				$errfield = 'parent_id';
				goto failed;
			}
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

		return $model;

		failed:
		if($new){
			$errmsg = $app->trans->getBRUT('data', 13, 1)."\n"; //Answer creation failed.
		} else {
			$errmsg = $app->trans->getBRUT('data', 13, 5)."\n"; //Answer update failed.
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
		if(!isset($list['question'])){ $list['question']=array(); }
		$query = $query
		->WhereHas('question', function ($query) use ($list) {
			$query->whereIn('answer.parent_id', $list['question']);
		});
		if($get){
			return $query->get();
		} else {
			return $query;
		}
	}

////////////////////////////////////////////

	public function letter(){
		return self::numToAplha($this->number);
	}

	public static function numToAplha($num){
		$num = intval($num);
		$arr = array(
			1 => 'a',
			2 => 'b',
			3 => 'c',
			4 => 'd',
		);
		if(isset($arr[$num])){
			return $arr[$num];
		}
		return 'A';
	}

}
