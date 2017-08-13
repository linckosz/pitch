<?php

namespace bundles\lincko\quiz\controllers;

use \libs\STR;
use \libs\Controller;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\Session;
use \bundles\lincko\api\models\Statistics;
use \bundles\lincko\api\models\Answered;
use \bundles\lincko\api\models\data\Answer;
use \bundles\lincko\api\models\data\File;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\Guest;


class ControllerQuiz extends Controller {

	public function question_get($statisticsid_enc){
		$app = ModelLincko::getApp();
		$app->lincko->data['data_statisticsid_enc'] = $statisticsid_enc;
		$app->lincko->data['get_refresh'] = false;
		$statistics_id = STR::integer_map($statisticsid_enc, true);
		if($statistics = Statistics::Where('id', $statistics_id)->first(array('id', 'question_id'))){
			if($question = Question::Where('id', $statistics->question_id)->first(array('id', 'updated_ms', 'parent_id', 'answer_id', 'file_id', 'title', 'style'))){

				$base_url = $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];

				$app->lincko->data['data_question'] = true;
				$app->lincko->data['data_question_title'] = STR::sql_to_html($question->title);
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
					$app->render('/bundles/lincko/quiz/templates/quiz/qanda/questions.twig');
					return true;
				} else if($question->style==2){
					$app->render('/bundles/lincko/quiz/templates/quiz/qanda/questions.twig');
					return true;
				} else if($question->style==3){
					$app->render('/bundles/lincko/quiz/templates/quiz/qanda/questions.twig');
					return true;
				}
			}
		}
		$app->render('/bundles/lincko/quiz/templates/generic/sorry.twig');
	}

	public function answer_get($statisticsid_enc, $answerid_enc){
		$app = ModelLincko::getApp();
		$app->lincko->data['data_answered'] = false;
		$app->lincko->data['data_correct'] = false;
		$statistics_id = STR::integer_map($statisticsid_enc, true);
		$answer_id = STR::integer_map($answerid_enc, true);
		$guest_id = $app->lincko->data['guest_id'];
		if($statistics = Statistics::find($statistics_id)){
			//Check if already answered
			if(Answered::Where('guest_id', $guest_id)->where('statistics_id', $statistics->id)->where('question_id', $statistics->question_id)->first(array('id'))){
				$app->lincko->data['data_answered'] = true;
				$app->render('/bundles/lincko/quiz/templates/quiz/result/wait.twig');
				return true;
			} else if($answer = Answer::Where('id', $answer_id)->first(array('id', 'number', 'parent_id'))){
				$letter = $answer->letter();
				if(isset($statistics->$letter)){
					if($question = Question::Where('id', $answer->parent_id)->first(array('id', 'answer_id'))){
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
						try { //In case there is a doublon
							$answered->save();
						} catch (\Exception $e){
							//Do nothing
						}
						$app->render('/bundles/lincko/quiz/templates/quiz/result/answer.twig');
						return true;
					}
				}
			}
		}
		$app->render('/bundles/lincko/quiz/templates/quiz/result/wait.twig');
	}

}
