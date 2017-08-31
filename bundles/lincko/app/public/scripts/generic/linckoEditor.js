/*-----linckoEditor------------------------------------*/

//file icons inside the editor becomes clickable
function linckoEditor_attachFileClick(elem){
	if(!(elem instanceof $)){ elem = $(elem); }

	elem.off('click.linckoEditor_files').on('click.linckoEditor_files', function(event){
		var elem_file = $(event.target).closest('.linckoEditor_fileWrapper', elem);
		if(elem_file.length && elem_file.attr('files_id')){
			submenu_Build( 'taskdetail', true, null, 
				{
					"type":'files', 
					"id":elem_file.attr('files_id'),
				});
		}
	});
}
function linckoEditor(elem, toolbarID, param){
	//editorInst = CKEDITOR.replace(elem);
	var editorInst = CKEDITOR.inline( elem, {
			// To enable source code editing in a dialog window, inline editors require the "sourcedialog" plugin.
			extraPlugins: 'sharedspace,imageuploader,indentblock,autolink',//,timestamp',
			removePlugins: 'floatingspace,maximize,resize,about',
			sharedSpaces: {
				top: toolbarID,
			},
			removeButtons: 'Cut,Copy,Paste,Undo,Redo,Anchor,Underline,Strike,Subscript,Superscript',
		} );

	editorInst.Lincko_param = {};
	editorInst.Lincko_param = param;
	editorInst.Lincko_param.files = {};

	//clicking on links will open in new tab/window
	$(editorInst.element.$).click(function(event) {
		var elem_editor = this;
		if(typeof event.target.href != 'undefined') {
			device_download(event.target.href, '_system', false);
			return;
		}
	});
	linckoEditor_attachFileClick(editorInst.element.$);

	var submenu_content = $('#'+editorInst.Lincko_param.submenuInst.id).find("[find=submenu_wrapper_content]");
	if(submenu_content.length && submenu_content.hasClass('overthrow')){

		//use fixed position
		editorInst.Lincko_param.iscrollInst = myIScrollList[submenu_content.prop('id')];
		$('#'+editorInst.Lincko_param.submenuInst.id).find('.submenu_top').css('z-index',100);

		$(editorInst.element.$).on('paste cut', {iscroll: editorInst.Lincko_param.iscrollInst}, function(event) {
			var iscrollInst = event.data.iscroll;
			var that = $(this);
			that.css({'overflow':'hidden', 'height':that.height()});

			setTimeout(function(){
				that.removeAttr('style');
				iscrollInst.refresh();
				//wrapper_IScroll();

				var windowHeight = $(window).height();
				var buffer = 50;
				var y = burger_regex_getCaretOffset(that, true).y;
				if(y > windowHeight && iscrollInst && iscrollInst.hasVerticalScroll){
					var scrollpx = y - $(window).height() + buffer;
					iscrollInst.scrollTo(0,-scrollpx);			
				}
			}, 100);
		});
	}

	editorInst.addCommand("insertImg", { // create named command
		exec: function(editor) {

			//use setTimeout and click hidden input to work with iOS
			setTimeout(function(){	
				$('#-linckoEditor_focusControl').click();//this takes focus briefly out of the editor, allowing iOS to hide the keyboard and display file upload dialog
				if(editor.Lincko_param.submenuInst.param.id == 'new' && editor.Lincko_param.submenuInst.param.uniqueID){
					app_upload_open_files('projects', editor.Lincko_param.submenuInst.param.projID, false, true, {link_queue: true});
				}
				else{
					app_upload_open_files(editor.Lincko_param.submenuInst.param.type, editor.Lincko_param.submenuInst.param.id, false, true);
				}
			}, 0);

			index = Object.keys(app_upload_files.lincko_files).length;
			var elem_img_id = editor.Lincko_param.submenuInst.id+'_editor_img_'+index;

			//lincko_files_index use this
			editor.Lincko_param.files[elem_img_id] = {
				index: index,
				local_url: '',
				temp_id: null,
				progress: 0,
			};

			app_application_lincko.add(elem, ['upload', 'files'], function(){
				//use this.action_param, unique to each anonymous function
				$.each(editor.Lincko_param.files, function(elem_img_id,val){
					var $elem_img_id = $('#'+elem_img_id);

					//initialize
					if(!val.temp_id){//to make sure it is run only once. temp_id is added within this if statement
						if(!app_upload_files.lincko_files[val.index]){return; }//there is an issue here
						editor.Lincko_param.files[elem_img_id].temp_id = app_upload_files.lincko_files[val.index].lincko_temp_id;

						var elem_fileUpload = $('<span temp_id="'+app_upload_files.lincko_files[val.index].lincko_temp_id+'" id="'+elem_img_id+'"class="linckoEditor_fileProgress" contenteditable="false">0</span>');
						
						var fileType = app_upload_files.lincko_files[val.index].files[0].type;
						if((fileType.toLowerCase()).indexOf('image') == -1){ //if it not an image
							var fileName = app_upload_files.lincko_files[val.index].files[0].name;
							var regex_fileExt = new RegExp(/\.([0-9a-z]+$)/);
							var match = fileName.match(regex_fileExt);
							if(match){
								elem_fileUpload.addClass(app_models_fileType.getClass(match[1]));
							}
						}
						
						$elem_img_id = elem_fileUpload;
						editor.insertHtml(elem_fileUpload.wrap('<div/>').parent().html());

					}

					//for IMAGE: use the local image to preview the current image being uploaded
					if(	$elem_img_id.length
						&& !$elem_img_id.hasClass('fa')
						&& $elem_img_id.prop('style')
						&& !$elem_img_id.prop('style').length 
						&& app_upload_files.lincko_files[val.index]
						&& app_upload_files.lincko_files[val.index].files[0] 
						&& app_upload_files.lincko_files[val.index].files[0].preview){
						var local_url = app_upload_files.lincko_files[val.index].files[0].preview.toDataURL();
						var img = new Image();
						img.src = local_url;
						$elem_img_id.css({
												'background-image': 'url('+local_url+')', 
												'height': img.naturalHeight, 
												'width': img.naturalWidth,
												'display': 'inline-block',
												'opacity': 0.5,
												'text-align': 'center',
												'line-height': img.naturalHeight+'px',
												'font-size': (img.naturalHeight)/3+'px',
												'overflow': 'hidden',
											});
					}

					var index = editor.Lincko_param.files[elem_img_id].index;



					if(app_upload_files.lincko_files[val.index]
						&& app_upload_files.lincko_files[val.index].lincko_status == 'error'){
						$elem_img_id.html(Lincko.Translation.get('app', 60, 'html')/*upload failed*/);
					}
					else if(editor.Lincko_param.files[elem_img_id].progress==100
						&& !app_upload_files.lincko_files[val.index]
						&& $elem_img_id.hasClass('linckoEditor_fileProgress')){ //on completion, replace with proper html

						var tmp = editor.Lincko_param.files[elem_img_id].temp_id;
						var file = Lincko.storage.list('files',1,{temp_id: tmp})[0]; //check if file object is ready
						if(file){
							var elem_replace;
							if($elem_img_id.hasClass('fa')){ //if file
								$elem_img_id.removeClass('linckoEditor_fileProgress').html('&nbsp;').removeAttr('temp_id').removeAttr('contenteditable');
								var elem_replace = $('#-linckoEditor_fileWrapper').clone().prop('id','').attr('files_id',file['_id']);
								elem_replace.find('[find=icon]').append($elem_img_id.clone().prop('id', ''));
								elem_replace.find('[find=name]').text(file['+name']);
							}
							else{//if image
								var file_url = Lincko.storage.getFile(file['_id'], 'link');
								elem_replace = $('<img>')
										.prop('src',file_url)
										.addClass('submenu_taskdetail_description_img')
										.load(function(){
											$(window).resize();
										});
							}

							$elem_img_id.replaceWith(elem_replace);
							$('#'+editorInst.Lincko_param.submenuInst.id).trigger('canSave');

						}
					}
					else{
						if(app_upload_files.lincko_files[index]){
							var progress = app_upload_files.lincko_files[index].lincko_progress;
							editor.Lincko_param.files[elem_img_id].progress = progress;
							$elem_img_id.html(' '+app_upload_files.lincko_files[index].lincko_name +' -- '+progress);
						}
					}

					
				});

			} /*access value here by this.action_param*/);
		}
	});

	editorInst.ui.addButton('imgBtn', { // add new button and bind our command
		label: Lincko.Translation.get('app', 3613, 'html'),/*Insert Image*/
		command: 'insertImg',
		toolbar: 'insert',
		icon: "/lincko/app/images/app/linckoeditor/imageupload.png",
	});

	return editorInst;
}
/*------END OF linckoEditor---------------------------*/
