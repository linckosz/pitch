var storage_first_request = true; //Help to launch getSchema within getLatest only once at the beginning to insure nothing is missing
var storage_first_launch = true;
var storage_show_offline = false;
var storage_preloaded = {};

//Helps to update the sreen immediatly (work only for update/delete, not for creation/restore)
var storage_offline = function(data){
	var update_global = false;
	var update_item = false;
	var synchro = {};
	var time_ms = Lincko.now.getTimeServer();

	//For update
	if(typeof data.set == 'object'){
		for(var i in data.set){
			if(typeof Lincko.storage.data[i] == 'object'){
				for(var j in data.set[i]){
					if(typeof Lincko.storage.data[i][j] == 'object'){
						update_item = false;
						for(var k in data.set[i][j]){
							if(k=='id' || k=='md5'){
								continue; //We don't check fixed value
							}
							if(typeof Lincko.storage.data[i][j][k] == 'undefined' || Lincko.storage.data[i][j][k] != data.set[i][j][k]){
								synchro[i+'_'+j+'_'+k] = i+'_'+j+'_'+k;
								update_item = true;
								if(typeof Lincko.storage.data[i][j]['offline'] != 'object'){
									Lincko.storage.data[i][j]['offline'] = {};
								}
								Lincko.storage.data[i][j]['offline'][k] = time_ms;
								Lincko.storage.data[i][j][k] = data.set[i][j][k];
							}
						}
						if(update_item){
							update_global = true;
							synchro['update'] = 'update';
							synchro[i] = i;
							synchro[i+'_'+j] = i+'_'+j;
							storage_local_storage.prepare(i, j);
						}
					} else {
						//Inform we work offline for creation
						storage_show_offline = true;
						update_global = true;
					}
				}
			} else {
				//Inform we work offline for creation
				storage_show_offline = true;
				update_global = true;
			}
		}
	}
	//For delete
	if(typeof data.delete == 'object'){
		for(var i in data.delete){
			if(typeof Lincko.storage.data[i] == 'object'){
				for(var j in data.delete[i]){
					if(typeof Lincko.storage.data[i][j] == 'object'){
						update_global = true;
						synchro['update'] = 'update';
						synchro['delete'] = 'delete';
						synchro[i] = i;
						synchro[i+'_delete'] = i+'_delete';
						synchro[i+'_'+j] = i+'_'+j;
						synchro[i+'_'+j+'_delete'] = i+'_'+j+'_delete';
						delete Lincko.storage.data[i][j];
						storage_local_storage.prepare(i, j);
					}
				}
			}
		}
	}
	//For restore
	if(typeof data.delete == 'object'){
		for(var i in data.delete){
			if(typeof Lincko.storage.data[i] == 'object'){
				for(var j in data.delete[i]){
					if(typeof Lincko.storage.data[i][j] == 'undefined'){
						//Inform we work offline for creation
						storage_show_offline = true;
						update_global = true;
					}
				}
			} else {
				//Inform we work offline for creation
				storage_show_offline = true;
				update_global = true;
			}
		}
	}

	if(update_global){
		synchro['clean_data'] = 'clean_data';
		app_application_lincko.prepare(synchro);
	}
	
	return update_global;
};

var storage_cb_success = function(msg, err, status, data){
	var info = false;
	if(typeof data.info == 'string'){
		info = data.info;
	}
	if(typeof data == 'object' && typeof data.data == 'object' && data.data){
		Lincko.storage.update(data.data, info);
	}
};

var storage_cb_error = function(xhr_err, ajaxOptions, thrownError){
	if(storage_show_offline && wrapper_offline){
		base_show_error(Lincko.Translation.get('app', 96, 'js')); //Operation failed. You appear to be working offline.
		storage_show_offline = false;
	}
};

var storage_cb_begin = function(jqXHR, settings){};

var storage_cb_complete = function(msg, err, status, data){
	storage_show_offline = false;
};

Lincko.storage.getMD5 = function(category){
	var md5id = md5(Math.random());
	if(typeof category == 'string' && typeof Lincko.storage.data[category] != 'undefined'){
		while(typeof Lincko.storage.data[category][md5id] != 'undefined'){
			md5id = md5(Math.random());
		}
	}
	return md5id;
};

Lincko.storage.findMD5 = function(md5id, category){
	if(typeof category == 'undefined'){
		for(var category in Lincko.storage.data){
			if(typeof Lincko.storage.data[category] == 'object'){
				for(var id in Lincko.storage.data[category]){
					if(Lincko.storage.data[category][id]['md5'] == md5id){
						return Lincko.storage.data[category][id];
					}
				}
			}
		}
	} else {
		if(typeof Lincko.storage.data[category] == 'object'){
			for(var id in Lincko.storage.data[category]){
				if(Lincko.storage.data[category][id]['md5'] == md5id){
					return Lincko.storage.data[category][id];
				}
			}
		}
	}
	return false;
};

