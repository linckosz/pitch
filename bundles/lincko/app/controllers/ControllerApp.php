<?php
// Category 3

namespace bundles\lincko\app\controllers;

use \libs\Controller;
use \libs\STR;
use \bundles\lincko\api\models\ModelLincko;
use \bundles\lincko\api\models\data\Question;

class ControllerApp extends Controller {

	public function sample_get($questionid_enc){
		$app = ModelLincko::getApp();
		include_once($app->lincko->path.'/libs/TinyButStrong.php'); //Note: Composer is using a too old version of opentbs, and cannot use autoloader because of namespace issue, must be manual
		$question_id = STR::integer_map($questionid_enc, true);
		ob_clean();
		flush();
		if($question = Question::find($question_id)){
			$tbs = new \clsTinyButStrong;
			$tbs->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);
			$tbs->LoadTemplate($app->lincko->path.'/bundles/lincko/app/models/sample/sample.pptx');
			$tbs_bis = new \clsTinyButStrong;
			$tbs_bis->Plugin(TBS_INSTALL, OPENTBS_PLUGIN);
			$tbs_bis->LoadTemplate($app->lincko->path.'/bundles/lincko/app/models/sample/sample.pptx');
			if($question->style == 3){
				//Delete the answer slide for statistics
				$tbs->PlugIn(OPENTBS_DELETE_SHEETS, 3);
				$tbs_bis->PlugIn(OPENTBS_DELETE_SHEETS, 3);
			}
			//Change contents with new question
			$list = array(
				'ppt/webextensions/webextension1.xml',
				'ppt/comments/comment1.xml',
				'ppt/webextensions/webextension2.xml',
				'ppt/comments/comment2.xml',
			);
			foreach ($list as $subfile) {
				if($tbs_bis->Plugin(OPENTBS_FILEEXISTS, $subfile)){
					if($tbs_bis->Plugin(OPENTBS_SELECT_FILE, $subfile)){
						$change = $tbs_bis->Source;
						$question_url = $app->lincko->domain.'/ppt/question/'.$questionid_enc;
						$answer_url = $app->lincko->domain.'/ppt/answer/'.$questionid_enc;
						$info = $app->trans->getBRUT('app', 6, 1); //Please use PowerPoint 2013 or later, with its Add-in Web Viewer installed. And click on "Enable Editing" if you see the notification.
						if(!empty($app->lincko->data['lincko_dev'])){
							$question_url = $app->lincko->data['lincko_dev'].'.'.$question_url;
							$answer_url = $app->lincko->data['lincko_dev'].'.'.$answer_url;
						}
						$change = preg_replace("/&lt;lincko_question&gt;.*?&lt;\/lincko_question&gt;/i", $question_url, $change);
						$change = preg_replace("/&lt;lincko_answer&gt;.*?&lt;\/lincko_answer&gt;/i", $answer_url, $change);
						$change = preg_replace("/&lt;lincko_info&gt;.*?&lt;\/lincko_info&gt;/i", $info, $change);
						$tbs->Plugin(OPENTBS_REPLACEFILE, $subfile, $change, OPENTBS_STRING, false);
					}
				}
			}
			header('Content-Description: File Transfer');
			header('Content-Type: attachment/force-download;');
			header('Content-Transfer-Encoding: binary');
			header('Content-Type: application/force-download;');
			header('Content-Disposition: attachment; filename="[PowerPoint 2013+]_Sample_'.$questionid_enc.'.pptx"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header('Pragma: public');
			$tbs->Show(true, '[PowerPoint 2013+]_Sample_'.$questionid_enc.'.pptx');
			return true;
		}
		
		return false;
	}

}
