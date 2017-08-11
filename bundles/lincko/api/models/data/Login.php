<?php

namespace bundles\lincko\api\models\data;

use Illuminate\Database\Eloquent\Model;

class Login extends Model {

	protected $connection = 'data';

	protected $table = 'login';

	protected $primaryKey = 'id';

	public $timestamps = false;

////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

////////////////////////////////////////////

}