Lincko.storage.offlineCheck = function(){
	var data_offline = false;
	for(var i in Lincko.storage.data){
		for(var j in Lincko.storage.data[i]){
			if(typeof Lincko.storage.data[i][j]['offline'] == 'object' && !$.isEmptyObject(Lincko.storage.data[i][j]['offline'])){
				data_offline = true;
				break;
			}
		}
		if(data_offline){
			break;
		}
	}
	if(data_offline){
		Lincko.storage.getLatest(true, function(){
			var update_global = false;
			var update_item = false;
			var action = false;
			for(var i in Lincko.storage.data){
				for(var j in Lincko.storage.data[i]){
					if(typeof Lincko.storage.data[i][j]['offline'] == 'object' && !$.isEmptyObject(Lincko.storage.data[i][j]['offline'])){
						if(!action){ action = {}; }
						if(typeof action.set == 'undefined'){ action.set = {}; }
						if(typeof action.set[i] == 'undefined'){ action.set[i] = {}; }
						action.set[i][j] = {
							id: Lincko.storage.data[i][j]['id'],
							md5: Lincko.storage.data[i][j]['md5'],
						};
						update_item = false;
						for(var k in Lincko.storage.data[i][j]['offline']){
							if(typeof Lincko.storage.data[i][j][k] != 'undefined'){
								action.set[i][j][k] = Lincko.storage.data[i][j][k];
								update_global = true;
								update_item = true;
								//Check if parent_id or {type}_id to add the md5
								var match = k.match(/([a-z]+)_id$/);
								if(match && typeof match[1] == 'string'){
									var type = match[1];
									if(type=='parent'){
										var parent = Lincko.storage.getParentClone(i, j);
										if(parent){
											action.set[i][j]['parent_md5'] = parent['md5'];
											action.set[i][j]['parent_type'] = parent['_type'];
										}
									} else {
										var item = Lincko.storage.getClone(type, Lincko.storage.data[i][j][k]);
										if(item){
											action.set[i][j][type+'_md5'] = item['md5'];
										}
									}
								}
							} else {
								delete Lincko.storage.data[i][j]['offline'][k];
								storage_local_storage.prepare(i, j);
							}
						}
						if($.isEmptyObject(Lincko.storage.data[i][j]['offline'])){
							delete Lincko.storage.data[i][j]['offline'];
						}
						if(!update_item){
							delete action.set[i][j];
						}
					}
				}
			}
			if(action && update_global){
				var action_cb_success = function(msg, error, status, extra){
					storage_cb_success(msg, error, status, extra);
					var update_global = false;
					var synchro = {};
					for(var i in Lincko.storage.data){
						for(var j in Lincko.storage.data[i]){
							if(typeof Lincko.storage.data[i][j]['offline'] != 'undefined'){
								synchro[i+'_'+j] = i+'_'+j;
								storage_local_storage.prepare(i, j);
								update_global = true;
							}
							delete Lincko.storage.data[i][j]['offline'];
						}
					}
					if(update_global){
						app_application_lincko.prepare(synchro);
					}
				}
				wrapper_sendAction(action, 'post', 'api/data/set', action_cb_success, storage_cb_error, storage_cb_begin, storage_cb_complete);
			}
		});
	}
};
//Check every 60s
setInterval(function(){
	Lincko.storage.offlineCheck();
}, 10000);

