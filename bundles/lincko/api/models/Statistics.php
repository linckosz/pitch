<?php

namespace bundles\lincko\api\models;

use Illuminate\Database\Eloquent\Model;

class Statistics extends Model {

	protected $connection = 'data';

	protected $table = 'statistics';
	protected $morphClass = 'statistics';

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
