<?php

namespace bundles\lincko\api\models;

use Illuminate\Database\Eloquent\Model;

class Answered extends Model {

	protected $connection = 'data';

	protected $table = 'answered';
	protected $morphClass = 'answered';

	protected $primaryKey = 'id';

	public $timestamps = false;

////////////////////////////////////////////
/*
	//Many(Statistics) to One(Session)
	public function session(){
		return $this->belongsTo('\\bundles\\lincko\\api\\models\\Session', 'session_id');
	}
*/
////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

////////////////////////////////////////////

	public function save(array $options = array()){
		if(!isset($this->id)){
			$this->created_ms = \micro_seconds();
			return parent::save($options);
		} else {
			//We only allow creation
			return false;
		}
	}

	public static function isAuthorized($guest_id, $statistics_id, $question_id){
		if(Answered::Where('guest_id', $guest_id)->where('statistics_id', $statistics_id)->where('question_id', $question_id)->first(array('id'))){
			return false;
		}
		$timems_limit = \micro_seconds() - 8*3600*1000; //Gap of 8H
		if(Answered::Where('guest_id', $guest_id)->where('created_ms', '>', $timems_limit)->where('question_id', $question_id)->first(array('id'))){
			return false;
		}
		return true;
	}

}