//Function that update the localweb database
Lincko.storage.update = function(data, info){
	if(typeof info != 'string'){ info = false }
	var partial;
	var update_global = false;
	var update_item = false;
	var synchro = {};
	var offline_data = {};

	//Insert & Update
	if(typeof data.read == 'object'){
		partial = data.read;
		for(var i in partial) {
			for(var j in partial[i]) {
				update_item = false;
				if(typeof Lincko.storage.data[i] == 'undefined'){ Lincko.storage.data[i] = {}; }
				if(typeof Lincko.storage.data[i][j] == 'undefined'){ //new
					update_item = true;
					synchro['new'] = 'new';
					synchro[i+'_new'] = i+'_new';
				} else if(partial[i][j]['updated_ms'] != Lincko.storage.data[i][j]['updated_ms']){
					
					//Compare with offline data and update if necessary
					offline_data = {};
					if(
						   typeof Lincko.storage.data[i][j]['offline'] == 'object'
						&& typeof partial[i][j]['updated_json'] == 'object'
						&& !$.isEmptyObject(Lincko.storage.data[i][j]['offline'])
						&& !$.isEmptyObject(partial[i][j]['updated_json'])
					){
						for(var k in Lincko.storage.data[i][j]['offline']){
							if(typeof partial[i][j]['updated_json'][k] == 'number' && partial[i][j]['updated_json'][k] > Lincko.storage.data[i][j]['offline'][k]){
								delete Lincko.storage.data[i][j]['offline'][k];
							} else if(typeof Lincko.storage.data[i][j][k] != 'undefined') {
								offline_data[k] = Lincko.storage.data[i][j][k];
							}
						}
						if($.isEmptyObject(Lincko.storage.data[i][j]['offline'])){
							delete Lincko.storage.data[i][j]['offline'];
						}
					}
					delete partial[i][j]['updated_json'];
					
					update_item = true;
					for(var k in partial[i][j]){
						if(typeof offline_data[k] != 'undefined'){ //Do not overwrite any newer offline update
							partial[i][j][k] = offline_data[k];
							continue;
						}
						if(typeof Lincko.storage.data[i][j][k] == 'undefined' || Lincko.storage.data[i][j][k] != partial[i][j][k]){
							synchro[i+'_'+j+'_'+k] = i+'_'+j+'_'+k;
						}
					}

					//We keep the offline data
					if(typeof Lincko.storage.data[i][j]['offline'] == 'object'){
						partial[i][j]['offline'] = Lincko.storage.data[i][j]['offline'];
					}
				}
				if(update_item){
					update_global = true;
					Lincko.storage.data[i][j] = partial[i][j];
					delete Lincko.storage.data[i][j]['updated_json'];
					synchro['update'] = 'update';
					synchro[i] = i;
					synchro[i+'_'+j] = i+'_'+j;
					storage_local_storage.prepare(i, j);
				}
			}
		}

		//Check the whole schema if we get all elements, we clean the data
		if(info == 'all'){
			for(var i in Lincko.storage.data){
				if(typeof partial[i] == 'undefined'){
					update_global = true;
					synchro['update'] = 'update';
					synchro['delete'] = 'delete';
					synchro[i] = i;
					synchro[i+'_delete'] = i+'_delete';
					storage_local_storage.prepare(i, false);
					delete Lincko.storage.data[i];
				}
				for(var j in Lincko.storage.data[i]){
					if(typeof partial[i][j] == 'undefined'){
						update_global = true;
						synchro['update'] = 'update';
						synchro['delete'] = 'delete';
						synchro[i] = i;
						synchro[i+'_delete'] = i+'_delete';
						synchro[i+'_'+j] = i+'_'+j;
						synchro[i+'_'+j+'_delete'] = i+'_'+j+'_delete';
						delete Lincko.storage.data[i][j];
						storage_local_storage.prepare(i, j);
					}
				}
			}
		}
	}

	//Delete
	if(typeof data.delete == 'object'){
		partial = data.delete;
		for(var i in partial) {
			if(typeof Lincko.storage.data[i] == 'undefined'){
				continue;
			}
			for(var j in partial[i]) {
				update_item = false;
				if(typeof Lincko.storage.data[i][j] != 'undefined'){
					update_item = true;
					delete Lincko.storage.data[i][j];
				}
				if(update_item){
					update_global = true;
					synchro['update'] = 'update';
					synchro['delete'] = 'delete';
					synchro[i] = i;
					synchro[i+'_delete'] = i+'_delete';
					synchro[i+'_'+j] = i+'_'+j;
					synchro[i+'_'+j+'_delete'] = i+'_'+j+'_delete';
					storage_local_storage.prepare(i, j);
				}
			}
		}
	}

	//Reset
	if(typeof data.reset == 'object'){
		partial = data.reset;
		for(var i in partial) {
			if(typeof Lincko.storage.data[i] == 'undefined'){
				continue;
			}
			for(var j in partial[i]) {
				update_item = false;
				if(typeof Lincko.storage.data[i][j] == 'undefined'){
					continue;
				}
				for(var k in partial[i][j]) {
					Lincko.storage.data[i][j][k] = partial[i][j][k];
					if(typeof Lincko.storage.data[i][j]['offline'] == 'object'){
						delete Lincko.storage.data[i][j]['offline'][k];
						update_item = true
						synchro[i+'_'+j+'_'+k] = i+'_'+j+'_'+k;
					}
				}
				if(update_item){
					update_global = true;
					synchro['update'] = 'update';
					synchro[i] = i;
					synchro[i+'_'+j] = i+'_'+j;
					storage_local_storage.prepare(i, j);
				}
			}
		}
	}

	if(update_global){
		Lincko.storage.cleanData();
		app_application_lincko.prepare(synchro);
		setTimeout(function(){
			Lincko.storage.display();
		}, 300);
	}


	//Preload thumbnails/images received
	if(typeof Lincko.storage.data['file'] == 'object'){
		for(var id in Lincko.storage.data['file']) {
			if(typeof storage_preloaded[id] != 'undefined' && storage_preloaded[id]){
				continue;
			}
			if(Lincko.storage.data['file'][id]['category']=="image"){
				var img = new Image();
				img.src = Lincko.storage.getFile(id, 'thumbnail');
				var img = new Image();
				img.src = Lincko.storage.getFile(id, 'link');
			} else if(Lincko.storage.data['file'][id]['category']=="video"){
				var img = new Image();
				img.src = Lincko.storage.getFile(id, 'thumbnail');
			}
			storage_preloaded[id] = true;
		}
	}

	if(storage_first_launch){
		storage_first_launch = false; //Help to trigger some action once the database is downloaded
		app_application_lincko.prepare('first_launch', true);
		setTimeout(function(){
			wrapper_load_progress.move(100);
		}, 200);
	}
	return update_global;
};

//Make sure we don't work with array, it's trouble
Lincko.storage.cleanData = function(){
	for(var category in Lincko.storage.data) {
		if($.type(Lincko.storage.data[category]) == "array"){
			//convert to object
			var obj = {};
			for(var id in Lincko.storage.data[category]) {
				if(Lincko.storage.data[category][id]!=null && $.type(Lincko.storage.data[category]) == "object"){
					obj[id] = Lincko.storage.data[category][id];
				}
			}
			delete Lincko.storage.data[category];
			Lincko.storage.data[category] = {};
			for(var id in obj) {
				Lincko.storage.data[category][id] = obj[id];
			}
		} else {
			for(var id in Lincko.storage.data[category]) {
				if(Lincko.storage.data[category][id]==null){
					delete Lincko.storage.data[category][id];
				}
			}
		}
		if($.isEmptyObject(Lincko.storage.data[category])){
			delete Lincko.storage.data[category];
		}
	}
}

