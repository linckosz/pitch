<?php


namespace bundles\lincko\api\models\base;

use Illuminate\Database\Eloquent\Model;
use \bundles\lincko\api\models\Data;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\User;

class Action extends Model {

	protected $connection = 'base'; //Keep all records on Lincko server

	protected $table = 'action';
	protected $morphClass = 'action';

	protected $primaryKey = 'id';

	public $timestamps = false;

	protected $visible = array();

	protected static $convert_models = false;
	protected static $convert = array(
		//-1 => 'Logged',
	);

	protected static $user_info_done = false;
	protected static $user_info = array(
		'Windows', //[OS] Windows, Macintosh, Android
		'Desktop', //[Device] Desktop, Tablet, Mobile
		'Browser', //[Platform] Browser, Wechat, App (can only from JS)
		false, //[IP]
	);
	
////////////////////////////////////////////

	//Add these functions to insure that nobody can make them disappear
	public function delete(){ return false; }
	public function restore(){ return false; }

	public function save(array $options = array()){
		if(isset($this->id)){
			//Only allow creation
			return false;
		}
		$return = parent::save($options);
		usleep(rand(10000, 15000)); //10ms
		return $return;
	}

	public static function getConvert(){
		return self::$convert;
	}

	public static function record($action, $info=null){
		if(!is_numeric($action)){
			return false;
		}
		if($user = User::getUser()){
			$created_at = $user->created_at->getTimestamp();
			$app = ModelLincko::getApp();
			$item = new Action;
			$item->user_id = $app->lincko->data['uid'];
			$item->created_at = time();
			$item->action = intval($action);
			if(!is_null($info)){
				if(!is_numeric($info) && !is_string($info)){
					$info = json_encode($info);
				}
				$item->info = $info;
			}
			return $item->save();
		}
		return false;
	}

	public static function action(int $action, $username=' '){
		if(isset(self::$convert[$action])){
			$result = self::$convert[$action];
		} else {
			$result = '('.$action.') Unknown';
		}
		return $result;
	}

	public static function getUserInfo(){
		$app = ModelLincko::getApp();
		if(!self::$user_info_done && isset($_SERVER) && isset($_SERVER['HTTP_USER_AGENT'])){
			if(stripos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger')){
				self::$user_info[2] = 'Wechat';
			}
			if(preg_match("/iPhone|iPad|iPod|Macintosh|iOS/ui", $_SERVER['HTTP_USER_AGENT'])){
				self::$user_info[0] = 'Macintosh';
				if(stripos($_SERVER['HTTP_USER_AGENT'], 'iPhone')){
					self::$user_info[1] = 'Mobile';
				} else if(preg_match("/iPad|iPod/ui", $_SERVER['HTTP_USER_AGENT'])){
					self::$user_info[1] = 'Tablet';
				}
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'BlackBerry')){
				self::$user_info[0] = 'BlackBerry';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Palm')){
				self::$user_info[0] = 'Palm';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Android')){
				self::$user_info[0] = 'Android';
				self::$user_info[1] = 'Mobile';
			} else if(stripos($_SERVER['HTTP_USER_AGENT'], 'Linux')){
				self::$user_info[0] = 'Linux';
			}
			if(self::$user_info[1] == 'Desktop' && preg_match("/webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/ui", $_SERVER['HTTP_USER_AGENT'])){
				self::$user_info[1] = 'Mobile';
			}
			if(isset($_SERVER['REMOTE_ADDR'])){
				self::$user_info[3] = $_SERVER['REMOTE_ADDR'];
			} else {
				self::$user_info[3] = $app->request->getIp();
			}
			self::$user_info_done = true;
		}
		return self::$user_info;
	}

}
