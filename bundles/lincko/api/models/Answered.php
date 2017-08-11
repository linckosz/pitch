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

}