app_application_lincko.add(Lincko.storage.cleanData, "clean_data");

//Help to record local_storage in another thread and with a delay to limit impact on immediate JS updates
var storage_local_storage = {
	data: {},
	timeout: null,
	timing: 6000,

	prepare: function(category, id){
		storage_local_storage.data[category+"_"+id] = [category, id];
		storage_local_storage.timer();
	},
	stop: function(){
		clearTimeout(storage_local_storage.timeout);
		storage_local_storage.timeout = null;
	},
	timer: function(){
		if(storage_local_storage.timeout){
			return false;
		}
		storage_local_storage.timeout = setTimeout(function(){
			if(storage_first_launch){
				storage_local_storage.stop();
				storage_local_storage.timer();
			}
			for(var field in storage_local_storage.data){
				var category = storage_local_storage.data[field][0];
				var id = storage_local_storage.data[field][1];
				if(id){
					var item = Lincko.storage.get(category, id);
					var link = wrapper_localstorage.prefix+'data@'+category+'#'+id;
					if(item){
						wrapper_localstorage.encrypt(link, item);
					} else {
						wrapper_localstorage.encrypt(link, null); //Delete from Local storage
					}
				} else {
					$.each(amplify.store(), function (link) {
						if(link.indexOf(wrapper_localstorage.prefix+"data@"+category)===0){
							wrapper_localstorage.encrypt(link, null);
						}
					});
				}
			}
			storage_local_storage.stop();
			storage_local_storage.timing = 400;
		}, storage_local_storage.timing);
	},

};

//Function update all objects displayed
Lincko.storage.display = function(prepare, force){
	if(typeof prepare == 'undefined'){ prepare  = false; }
	if(typeof force == 'undefined'){ force  = false; }
	if(typeof app_application_lincko != 'undefined'){
		if(force){
			app_application_lincko.prepare(prepare, true); //Update now
		} else {
			app_application_lincko.prepare(prepare); //Wait for timer
		}
		if(force || !storage_first_request){
			setTimeout(function(){
				wrapper_load_progress.move(100);
			}, 100);
		}
		if(!storage_first_request){
			if(app_application_hashtag){
				document.location.hash = app_application_hashtag;
			}
		}
	}
};

Lincko.storage.resetLastVisit = function(){
	Lincko.storage.last_visit_clean = true;
}

//Function that check for latest updates
Lincko.storage.getLastVisit = function(){
	if(Lincko.storage.last_visit_clean){ //Force to redownload all data to get language support
		Lincko.storage.last_visit_clean = false;
		Lincko.storage.last_visit = 0;
	} else {
		var timestamp = 0;
		for(var cat in Lincko.storage.data){
			for(var id in Lincko.storage.data[cat]){
				if(typeof Lincko.storage.data[cat][id]['updated_ms'] == 'number' && Lincko.storage.data[cat][id]['updated_ms'] > timestamp){
					timestamp = Lincko.storage.data[cat][id]['updated_ms'];
				}
			}
		}
		Lincko.storage.last_visit = timestamp;
	}
	return Lincko.storage.last_visit;
};

//Function that check for latest updates
var storage_ajax_latest = {};
Lincko.storage.getting_latest = false;
Lincko.storage.getting_timer = null;
Lincko.storage.getting_waiting = false;
Lincko.storage.getting_timeout = false;
Lincko.storage.getLatest = function(force, callback){
	if(typeof force != 'boolean'){ force = false; }
	var timer = 30000;
	if(force || storage_first_request){
		timer = 0;
	}
	if(force){
		clearTimeout(Lincko.storage.getting_timeout);
		Lincko.storage.getting_waiting = false;
	} else if(Lincko.storage.getting_waiting){
		return false;
	}
	Lincko.storage.getting_waiting = true;
	Lincko.storage.getting_timeout = setTimeout(function(force, callback){
		Lincko.storage.getting_waiting = false;
		var lastvisit_ms = Lincko.storage.getLastVisit();
		if(typeof force == 'boolean' && force == true){
			lastvisit_ms = 0; //Force to get the whole database
		} else {
			force = false;
		}
		if(typeof callback != 'function'){
			callback = null;
		}

		if(!force && Lincko.storage.getting_latest && callback==null){
			return true; //Don't launch anymore latest if in a middle of latest request by update or creation
		} else if(storage_ajax_latest[lastvisit_ms] && storage_ajax_latest[lastvisit_ms]['readyState']!=4 && !force && callback==null){
			return true; //Don't launch anymore latest if one is already running
		}
		
		if(force){
			for(var i in storage_ajax_latest){
				if('abort' in storage_ajax_latest[i]){
					storage_ajax_latest[i].abort();
				}
				storage_ajax_latest[i] = null;
				delete storage_ajax_latest[i];
			}
		}
		var arr = {
			'lastvisit_ms': lastvisit_ms,
		};

		clearTimeout(Lincko.storage.getting_timer);
		//Make sure we clean it every minute to avoid having the getLatest blocked while the mobile phone is idle
		Lincko.storage.getting_timer = setTimeout(function(){
			Lincko.storage.getting_latest = false;
		}, 60000);
		wrapper_sendAction(
			arr,
			'post',
			'api/data/latest',
			 function(msg, err, status, data){
			 	storage_cb_success(msg, err, status, data);
			 	Lincko.storage.firstLatest();
				storage_ajax_latest[lastvisit_ms] = null;
				delete storage_ajax_latest[lastvisit_ms];
			},
			function(xhr_err, ajaxOptions, thrownError){
				//Just keep calling getLatest if timeout
				if(ajaxOptions=="timeout"){
					setTimeout(function(){
						Lincko.storage.getLatest();
					}, 5000);
				} else {
					storage_ajax_latest[lastvisit_ms] = null;
					delete storage_ajax_latest[lastvisit_ms];
				}
			},
			function(jqXHR){
				Lincko.storage.getting_latest = true;
				storage_ajax_latest[lastvisit_ms] = jqXHR;
			},
			function(){
				Lincko.storage.getting_latest = false;
				if(typeof callback == 'function'){
					callback();
				}
			}
		);
	}, timer, force, callback);
};

