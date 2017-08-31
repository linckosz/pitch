<?php

namespace bundles\lincko\quiz\controllers;

use \libs\STR;
use \libs\Controller;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\Session;
use \bundles\lincko\api\models\Statistics;
use \bundles\lincko\api\models\Answered;
use \bundles\lincko\api\models\base\Action;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\File;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\Guest;
use \bundles\lincko\wrapper\models\WechatPublic;


class ControllerQuiz extends Controller {

	protected function prepare(){
		$data = ModelLincko::getData();
		$app = ModelLincko::getApp();

		$app->lincko->data['html_zoom'] = false;
		if(isset($data->zoom)){
			$app->lincko->data['html_zoom'] = (float) $data->zoom;
		}
	}

	protected function question_display($question_id){
		$app = ModelLincko::getApp();
		if($question = Question::Where('id', $question_id)->first(array('id', 'updated_ms', 'parent_id', 'answer_id', 'file_id', 'title', 'style'))){

			$base_url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];

			$app->lincko->data['data_question'] = true;
			$app->lincko->data['data_question_title'] = $question->title; //Twig will do a HTML encode
			$app->lincko->data['data_question_picture'] = false;
			$app->lincko->data['data_question_style'] = $question->style;
			if($question->file_id && $file = File::Where('id', $question->file_id)->first(array('id', 'uploaded_by', 'link', 'ori_ext', 'updated_ms'))){
				$app->lincko->data['data_question_picture'] = $base_url.'/files/'.$file->uploaded_by.'/'.$file->link.'.'.$file->ori_ext.'?'.$file->updated_ms;
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
				$app->lincko->data[$prefix.'_id'] = STR::integer_map($answer->id);
				$app->lincko->data[$prefix.'_title'] = $answer->title; //Twig will do a HTML encode
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

			$app->lincko->data['title'] = $app->trans->getBRUT('quiz', 0, 14); //Single choice
			$app->render('/bundles/lincko/quiz/templates/quiz/qanda/questions.twig');
			return true;
		}
		$app->render('/bundles/lincko/quiz/templates/generic/sorry.twig');
		return true;
	}

	public function question_get($sessionid_enc, $questionid_enc){
		$app = ModelLincko::getApp();
		$this->prepare();
		$app->lincko->data['data_statisticsid_enc'] = '0';
		if("$sessionid_enc"=='0'){
			$question_id = STR::integer_map($questionid_enc, true);
			$this->question_display($question_id);
		} else {
			$session_id = STR::integer_map($sessionid_enc, true);
			$question_id = STR::integer_map($questionid_enc, true);
			if($statistics = Statistics::unlock($session_id, $question_id)){
				if($session = Session::find($session_id)){
					$session->statistics_id = $statistics->id;
					$session->save();
				}
				$app->lincko->data['data_statisticsid_enc'] = STR::integer_map($statistics->id);
				$this->question_display($question_id);
			}
		}
		return true;
	}

	public function answer_get($statisticsid_enc, $answerid_enc){
		$app = ModelLincko::getApp();
		$this->prepare();
		$user_info = Action::getUserInfo();
		if($user_info[2] == 'Wechat'){
			if($wechat_package = WechatPublic::getPackage()){
				foreach ($wechat_package as $key => $value) {
					$app->lincko->data['wechat_package_'.$key] = $value;
				}
			}
		}
		$app->lincko->data['data_answered'] = false;
		$app->lincko->data['data_correct'] = false;
		$answer_id = STR::integer_map($answerid_enc, true);
		$guest_id = $app->lincko->data['guest_id'];
		if("$statisticsid_enc"=='0'){
			if($answer = Answer::Where('id', $answer_id)->first(array('id', 'number', 'parent_id'))){
				$letter = $answer->letter();
				if($question = Question::Where('id', $answer->parent_id)->first(array('id', 'answer_id', 'style'))){
					if($answer->id == $question->answer_id){
						$app->lincko->data['data_correct'] = true;
					}
					$app->lincko->data['title'] = $app->trans->getBRUT('quiz', 0, 16); //Result
					if($question->style==3){
						$app->render('/bundles/lincko/quiz/templates/quiz/result/statistics.twig');
					} else {
						$app->render('/bundles/lincko/quiz/templates/quiz/result/answer.twig');
					}
					return true;
				}
			}
		} else {
			$statistics_id = STR::integer_map($statisticsid_enc, true);
			if($statistics = Statistics::Where('id', $statistics_id)->where('open', 1)->first()){
				//Check if already answered
				if(!Answered::isAuthorized($guest_id, $statistics->id, $statistics->question_id)){
					$app->lincko->data['data_answered'] = true;
					$app->render('/bundles/lincko/quiz/templates/quiz/result/wait.twig');
					return true;
				} else if($answer = Answer::Where('id', $answer_id)->first(array('id', 'number', 'parent_id'))){
					$letter = $answer->letter();
					if(isset($statistics->$letter)){
						if($question = Question::Where('id', $answer->parent_id)->first(array('id', 'answer_id', 'style'))){
							$value = intval($statistics->$letter);
							$value++;
							$statistics->$letter = $value;
							$statistics->save();
							if($answer->id == $question->answer_id){
								$app->lincko->data['data_correct'] = true;
							}
							$answered = new Answered;
							$answered->guest_id = $guest_id;
							$answered->statistics_id = $statistics->id;
							$answered->question_id = $question->id;
							$answered->correct = $app->lincko->data['data_correct'];
							$answered->info_0 = $user_info[0];
							$answered->info_1 = $user_info[1];
							$answered->info_2 = $user_info[2];
							$answered->info_3 = $user_info[3];
							try { //In case there is a doublon
								$answered->save();
							} catch (\Exception $e){
								//Do nothing
							}
							$app->lincko->data['title'] = $app->trans->getBRUT('quiz', 0, 16); //Result
							if($question->style==3){
								$app->render('/bundles/lincko/quiz/templates/quiz/result/statistics.twig');
							} else {
								$app->render('/bundles/lincko/quiz/templates/quiz/result/answer.twig');
							}
							return true;
						}
					}
				}
			}

		}
		$app->render('/bundles/lincko/quiz/templates/quiz/result/wait.twig');
		return true;
	}

}
