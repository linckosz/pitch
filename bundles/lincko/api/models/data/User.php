<?php

namespace bundles\lincko\api\models\data;

use \libs\Json;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\File;
use Illuminate\Database\Capsule\Manager as Capsule;

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
		'tuto',
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
			goto failed;
		}

		if(isset($form->tuto)){
			$error = true;
			if(is_object($form->tuto)){
				$form->tuto = (array) $form->tuto;
			}
			//Only valid the detachment
			if(empty($form->tuto)){
				$error = false;
				$model->tuto = null;
			}
			if($error){
				$errfield = 'tuto';
				goto failed;
			}
		}

		return $model;

		failed:
		if($new){
			$errmsg = $app->trans->getBRUT('data', 12, 1)."\n"; //Account creation failed.
		} else {
			$errmsg = $app->trans->getBRUT('data', 12, 5)."\n"; //Account update failed.
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

	public function save(array $options = array()){
		$new = false;
		if(!isset($this->id)){
			$new = true;
		}
		$result = parent::save($options);
		if($new){
			$app = ModelLincko::getApp();
			$app->lincko->data['uid'] = $this->id;
			//Prepare onboarding
			$this->onboarding();
		}
		return $result;
	}

	public function onboarding(){
		$app = ModelLincko::getApp();
		$db = Capsule::connection('data');
		$db->beginTransaction();
		$committed = false;
		try {
			$pitch = new Pitch;
			$pitch->title = $app->trans->getBRUT('data', 4, 0); //My Pitch
			$pivot = new \stdClass;
			$pivot->{'user>access'} = new \stdClass;
			$pivot->{'user>access'}->{$this->id} = true;
			$pitch->pivots_format($pivot);
			$pitch->save();

			$question = new Question;
			$question->style = 1;
			$question->parent_id = $pitch->id;
			$question->title = $app->trans->getBRUT('data', 4, 1); //The Dutch windmill is mainly used for:
			$question->save();
			$this->tuto = '#question-'.$question->id;
			parent::save();
			$file = File::find(10000)->replicate();
			$file->updated_json = null;
			$file->nosql = null;
			$file->parent_type = $question->getTable();
			$file->parent_id = $question->id;
			$file->saveParent();
			$question->file_id = $file->id;
			$question->save();
			$answers = $question->answer;
			foreach ($answers as $answer) {
				if($answer->number==1){
					$answer->title = $app->trans->getBRUT('data', 4, 2); //Electricity generation
				} else if($answer->number==2){ //correct
					$answer->title = $app->trans->getBRUT('data', 4, 3); //Water drainage
					$question->answer_id = $answer->id;
					$question->save();
				} else if($answer->number==3){
					$answer->title = $app->trans->getBRUT('data', 4, 4); //Tourism
				} else if($answer->number==4){
					$answer->title = '';
				}
				$answer->save();
			}

			$question = new Question;
			$question->style = 1;
			$question->parent_id = $pitch->id;
			$question->title = $app->trans->getBRUT('data', 4, 5); //(Mosquito question in chinese) According to a well-known piece of advice, "If you want something done right, you have to" what?
			$question->save();
			$answers = $question->answer;
			foreach ($answers as $answer) {
				if($answer->number==1){
					$answer->title = $app->trans->getBRUT('data', 4, 6); //Use a calculator
				} else if($answer->number==2){
					$answer->title = $app->trans->getBRUT('data', 4, 7); //Call MacGyver
				} else if($answer->number==3){ //correct
					$answer->title = $app->trans->getBRUT('data', 4, 8); //Do it yourself
					$question->answer_id = $answer->id;
					$question->save();
				} else if($answer->number==4){
					$answer->title = $app->trans->getBRUT('data', 4, 9); //Double-check everything
				}
				$answer->save();
			}

			$question = new Question;
			$question->style = 2; //Pictures
			$question->parent_id = $pitch->id;
			$question->title = $app->trans->getBRUT('data', 4, 10); //(Fan Bingbing question in chinese) Which supercar is made in Lebanon?
			$question->save();
			$answers = $question->answer;
			foreach ($answers as $answer) {
				if($answer->number==1){
					$file_id = 10001;
					if($this->language=='en'){ $file_id = 10005; }
					$answer->title = '';
				} else if($answer->number==2){ //correct
					$file_id = 10002;
					if($this->language=='en'){ $file_id = 10006; }
					$answer->title = '';
					$question->answer_id = $answer->id;
					$question->save();
				} else if($answer->number==3){
					$file_id = 10003;
					if($this->language=='en'){ $file_id = 10007; }
					$answer->title = '';
				} else if($answer->number==4){
					$file_id = 10004;
					if($this->language=='en'){ $file_id = 10008; }
					$answer->title = '';
				}
				$file = File::find($file_id)->replicate();
				$file->updated_json = null;
				$file->nosql = null;
				$file->parent_type = $answer->getTable();
				$file->parent_id = $answer->id;
				$file->saveParent();
				$answer->file_id = $file->id;
				$answer->save();
			}

			$question = new Question;
			$question->style = 3; //Statistics
			$question->parent_id = $pitch->id;
			$question->title = $app->trans->getBRUT('data', 4, 11); //(Supper question in chinese) What is your favorite dessert?
			$question->save();
			$answers = $question->answer;
			foreach ($answers as $answer) {
				if($answer->number==1){
					$file_id = 10009;
					if($this->language=='en'){ $file_id = 10013; }
					$answer->title = $app->trans->getBRUT('data', 4, 12); //Cakes
				} else if($answer->number==2){
					$file_id = 10010;
					if($this->language=='en'){ $file_id = 10014; }
					$answer->title = $app->trans->getBRUT('data', 4, 13); //Ice Cream
				} else if($answer->number==3){ //correct
					$file_id = 10011;
					if($this->language=='en'){ $file_id = 10015; }
					$answer->title = $app->trans->getBRUT('data', 4, 14); //Cheese
				} else if($answer->number==4){
					$file_id = 10012;
					if($this->language=='en'){ $file_id = 10016; }
					$answer->title = $app->trans->getBRUT('data', 4, 15); //Fruits
				}
				$file = File::find($file_id)->replicate();
				$file->updated_json = null;
				$file->nosql = null;
				$file->parent_type = $answer->getTable();
				$file->parent_id = $answer->id;
				$file->saveParent();
				$answer->file_id = $file->id;
				$answer->save();
			}

			$db->commit();
			$committed = true;
		} catch (\Exception $e){
			$committed = false;
			$db->rollback();
		}
		return $committed;
	}

}