Lincko.storage.firstLatest = function(){
	if(storage_first_request){
		storage_first_request = false;
		if(!$.isEmptyObject(Lincko.storage.data)){
			Lincko.storage.display(true, true); //I don't think we need to force, probability of mismatching is almost null
		} else {
			//If we cannot get data object, we force to download the whole object
			Lincko.storage.resetLastVisit();
		}
	}
};

/*
	Lincko.storage.get("projects", 5); => get full item
	Lincko.storage.get("tasks", 4); => get full item
	Lincko.storage.get("tasks", 4, "created_at"); => get item attribute
*/
//Return a pointer
Lincko.storage.get = function(category, id, attribute){
	if($.type(Lincko.storage.data) == 'object' && $.type(Lincko.storage.data[category]) == 'object' && $.type(Lincko.storage.data[category][id]) == 'object'){
		var result = Lincko.storage.data[category][id];
		if(typeof attribute == 'string'){
			if(typeof Lincko.storage.data[category][id][attribute] != 'undefined'){
				result = Lincko.storage.data[category][id][attribute];
			} else {
				result = false;
			}
		}
		return result;
	}
	return false;
};

//The clone help to get the item type
Lincko.storage.getClone = function(category, id, attribute){
	var result = Lincko.storage.get(category, id, attribute);
	if(typeof result == 'object'){
		//Clone object to not affect the original object (fastest method)
		var clone = {};
		clone['_type'] = category;
		for(var i in result){
			clone[i] = result[i];
		}
		return clone;
	}
	return false;
}

//Return a pointer
Lincko.storage.getParent = function(category, id, attribute) {
	var parent = false;
	var item = Lincko.storage.get(category, id);
	if(item && item.parent_type && item.parent_id){
		parent = Lincko.storage.get(item.parent_type, item.parent_id, attribute);
	}
	return parent;
};

//The clone help to get the item type
Lincko.storage.getParentClone = function(category, id, attribute){
	var item = Lincko.storage.get(category, id);
	if(item && item.parent_type && item.parent_id){
		result = Lincko.storage.get(item.parent_type, item.parent_id, attribute);
		if(typeof result == 'object'){
			//Clone object to not affect the original object (fastest method)
			var clone = {};
			clone['_type'] = item.parent_type;
			for(var i in result){
				clone[i] = result[i];
			}
			return clone;
		}
	}
	return false;
}

// "include" [default: true] at true it includes the object itself
/*
	"include" [default: true] at true it includes the object itself
	"extend": [default: true] at true it scan the whole hierarchy, at false only the level 1
	Lincko.storage.tree('projects', 5); => All elements that belongs to, and are parent of, the project No5
	Lincko.storage.tree('projects', 5, 'children'); => All elements that belongs to the project No5
	Lincko.storage.tree('projects', 5, 'parents'); => All elements that are parent of the project No5
*/
Lincko.storage.tree = function(category, id, direction, include, extend){
	var results = false;
	var loop;
	var loop_max; //Max nested level
	if(!category || !id){ return results; }
	if(typeof direction !== 'string'){ direction = 'all'; }
	if(direction!='all' && direction!='children' && direction!='parents'){ return results; }
	if(typeof include !== 'boolean'){ include = true; }
	if(typeof extend !== 'boolean'){ extend = true; }
	if(typeof Lincko.storage.data[category] == 'undefined'){ return results; }
	if(typeof Lincko.storage.data[category][id] == 'undefined'){ return results; }

	results = {};

	//Include the object itself
	if(include){
		results[category] = {};
		results[category][id] = true;
	}

	var links = {};
	links[category] = {};
	links[category][id] = true;

	if(direction=='all' || direction=='children'){
		loop = true;
		loop_max = 20;
		while(!$.isEmptyObject(links) && loop_max>0){
			loop_max--;
			var new_links = {};
			for(var i in Lincko.storage.data){
				for(var j in Lincko.storage.data[i]){
					if(
						   (typeof results[i] == 'undefined'
						|| typeof results[i][j] == 'undefined')
						&& typeof Lincko.storage.data[i][j]['parent_type'] != 'undefined'
						&& typeof Lincko.storage.data[i][j]['parent_id'] != 'undefined'
						&& links[ Lincko.storage.data[i][j]['parent_type'] ]
						&& links[ Lincko.storage.data[i][j]['parent_type'] ][ Lincko.storage.data[i][j]['parent_id'] ]
					){
						if(typeof results[i]=='undefined'){
							results[i] = {};
						}
						if(typeof new_links[i]=='undefined'){
							new_links[i] = {};
						}
						results[i][j] = true;
						new_links[i][j] = true;
					}
				}
			}
			links = new_links;
		}
	}
	
	if(direction=='all' || direction=='parents'){
		loop = true;
		loop_max = 20;
		while(loop && loop_max>0){
			loop_max--;
			loop = false;
			if(
				   typeof results[i] == 'undefined'
				&& typeof results[i][j] == 'undefined'
				&& typeof Lincko.storage.data[category][id]['parent_type'] != 'undefined'
				&& typeof Lincko.storage.data[category][id]['parent_id'] != 'undefined'
				&& Lincko.storage.data[ Lincko.storage.data[category][id]['parent_type'] ]
				&& Lincko.storage.data[ Lincko.storage.data[category][id]['parent_type'] ][ Lincko.storage.data[category][id]['parent_id'] ]
			){
				category = Lincko.storage.data[category][id]['parent_type'];
				id = Lincko.storage.data[category][id]['parent_id'];
				if(typeof results[category]=='undefined'){
					results[category] = {};
				}
				results[category][id] = true;
				loop = true;
			}
		}
	}

	if($.isEmptyObject(results)){
		results = false;
	}

	return results;
}

