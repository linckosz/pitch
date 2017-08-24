<?php

namespace bundles\lincko\app\controllers;

use \libs\Controller;
use \libs\STR;
use \libs\Folders;
use \libs\Json;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Pitch;
use \bundles\lincko\api\models\data\Question;
use \bundles\lincko\api\models\data\User;

class ControllerApp extends Controller {

	public function refresh_post(){
		$msg = 'error';
		if(User::isAdmin()){
			if(User::refreshAll()){
				$msg = 'OK';
			}
		}
		$msg = array('msg' => $msg);
		(new Json($msg))->render();
		return exit(0);
	}

	public function sample_pitch_get($pitchid_enc){
		$app = ModelLincko::getApp();
		include_once($app->lincko->path.'/libs/TinyButStrong.php'); //Note: Composer is using a too old version of opentbs, and cannot use autoloader because of namespace issue, must be manual
		$pitch_id = STR::integer_map($pitchid_enc, true);
		ob_clean();
		flush();
		
		if($pitch = Pitch::find($pitch_id)){

			$lincko_info = $app->trans->getBRUT('app', 6, 1); //Please use PowerPoint 2013 or later, with its Add-in Web Viewer installed. And click on "Enable Editing" if you see the notification. Or simply use any browser.

			$folder = new Folders;
			$folder->createPath($app->lincko->filePath.'/sample/');
			$files = $folder->loopFolder(true);
			foreach ($files as $file) {
				if(filemtime($file) < time()-(24*3600)){
					@unlink($file);
				}
			}
			$files = $folder->loopFolder(true);

			$ppt = $app->lincko->path.'/bundles/lincko/app/models/sample/pitch30.pptx';
			$ppt_temp = $app->lincko->filePath.'/sample/pitch_'.$pitchid_enc.'_'.time().'.pptx';

			copy($ppt, $ppt_temp);
			usleep(50000);

			$zip = new \ZipArchive();
			//Make sure the copy function if completed
			$open = 0;
			$i = 0;
			while($open!=1 && $i<1000){
				$open = $zip->open($ppt_temp);
				usleep(10000);
				$i++;
			}

			$lincko_pitch = $pitch->title; //title
			$lincko_by = User::getUser()->username; //By Bruno Martin mad1ssw
			$content = 'ppt/slides/slide1.xml';
			$xml = $zip->getFromName($content);
			if(!empty($xml)){
				$xml = preg_replace("/lincko_pitch/i", $lincko_pitch, $xml);
				$xml = preg_replace("/lincko_by/i", $lincko_by, $xml);
				$zip->addFromString($content, $xml);
			}

			$lincko_pitch = $app->trans->getBRUT('app', 6, 2).$pitch->title; //Pitch: title
			$content = 'ppt/notesSlides/notesSlide1.xml';
			$xml = $zip->getFromName($content);
			if(!empty($xml)){
				$xml = preg_replace("/lincko_pitch/i", $lincko_pitch, $xml);
				$xml = preg_replace("/lincko_info/i", $lincko_info, $xml);
				$zip->addFromString($content, $xml);
			}

			$questions = $pitch->question()->orderBy('sort', 'ASC')->orderBy('id', 'ASC')->get(array('id', 'style', 'title'));
			$page = 2;
			$page_max = 61;
			$nbr = 1;
			foreach ($questions as $question) {
				$questionid_enc = STR::integer_map($question->id);
				$lincko_question = $app->trans->getBRUT('app', 6, 3); //Question: 
				if($question->style==2){
					$lincko_question .= ' ['.$nbr.' - '.$app->trans->getBRUT('app', 6, 5).'] '; //pictures
				} else if($question->style==3){
					$lincko_question .= ' ['.$nbr.' - '.$app->trans->getBRUT('app', 6, 6).'] '; //statistics
				} else {
					$lincko_question .= ' ['.$nbr.' - '.$app->trans->getBRUT('app', 6, 4).'] '; //answers
				}
				$lincko_question .= $question->title; //Pitch: [2 - pictures] title

				$slides = 2;
				if($question->style == 3){
					//Statistics only have 1 slide
					$slides = 1;
				}
				$limit = $page_max - $slides;
				$type = 'question';
				while ($slides>0 && $page<=$limit) {
					$lincko_url = $app->lincko->http_host.'/ppt/'.$type.'/'.$questionid_enc;
					$slide = 'ppt/slides/slide'.$page.'.xml';
					$rels = 'ppt/slides/_rels/slide'.$page.'.xml.rels';
					$slide_xml = $zip->getFromName($slide);
					$rels_xml = $zip->getFromName($rels);
					if(!empty($slide_xml) && !empty($rels_xml)){
						if(preg_match("/(webextension\d+.xml)/ui", $rels_xml, $match)){
							if($match && isset($match[1])){
								$content = 'ppt/webextensions/'.$match[1];
								$xml = $zip->getFromName($content);
								if(!empty($xml)){
									$xml = preg_replace("/lincko_start_url.*?lincko_end_url/i", $lincko_url, $xml);
									$zip->addFromString($content, $xml);
								}
							}
						}
						if(preg_match("/(notesSlide\d+.xml)/ui", $rels_xml, $match)){
							if($match && isset($match[1])){
								$content = 'ppt/notesSlides/'.$match[1];
								$xml = $zip->getFromName($content);
								if(!empty($xml)){
									$xml = preg_replace("/lincko_question/i", $lincko_question, $xml);
									$xml = preg_replace("/lincko_url/i", $lincko_url, $xml);
									$xml = preg_replace("/lincko_info/i", $lincko_info, $xml);
									$zip->addFromString($content, $xml);
								}
							}
						}
					}
					$type = 'answer';
					$slides--;
					$page++;
				}
				$nbr++;
				if($page > $page_max){
					break;
				}
			}

			$zip->close();

			$tbs = new \clsTinyButStrong;
			$tbs->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);
			$tbs->LoadTemplate($ppt_temp);

			while($page <= $page_max ){
				$tbs->PlugIn(OPENTBS_DELETE_SHEETS, $page);
				$page++;
			}
			
			header('Content-Description: File Transfer');
			header('Content-Type: attachment/force-download;');
			header('Content-Transfer-Encoding: binary');
			header('Content-Type: application/force-download;');
			header('Content-Disposition: attachment; filename="Pitch_'.$pitchid_enc.'_[PowerPoint 2013+].pptx"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header('Pragma: public');
			$tbs->Show(true, 'Pitch_'.$pitchid_enc.'_[PowerPoint 2013+].pptx');
			@unlink($ppt_temp);

			return true;
		}
		return false;
	}

}
