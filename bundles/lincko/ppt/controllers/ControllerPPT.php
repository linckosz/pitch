<?php

namespace bundles\lincko\ppt\controllers;

use \libs\STR;
use \libs\Json;
use \libs\Folders;
use \libs\Controller;
use \libs\Vanquish;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\Session;
use \bundles\lincko\api\models\Statistics;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\File;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\Guest;
use WideImage\WideImage;
use Endroid\QrCode\QrCode;


class ControllerPPT extends Controller {

	protected function prepare(array $attributes = array()){
		$data = ModelLincko::getData();
		$app = ModelLincko::getApp();

		$check = array(
			'html_zoom' => true,
			'html_width' => true,
			'html_height' => true,
		);

		foreach ($data as $key => $value) {
			if(isset($check[$key])){
				$app->lincko->data[$key] = $value;
				unset($check[$key]);
			}
		}
		$app->lincko->data['body_preview'] = false;
		if(count($check)==0){
			$app->lincko->data['body_preview'] = true;
		}
		$app->lincko->data['get_style'] = false;
	}

	public function question_get($questionid_enc){
		$app = ModelLincko::getApp();
		$this->prepare();
		$this->qanda($questionid_enc, 'question');
	}

	public function answer_get($questionid_enc){
		$app = ModelLincko::getApp();
		$this->prepare();
		$this->qanda($questionid_enc, 'answer', true);
	}