/*
	Lincko.storage.list(); => List all tasks, order from newest to oldest
	Lincko.storage.list(null, 5, { created_by: 3, }, 'projects', 3, true); => List all kind of element belonging to Project No3 and created by the User 3, and includes nested elements, limited the the 5 newest elements
	Lincko.storage.list('tasks', '5-10'); => pagination from the 5th to the 10th Task element
	Lincko.storage.list(null, -1, null, null, null, false); => Default value, it list everything
	Lincko.storage.list('tasks', -1, { created_at: ['>', 123456789], }); => Return all tasks which have been created after a timestamp, the array condition object can be design for all kind of attribute

	Lincko.storage.list('comments', -1, null, 'projects', 3, true);
	Lincko.storage.list('comments', -1, null, 'projects', 3, false);
	Lincko.storage.list(null, 10, null, 'projects', 3, true);
	Lincko.storage.list(null, '5-10', null, 'projects', 3, true);
	Lincko.storage.list('tasks', -1, null, 'projects', 3);
	Lincko.storage.list('tasks', -1, {created_by: 3}, 'projects', 3);
	Lincko.storage.list('tasks', -1, [{created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.list('tasks', -1, [{created_by: 3}, {created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3);
	Lincko.storage.list('tasks', '2-5', [{created_by: 3}, {created_at: ['<', 1449451377]}, {created_at: ['>', 1449107022]}], 'projects', 3, false);
*/
Lincko.storage.list = function(category, page_end, conditions, parent_type, parent_id, children, deleted){
	var temp;
	var attribute;
	var only_items = false;
	var results = [];
	var page_start = 1;
	var pagination = null;
	if(typeof category != 'string'){ category = null; }
	if(typeof page_end == 'undefined'){ page_end = null; }
	if($.type(conditions) == 'object'){ conditions = [conditions]; }
	if($.type(conditions) != 'array'){ conditions = []; }
	if(typeof parent_type != 'string'){ parent_type = null; }
	if(typeof parent_id != 'number'){ parent_id = null; }
	if(typeof children != 'boolean'){ children = false; }
	if(typeof deleted != 'boolean'){ deleted = false; } //By default, exclude deleted items

	if(parent_type!=null || parent_id!=null){
		if(children){
			only_items = Lincko.storage.tree(parent_type, parent_id, 'children');
		} else {
			only_items = Lincko.storage.tree(parent_type, parent_id, 'children', true, false);
		}
		if(category){
			if(typeof only_items[category] != 'undefined'){
				temp = only_items[category];
				only_items = {};
				only_items[category] = temp;
			} else {
				only_items = {};
			}
		}
		if(!only_items){ //Must return an empty object to be sure we reject all
			only_items = {};
		}
	}
	
	if($.isNumeric(page_end)){
		page_end = parseInt(page_end, 10);
		if(page_end<0){
			page_end = -1;
		}
	} else if(typeof page_end == 'string'){
		pagination = page_end.match(/(\d+)-(\d+)/);
		if($.type(pagination) == 'array'){
			page_start = parseInt(pagination[1], 10);
			page_end = parseInt(pagination[2], 10);
			if(page_end < page_start){
				return results;
			}
		} else {
			return results;
		}
	}

	var items;
	var item;
	var parent;
	var save = false;
	var condition_alert = false;
	var array_items = [];
	
	for(var cat in Lincko.storage.data){
		if(only_items && typeof only_items[cat]=='undefined'){
			continue;
		}
		if((category==null || cat==category) && cat.indexOf('_')!==0){
			items = Lincko.storage.data[cat];
			for(var id in items) {
				save = true;
				if(only_items && typeof only_items[cat][id]=='undefined'){
					save = false;
					continue;
				}
				if(!deleted){ //If at false we exclude deleted items
					if(typeof items[id]['deleted_at'] != 'undefined' && $.isNumeric(items[id]['deleted_at'])){
						save = false;
						continue;
					}
				}
				//Clone object to not affect the original object (fastest method)
				item = {};
				for(var i in items[id]){
					item[i] = items[id][i];
				}
				//Add info to element, use "_" to recognize that it has been added by JS
				item['_type'] = cat;
				save = true;
				for(var i in conditions) {
					save = true;
					for(var att in conditions[i]) { //And condition
						if(typeof item[att] != 'undefined'){
							attribute = att;
						} else {
							save = false;
							break;
						}
						if(save){
							if($.type(conditions[i][att]) == 'array' && conditions[i][att].length==2){
								save = false;
								if(conditions[i][att][0] == "<" && item[attribute] < conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == "<=" && item[attribute] <= conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == "==" && item[attribute] == conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == "!=" && item[attribute] != conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == ">=" && item[attribute] >= conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == ">" && item[attribute] > conditions[i][att][1]){
									save = true;
								} else if(conditions[i][att][0] == "in" && $.inArray(item[attribute], conditions[i][att][1]) >= 0){ //Conditions must be an array
									save = true;
								} else if(conditions[i][att][0] == "!in" && $.inArray(item[attribute], conditions[i][att][1]) < 0){ //Conditions must be an array
									save = true;
								}
								if(!save){
									break;
								}
							} else if(item[attribute]!=conditions[i][att]){
								save = false;
								break;
							} 
						}
					}
					if(save){ //Or condition
						break;
					}
				}
				if(save){
					array_items.push(item);
				}
			}
		}
	}

	if(wrapper_show_error && condition_alert){
		console.log(conditions);
		console.log('The parameters requested have an issue.');
	}

	if(array_items.length>0){
		results = Lincko.storage.sort_items(array_items, 'created_at', page_start, page_end, false); //From newest (big timestamp) to oldest (small timestamp)
	}
	return results;
	
};

