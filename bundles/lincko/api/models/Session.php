<?php

namespace bundles\lincko\api\models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model {

	protected $connection = 'data';

	protected $table = 'session';
	protected $morphClass = 'session';

	protected $primaryKey = 'id';

	public $timestamps = false;

////////////////////////////////////////////

/*
	//One(Session) to One(Pitch)
	public function pitch(){
		return $this->belongsTo('\\bundles\\lincko\\api\\models\\data\\Pitch', 'id', 'pitch_id');
	}

	//One(Session) to One(Question)
	public function question(){
		return $this->belongsTo('\\bundles\\lincko\\api\\models\\data\\Question', 'id', 'question_id');
	}

	//One(Session) to Many(Statistics)
	public function session(){
		return $this->hasMany('\\bundles\\lincko\\api\\models\\Statistics', 'session_id');
	}
*/
////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

////////////////////////////////////////////

	public function save(array $options = array()){
		$time_ms = \micro_seconds();
		if(!isset($this->id)){
			$this->created_ms = $time_ms;
			if(!isset($this->md5)){
				$this->md5 = md5(uniqid('', true));
			}
		}
		$this->updated_ms = $time_ms;
		return parent::save($options);
	}

}