	protected function qanda($questionid_enc, $style, $static=false){
		$app = ModelLincko::getApp();
		$app->lincko->data['get_style'] = $style;
		$app->lincko->data['get_refresh'] = false;
		$app->lincko->data['data_pitch_url_hide'] = false;
		$question_id = STR::integer_map($questionid_enc, true);
		if($question = Question::Where('id', $question_id)->first(array('id', 'updated_ms', 'parent_id', 'answer_id', 'file_id', 'title', 'style'))){

			if($question->style==3){ //For Statistics we only display Questions
				$style = 'question';
				$app->lincko->data['get_style'] = $style;
			}

			$base_url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];

			$app->lincko->data['data_question'] = true;
			$app->lincko->data['data_question_title'] = STR::sql_to_html($question->title);
			$app->lincko->data['data_question_picture'] = false;
			$app->lincko->data['data_question_style'] = $question->style;
			if($question->file_id && $file = File::Where('id', $question->file_id)->first(array('id', 'uploaded_by', 'link', 'ori_ext', 'updated_ms'))){
				$app->lincko->data['data_question_picture'] = $base_url.'/files/'.$file->uploaded_by.'/'.$file->link.'.'.$file->ori_ext.'?'.$file->updated_ms;
			}

			$session = false;
			$statistics = false;
			if(isset($_SESSION['session_id'])){
				if($session = Session::find($_SESSION['session_id'])){
					$statistics = Statistics::Where('session_id', $session->id)->where('question_id', $question->id)->first();
					if(!$statistics){
						$statistics = new Statistics;
						$statistics->session_id = $session->id;
						$statistics->question_id = $question->id;
						$statistics->save();
					}
				}
			}

			if(!$session || !$statistics){
				$session = new Session;
				$session->save();
				$_SESSION['session_id'] = $session->id;
				$statistics = new Statistics;
				$statistics->session_id = $session->id;
				$statistics->question_id = $question->id;
				$statistics->save();
			}

			$session->statistics_id = $statistics->id; //Current question
			$session->save();

			$statisticsid_enc = STR::integer_map($statistics->id);

			$app->lincko->data['data_pitch_url'] = $base_url.'/ppt/qrcode/'.$statisticsid_enc.'.jpg?'.$statistics->created_at;

			$app->lincko->data['data_stats_iframe'] = $base_url.'/ppt/stats/'.$statisticsid_enc;
			if($static){
				//Do not refresh for answer
				$app->lincko->data['data_stats_iframe'] .= '/static';
				$app->lincko->data['data_pitch_url_hide'] = true;
			}

			if(isset($app->lincko->data['body_preview']) && $app->lincko->data['body_preview']){
				//Just simulate some data for preview purpose
				$app->lincko->data['data_stats_iframe'] .= '?preview=1';
			}

			if($question->style==2){
				$answers = Answer::Where('parent_id', $question->id)
					->whereNotNull('file_id')
					->take(4)
					->orderBy('number')
					->get(array('id', 'file_id', 'title', 'number'));
			} else {
				$answers = Answer::Where('parent_id', $question->id)
					->where(function ($query) {
						$query
							->whereNotNull('file_id')
							->orWhere('title', '!=', '');
					})
					->take(4)
					->orderBy('number')
					->get(array('id', 'file_id', 'title', 'number'));
			}
			
			$data_answers = array();
			$correct = false;
			foreach ($answers as $key => $answer) {
				$prefix = 'data_answer_'.$answer->number;
				$data_answers[$answer->number] = $prefix;
				$app->lincko->data[$prefix] = true;
				$app->lincko->data[$prefix.'_title'] = STR::sql_to_html($answer->title);
				$app->lincko->data[$prefix.'_picture'] = false;
				$app->lincko->data[$prefix.'_correct'] = false;
				if($answer->file_id && $file = File::Where('id', $answer->file_id)->first(array('id', 'uploaded_by', 'link', 'ori_ext', 'updated_ms'))){
					$app->lincko->data[$prefix.'_picture'] = $base_url.'/files/'.$file->uploaded_by.'/'.$file->link.'.'.$file->ori_ext.'?'.$file->updated_ms;
				}
				if($question->style!=2 && !$app->lincko->data[$prefix.'_picture'] && empty($answer->title)){
					$data_answers[$answer->number] = false;
					unset($data_answers[$answer->number]);
					$app->lincko->data[$prefix] = false;
					unset($answers[$key]);
					continue;
				}
				if($style=='answer' && !$correct && $question->answer_id == $answer->id){
					$app->lincko->data[$prefix.'_correct'] = true;
					$correct = true;
				}
			}
			if($style=='answer' && !$correct){
				foreach ($answers as $key => $answer) {
					//Use the first one by default as correct if any error
					$prefix = 'data_answer_'.$answer->number;
					$app->lincko->data[$prefix.'_correct'] = true;
					break;
				}
			}

			ksort($data_answers);
			$app->lincko->data['data_answers'] = array();
			$i = 1;
			foreach ($data_answers as $prefix) {
				$key = $i;
				if($question->style==3){
					//Convert number to alphabet
					if($key==1){ $key = 'A'; }
					else if($key==2){ $key = 'B'; }
					else if($key==3){ $key = 'C'; }
					else if($key==4){ $key = 'D'; }
				}
				$app->lincko->data['data_answers'][$key] = $prefix;
				$i++;
			}

			if($question->style==1){
				$app->render('/bundles/lincko/ppt/templates/ppt/qanda/questions.twig');
				return true;
			} else if($question->style==2){
				$app->render('/bundles/lincko/ppt/templates/ppt/qanda/pictures.twig');
				return true;
			} else if($question->style==3){
				$app->render('/bundles/lincko/ppt/templates/ppt/qanda/questions.twig');
				return true;
			}
		}
		$app->render('/bundles/lincko/ppt/templates/generic/sorry.twig');
	}

	public function stats_get($statisticsid_enc, $refresh='refresh'){
		$app = ModelLincko::getApp();
		$data = $this->stats_data($statisticsid_enc);
		$app->lincko->data['get_refresh'] = true;
		if($refresh=='static'){
			$app->lincko->data['get_refresh'] = false;
		}
		if(isset($data['data_question_style'])){
			if($data['data_question_style']==1){
				$app->render('/bundles/lincko/ppt/templates/ppt/stats/questions.twig');
				return true;
			} else if($data['data_question_style']==2){
				$app->render('/bundles/lincko/ppt/templates/ppt/stats/questions.twig');
				return true;
			} else if($data['data_question_style']==3){
				$app->render('/bundles/lincko/ppt/templates/ppt/stats/statistics.twig');
				return true;
			}
		}
		$app->render('/bundles/lincko/ppt/templates/generic/blanc.twig');
	}

	public function statsjson_get($statisticsid_enc){
		$msg = array('data' => $this->stats_data($statisticsid_enc),);
		(new Json($msg))->render();
		return exit(0);
	}

	public function statsjs_get($statisticsid_enc){
		$app = ModelLincko::getApp();
		$app->response->headers->set('Content-Type', 'application/javascript');
		$app->response->headers->set('Cache-Control', 'no-cache, must-revalidate');
		$app->response->headers->set('Expires', 'Fri, 12 Aug 2011 14:57:00 GMT');
		$data = $this->stats_data($statisticsid_enc);
		foreach ($data as $key => $value) {
			echo 'var statsjs_'.$key.'="'.$value.'";';
		}
	}

	public function stats_data($statisticsid_enc){
		$app = ModelLincko::getApp();
		$get = ModelLincko::getData();
		$preview = false;
		if(isset($get->preview) && $get->preview){
			$preview = true;
		}
		$data['data_preview'] = $app->lincko->data['data_preview'] = $preview;
		$data = array();
		$data['data_statisticsid_enc'] = $app->lincko->data['data_statisticsid_enc'] = $statisticsid_enc;
		$statistics_id = STR::integer_map($statisticsid_enc, true);
		$data['get_style'] = $app->lincko->data['get_style'] = 'stats';
		$data['data_question_style'] = $app->lincko->data['data_question_style'] = false;
		
		$statistics = Statistics::find($statistics_id);
		if($statistics && $question = Question::Where('id', $statistics->question_id)->first(array('id', 'style', 'answer_id', 'parent_id'))){
			$data['data_question_style'] = $app->lincko->data['data_question_style'] = $question->style;

			if($preview){
				$data['data_participants'] = $app->lincko->data['data_participants'] = rand(200, 299);
			} else {
				$data['data_participants'] = $app->lincko->data['data_participants'] = $total = intval($statistics->a) + intval($statistics->b) + intval($statistics->c) + intval($statistics->d);
			}

			if($question->style==1){
				if($preview){
					$random = rand(30, 70);
					$data['data_correct'] = $app->lincko->data['data_correct'] = $random;
					$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = 100-$random;
				} else {
					$data['data_correct'] = $app->lincko->data['data_correct'] = 0;
					$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = 0;
					if($statistics && $total>0){
						if($answer = Answer::Where('id', $question->answer_id)->first(array('id', 'number'))){
							$letter = $answer->letter();
							if(isset($statistics->$letter)){
								$data['data_correct'] = $app->lincko->data['data_correct'] = round(100 * $statistics->$letter / $total);
								$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = round(100 * ($total - $statistics->$letter) / $total);
							}
						}
					}
				}
			} else if($question->style==2){
				if($preview){
					$random = rand(30, 70);
					$data['data_correct'] = $app->lincko->data['data_correct'] = $random;
					$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = 100-$random;
				} else {
					$data['data_correct'] = $app->lincko->data['data_correct'] = 0;
					$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = 0;
					if($statistics && $total>0){
						if($answer = Answer::Where('id', $question->answer_id)->first(array('id', 'number'))){
							$letter = $answer->letter();
							if(isset($statistics->$letter)){
								$data['data_correct'] = $app->lincko->data['data_correct'] = round(100 * $statistics->$letter / $total);
								$data['data_not_correct'] = $app->lincko->data['data_not_correct'] = round(100 * ($total - $statistics->$letter) / $total);
							}
						}
					}
				}
			} else if($question->style==3){
				if($preview){
					$total = 0;
					$random_1 = min(rand(10, 50), 100-$total);
					$total += $random_1;
					$random_2 = min(rand(10, 50), 100-$total);;
					$total += $random_2;
					$random_3 = min(rand(10, 50), 100-$total);
					$total += $random_3;
					$random_4 = min(rand(10, 50), 100-$total);
					$data['data_number_1'] = $app->lincko->data['data_number_1'] = $random_1;
					$data['data_number_2'] = $app->lincko->data['data_number_2'] = $random_2;
					$data['data_number_3'] = $app->lincko->data['data_number_3'] = $random_3;
					$data['data_number_4'] = $app->lincko->data['data_number_4'] = $random_4;
				} else {
					if($total>0){
						$answers = Answer::Where('parent_id', $question->id)
							->where(function ($query) {
								$query
									->whereNotNull('file_id')
									->orWhere('title', '!=', '');
							})
							->take(4)
							->orderBy('number')
							->get(array('id', 'number'));
						foreach ($answers as $answer) {
							if($statistics){
								$letter = $answer->letter();
								$data['data_number_'.$answer->number] = $app->lincko->data['data_number_'.$answer->number] = round(100 * $statistics->$letter / $total);
							}
						}
					}
				}
			}
		}
		return $data;
	}

	public function qrcode_get($statisticsid_enc){
		$app = ModelLincko::getApp();
		$base_url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];
		$url = $base_url.'/quiz/question/'.$statisticsid_enc;

		$statistics_id = STR::integer_map($statisticsid_enc, true);
		$statistics = Statistics::find($statistics_id);

		if($statistics){
			ob_clean();
			flush();
			$timestamp = $statistics->created_ms;
			$gmt_mtime = gmdate('r', round($timestamp/1000));
			header('Last-Modified: '.$gmt_mtime);
			header('Expires: '.gmdate(DATE_RFC1123, time()+16000000)); //About 6 months cached
			header('ETag: "'.md5($statistics->id.'-'.$timestamp).'"');
			if(isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) || isset($_SERVER['HTTP_IF_NONE_MATCH'])) {
				if ($_SERVER['HTTP_IF_MODIFIED_SINCE'] == $gmt_mtime || str_replace('"', '', stripslashes($_SERVER['HTTP_IF_NONE_MATCH'])) == md5($statistics->id.'-'.$timestamp)) {
					header('HTTP/1.1 304 Not Modified');
					return exit(0);
				}
			}

			//https://packagist.org/packages/endroid/qrcode
			$qrCode = new QrCode();
			$qrCode
				->setLogo($app->lincko->path.'/bundles/lincko/ppt/public/images/logo/wechat2.png')
				->setLogoSize(120)
				->setText($url)
				->setSize(640)
				->setPadding(20)
				->setErrorCorrection('medium')
				->setForegroundColor(array('r' => 0, 'g' => 0, 'b' => 0, 'a' => 0))
				->setBackgroundColor(array('r' => 255, 'g' => 255, 'b' => 255, 'a' => 0))
				->setImageType(QrCode::IMAGE_TYPE_PNG)
			;
			header('Content-Type: '.$qrCode->getContentType());
			$qrCode->render();
			
			return exit(0);
		}
		$app->render('/bundles/lincko/ppt/templates/generic/blanc.twig');
	}

}