Lincko.storage.generateMyQRcode = function(){
	var user = Lincko.storage.get('user', wrapper_localstorage.user_id);
	if(user){
		var url = top.location.protocol+'//'+document.domain+"/api/file/myqrcode/";
		var md5 = user['md5'];
		var id = user['id'];
		var created_at = user['created_at'];
		var name = wrapper_to_url(user['username']);
		if(name==''){ name = 'me'; }
		
		return url+md5+"/"+id+"/"+name+".png?"+created_at;
	}
	return false;
}

Lincko.storage.getFile = function(id, type){
	var file = Lincko.storage.get('file', id);
	if(file){
		if(typeof type != 'string'){
			type = 'link';
		} else if(type!='link' && type!='download' && type!='thumbnail'){
			type = 'link';
		}
		//Must use updated_ms in case we change its orientation
		var updated_ms = file['updated_ms'];
		if(type=='download'){
			//We need to go through PHP to force the download header
			var md5 = file['md5'];
			var id = file['id'];
			var url = top.location.protocol+'//'+document.domain+"/api/file/";
			var title = wrapper_to_url(file['title']);
			if(title==''){ title = 'file'; }
			return url+type+"/"+md5+"/"+id+"/"+title+"?"+updated_ms;
		} else if(type=='thumbnail'){
			//It's a direct link to cache the file on disk
			var uploaded_by = file['uploaded_by'];
			var link = file['link'];
			var ext = file['thu_ext'];
			var url = top.location.protocol+'//'+document.domain+"/files/";
			return url+uploaded_by+"/thumbnail/"+link+"."+ext+"?"+updated_ms;
		} else {
			//It's a direct link to cache the file on disk
			var uploaded_by = file['uploaded_by'];
			var link = file['link'];
			var ext = file['ori_ext'];
			var url = top.location.protocol+'//'+document.domain+"/files/";
			return url+uploaded_by+"/"+link+"."+ext+"?"+updated_ms;
		}
	}
	return false;
}

Lincko.storage.getURLShorcut = function(type, id){
	if(Lincko.storage.get(type, id)){
		return top.location.protocol+'//'+document.domain+'/app#'+type+'-'+id;
	}
	return false;
}

Lincko.storage.geHash = function(type, id){
	if(Lincko.storage.get(type, id)){
		return '#'+type+'-'+id;
	}
	return '';
}


Lincko.storage.getProfile = function(user_id){
	var headimgurl = Lincko.storage.get('user', user_id, 'headimgurl');
	if(headimgurl){
		return headimgurl;
	}
	return app_application_icon_single_user.src;
}

Lincko.storage.getURL = function(id, type){
	if(typeof type == 'undefined' || (type!='question' && type!='answer')){ type = 'question'; }
	var question = Lincko.storage.get('question', id);
	if(question){
		return top.location.protocol+'//'+document.domain+"/ppt/"+type+"/"+wrapper_integer_map(question['id']);
	}
	return false;
}

