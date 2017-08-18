<?php

namespace bundles\lincko\api\models\data;

use \libs\Json;
use \libs\STR;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\Pitch;
use Illuminate\Database\Capsule\Manager as Capsule;

class Question extends ModelLincko {

	protected $connection = 'data';

	protected $table = 'question';
	protected $morphClass = 'question';

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
		'style',
		'parent_type',
		'parent_id',
		'answer_id',
		'file_id',
	);

	public $parent_type = 'pitch';

	protected $model_integer = array(
		'parent_id',
		'answer_id',
		'style',
	);

////////////////////////////////////////////

	/*
	//Many(Question) to Many(Guest)
	public function guest(){
		return $this->belongsToMany('\\bundles\\lincko\\api\\models\\data\\Guest', 'guest_x_question', 'question_id', 'guest_id')->withPivot('access', 'updated_ms', 'answer_id', 'correct');
	}
	*/

	//One(Question) to Many(Pitch)
	public function pitch(){
		return $this->belongsTo('\\bundles\\lincko\\api\\models\\data\\Pitch', 'parent_id'); //parent_id => pitch_id
	}

	//One(Question) to One(File)
	public function file(){
		return $this->hasOne('\\bundles\\lincko\\api\\models\\data\\File', 'id', 'file_id');
	}

	//Many(Question) to One(Answer)
	public function answer(){
		return $this->hasMany('\\bundles\\lincko\\api\\models\\data\\Answer', 'parent_id'); //parent_id => question_id
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
		}

		if($new){
			$error = true;
			if(isset($form->parent_id) && isset($form->parent_md5)){
				if(is_numeric($form->parent_id) && is_string($form->parent_md5)){
					if(Pitch::Where('id', $form->parent_id)->where('md5', $form->parent_md5)->first()){
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

		if(isset($form->answer_id) && isset($form->answer_md5)){
			$error = true;
			if(is_numeric($form->answer_id) && is_string($form->answer_md5)){
				if(Answer::Where('id', $form->answer_id)->where('md5', $form->answer_md5)->first()){
					$error = false;
					$model->answer_id = (int) $form->answer_id;
				}
			}
			if($error){
				$errfield = 'answer_id';
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

		if(isset($form->style)){
			$error = true;
			if(is_numeric($form->style)){
				$style = (int) $form->style;
				if(in_array($style, array(1, 2, 3))){
					$error = false;
					$model->style = $style;
				}
			}
			if($error){
				$errfield = 'style';
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
			$errmsg = $app->trans->getBRUT('data', 10, 1)."\n"; //Question creation failed.
		} else {
			$errmsg = $app->trans->getBRUT('data', 10, 5)."\n"; //Question update failed.
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
		if(!isset($list['pitch'])){ $list['pitch']=array(); }
		$query = $query
		->whereHas('pitch', function ($query) use ($list) {
			$query->whereIn('question.parent_id', $list['pitch']);
		});
		if($get){
			return $query->get();
		} else {
			return $query;
		}
	}

////////////////////////////////////////////

	public function save(array $options = array()){
		if(!isset($this->id)){ //Only for new, we add 4 answers
			$app = ModelLincko::getApp();
			//Start transaction because we must create 4 answers along with the question
			$db = Capsule::connection('data');
			$db->beginTransaction();
			$committed = false;
			try {
				$result = parent::save($options);
				if(!$result){
					throw new \Exception;
				}

				$answer_1 = new Answer;
				$answer_1->number = 1;
				$answer_1->parent_id = $this->id;
				$answer_1->title = $app->trans->getBRUT('data', 0, 12); //Yes

				$answer_2 = new Answer;
				$answer_2->number = 2;
				$answer_2->parent_id = $this->id;
				$answer_2->title = $app->trans->getBRUT('data', 0, 13); //No

				$answer_3 = new Answer;
				$answer_3->number = 3;
				$answer_3->parent_id = $this->id;

				$answer_4 = new Answer;
				$answer_4->number = 4;
				$answer_4->parent_id = $this->id;

				$result = $answer_1->save() && $answer_2->save() && $answer_3->save() && $answer_4->save();
				if(!$result){
					throw new \Exception;
				}

				$answer_1->forceRead();
				$answer_2->forceRead();
				$answer_3->forceRead();
				$answer_4->forceRead();

				$this->answer_id = $answer_1->id;
				$result = parent::save($options);
				if(!$result){
					throw new \Exception;
				}

				$db->commit();
				$committed = true;
			} catch (\Exception $e){
				$committed = false;
				$db->rollback();
				$errmsg = $app->trans->getBRUT('data', 10, 1)."\n"; //Question creation failed.
				$errmsg .= $app->trans->getBRUT('data', 0, 7); //Please try again.
				\libs\Watch::php($errmsg, 'failed', __FILE__, __LINE__, true);
				$msg = array('msg' => $errmsg);
				(new Json($msg, true, 401, true))->render();
				return exit(0);
			}
			return $committed;
		} else {
			return parent::save($options);
		}
	}

}
