var previewer = function(file_id){
	$("#previewer_update").off('click');
	$("#previewer_delete").off('click');
	app_application_lincko.clean("previewer_picture");
	if(file_id){
		var item = Lincko.storage.get('file', file_id);
		if(item){
			var url = Lincko.storage.getFile(file_id);
			if(url){
				var parent = Lincko.storage.getParentClone('file', file_id);
				if(item['category']=="image"){
					
					$("#previewer_picture")
						.css("background-image", "url('"+url+"')")
						.removeClass('display_none');
					if(parent){
						app_application_lincko.add("previewer_picture", parent['_type']+"_"+parent['id'], function(){
							var type = this.action_param[0];
							var id = this.action_param[1];
							var new_file_id = Lincko.storage.get(type, id, 'file_id');
							previewer(new_file_id);
						}, [parent['_type'], parent['id']]);
					}

					$("#previewer_update").on('click', [parent['_type'], parent['id']], function(event){
						var type = event.data[0];
						var id = event.data[1];
						var item = Lincko.storage.getClone(type, id);
						app_upload_open_photo_single(item['_type'], item['id'], item['md5'], false, true, item['md5']);
						event.stopPropagation();
					});
					
					$("#previewer_delete").on('click', file_id, function(event){
						if(confirm(Lincko.Translation.get('app', 26, 'js'))){ //Are you sure you want to delete this item?
							var data = {};
							//Delete the file
							data.delete = {};
							data.delete.file = {};
							var item = Lincko.storage.get('file', event.data);
							data.delete.file[item['id']] = {
								id: item['id'],
								md5: item['md5'],
							};
							if(parent){
								//Unset the parent linked
								data.set = {};
								data.set[parent['_type']] = {};
								data.set[parent['_type']][parent['id']] = {
									id: parent['id'],
									md5: parent['md5'],
									file_id: null,
								};
							}
							var Elem_bis = $(this);
							var action_cb_success = function(msg, error, status, extra){
								storage_cb_success(msg, error, status, extra);
							}
							var action_cb_complete = function(){
								storage_cb_complete();
								base_hideProgress(Elem_bis);
								app_application_lincko.prepare("file_"+file_id, true);
							};
							if(storage_offline(data)){
								base_showProgress(Elem);
								wrapper_sendAction(data, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, action_cb_complete);
							}
							previewer(false);
						}
						event.stopPropagation();
					});
					
					app_generic_state.change({
						previewer: true,
					}, null, 1);
					return true;
				}
				//toto => still need to make the video, even if we don't display them
			}
		}
	}
	$("#previewer_picture")
		.css("background-image", "url('"+wrapper_neutral.src+"')")
		.addClass('display_none');

	app_generic_state.change({
		previewer: false,
	}, null, -1);

	return false;
}

JSfiles.finish(function(){
	$("#previewer_picture, #previewer_close").on('click', function(event){
		previewer(false);
		event.stopPropagation();
	});
});