/*
	Sort items by an attribute, reject items that doesn't have the attribute
	"array_items": must in the format array_items[]
*/
Lincko.storage.sort_items = function(array_items, att, page_start, page_end, ascendant){
	var results = [];
	var temp = {};
	var item;
	var value;
	var save = false;
	var type = "number";
	
	if(typeof page_start == 'undefined'){ page_start = 0 }
	if(typeof page_end == 'undefined'){ page_end = -1 }
	if(typeof ascendant != 'boolean'){ ascendant = true; }
	
	if(page_end==0){
		return results;
	} else if(page_end<0){
		page_start = 0;
		page_end = -1;
	}
	page_start = page_start-1; //Because we start from 1st, not 0
	page_end = page_end-1; //Because we start from 1st, not 0
	if(page_end < page_start){
		page_start = 0;
		page_end = -1;
	}

	for(var i in array_items){
		item = array_items[i];
		save = false;
		if(typeof item[att] != 'undefined'){
			save = true;
			value = item[att];
		} else {
			//ATTENTION: this does not keep any item that do not have this attribute
			continue;
		}
		if(save){
			if(typeof value != 'number'){
				var type = "string";
			}
			if(typeof value == 'boolean'){
				value = value ? 1 : 0;
			} else if(!value){
				value = 0;
			} else {
				value = value.toString();
				if(!value){
					value = 0;
				}
			}
			value = value.toString().toLowerCase();
			if(typeof temp[value] == 'undefined'){ temp[value] = [];}
			temp[value].push(item);
		}
	}
	
	pagination = 0;
	if(!$.isEmptyObject(temp)){
		if(ascendant){
			//Sort by key value (attribute), Object.keys gets only an array of the keys, sort() sorts the array from small to big
			var desc_att = Object.keys(temp).sort(function(a, b) {
				if(type=="string"){
					return a.localeCompare(b);
				} else {
					return a - b;
				}
			});
		} else {
			//Sort by key value (attribute), Object.keys gets only an array of the keys, sort() sorts the array from big to small
			var desc_att = Object.keys(temp).sort(function(a, b) {
				if(type=="string"){
					return b.localeCompare(a);
				} else {
					return b - a;
				}
			});
		}
		
		var asc_id;
		var item_id;
		//Pagination
		for(var i in desc_att){
			attribute = desc_att[i];
			
			//Sort IDs from smallest to bigger
			asc_id = Object.keys(temp[attribute]).sort(function(a, b) {
				return a - b;
			});
			for(var j in asc_id){
				item_id = asc_id[j];
				if(pagination >= page_start){
					results.push(temp[attribute][item_id]);
				}
				pagination++;
				if(page_end >= page_start && page_start+pagination > page_end){
					break;
				}
			}
			if(page_end >= page_start && page_start+pagination > page_end){
				break;
			}
			
		}
		
	}
	return results;
}



//setup a check timing procedure to not overload the backend server
var storage_check_timing_interval;
var storage_check_timing_timeout;
var storage_check_timing_speed = 1; //Default = 1, higher if faster
var storage_check_timing = {

	slow: Math.floor(600000/storage_check_timing_speed), //10min
	medium: Math.floor(120000/storage_check_timing_speed), //2min
	fast: Math.floor(60000/storage_check_timing_speed), //1min
	real: Math.floor(15000/storage_check_timing_speed), //15s

	timeout: 60000, //60s (how long do we have to wait before entering into idle mode)
	current: Math.floor(120000/storage_check_timing_speed), //2min

	set: function(time, clear, now, timer){
		if(typeof clear !== 'boolean'){ clear = false; }
		if(typeof now !== 'boolean'){ now = false; }
		if(typeof timer !== 'boolean'){ timer = false; }
		if(now){
			setTimeout(function(){
				Lincko.storage.getLatest();
			}, 3000); //In case we do send an action, there will be no flashing
		}
		if(clear || storage_check_timing.current != time){
			storage_check_timing.current = time;
			storage_check_timing.launch();
		}
		if(timer){
			clearTimeout(storage_check_timing_timeout);
			storage_check_timing_timeout = setTimeout(function(){
				storage_check_timing.set(storage_check_timing.medium, true);
			}, storage_check_timing.timeout);
		}
		storage_check_timing.current = time;
	},

	launch: function(){
		clearTimeout(storage_check_timing_timeout);
		clearInterval(storage_check_timing_interval);
		storage_check_timing_interval = setInterval(function(){
			Lincko.storage.getLatest();
		}, storage_check_timing.current);
	},
};

$(window).on({
	blur:		function(){ storage_check_timing.set(storage_check_timing.slow, false, false); },
	focus:		function(){ storage_check_timing.set(storage_check_timing.medium, true, true); },
	keyup:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	change:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	copy:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	paste:		function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
	mousedown:	function(){ storage_check_timing.set(storage_check_timing.fast, false, false, true); },
});

JSfiles.finish(function(){
	wrapper_load_progress.move(60);
	Lincko.storage.resetLastVisit(); //We force tp get all data each time we open the application

	$.each(amplify.store(), function (storeKey) {
		if(storeKey.indexOf(wrapper_localstorage.prefix+"data@")===0){
			var field = storeKey.substring((wrapper_localstorage.prefix+"data@").length);
			if(field.indexOf('#')>0){
				var match = field.split("#");
				if(match.length==2){
					category = match[0];
					id = match[1];
					var decrypt = wrapper_localstorage.decrypt(storeKey);
					if(decrypt){
						if(typeof Lincko.storage.data[category] == "undefined"){
							Lincko.storage.data[category] = {};
						}
						Lincko.storage.data[category][id] = decrypt;
					}
				}
			}
		}
	});
	Lincko.storage.cleanData();

	wrapper_load_progress.move(70);

	if(!$.isEmptyObject(Lincko.storage.data)){
		wrapper_load_progress.move(90);
		storage_first_launch = false;
		app_application_lincko.prepare('first_launch');
		Lincko.storage.display(true, true);
	}

	Lincko.storage.getLatest(false, function(){
		Lincko.storage.offlineCheck();
	});
	//Launch the time interval for back server data check
	storage_check_timing.launch();

}, 10);
