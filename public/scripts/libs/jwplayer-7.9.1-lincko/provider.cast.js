webpackJsonpjwplayer([3],{69:function(e,t,n){var a,i;a=[n(74),n(171),n(170),n(169),n(4),n(5),n(2),n(1)],i=function(e,t,n,a,i,r,o,s){var c=a.loadApi();return function(e,a){function u(){a.set("castState",{available:!1,active:!1,deviceName:""}),L=new t,L.on("castState",y),L.on("mediaUpdate",E),L.on("setPlaylist",v),L.updateCastState();var e=a.chooseProvider;a.chooseProvider=function(t){return a.get("castActive")?n:e(t)}}function d(){}function l(){return a.getVideo()}function m(){a.changeVideoProvider(n),C=l(),C.setService(L)}function v(){a.set("state",r.BUFFERING),L.setPlaylist(a);var e=a.get("playlistItem");C.updateScreen("Connecting",e.image)}function g(){var t,n=a.get("castClicked")&&!L.getPlayerId();n&&L.setPlayerId(a.get("id")),I()&&(e.setFullscreen(!1),m(),L.addListeners(),t=L.getMedia(),t?L.loaded(t):v(),a.on("change:playlist",v))}function p(){var t=a.get("state"),n=t===r.COMPLETE,o=t===r.IDLE,c=t===r.ERROR,u=a.get("item"),d=a.get("playlist"),l=a.get("playlistItem");L.removeListeners(),C&&C.remove(),l&&c?(l=d[u+1],void 0===l?n=!0:(a.set("item",u+1),a.set("playlistItem",l))):l&&!n&&(l=s.extend({},l),l.starttime=l.start=a.get("position")||0),a.set("castActive",!1),a.set("castClicked",!1),a.resetProvider(),a.setProvider(l),a.off("change:playlist",v),l&&(n?(a.stopVideo(),e.trigger(i.JWPLAYER_PLAYLIST_COMPLETE,{})):o||a.loadVideo(l))}function f(e){e?g():C&&p()}function E(e){var t=e.field,n=e.value;if(C){"media"===t&&S(n);var a=C.castEventHandlers[t];a&&a(n)}}function S(e){var t,n=a.get("playlist");if(e.media){t=e.media.metadata;var i=n[t.index];s.isNumber(t.index)&&t.index!==a.get("item")&&(a.set("item",t.index),a.set("playlistItem",i),a.trigger("itemReady",i));var r=a.get("castState").deviceName,o=r?"Casting to "+r:"";C.updateScreen(o,i.image)}}function y(e){var t=a.get("castActive"),n=e.active;t!==n&&f(n),n=n&&I(),a.set("castAvailable",e.available),a.set("castActive",n),a.set("castState",{available:e.available,active:n,deviceName:e.deviceName})}function I(){return L.getPlayerId()===a.get("id")}var L,C=null;c.then(u,d),this.castToggle=o.noop}}.apply(t,a),!(void 0!==i&&(e.exports=i))},81:function(e,t,n){var a=n(8);e.exports=(a["default"]||a).template({compiler:[7,">= 4.0.0"],main:function(e,t,n,a,i){return'<div class="jw-cast jw-reset jw-preview">\n  <div class="jw-cast-container">\n    <div class="jw-cast-text jw-reset">\n      '+e.escapeExpression(e.lambda(null!=t?t.message:t,t))+"\n    </div>\n  </div>\n</div>\n"},useData:!0})},169:function(e,t,n){var a,i;a=[n(4),n(15),n(3),n(1)],i=function(e,t,n,a){function i(){return o?s:s=new Promise(function(n,a){var i="__onGCastApiAvailable";o=new t(c),o.addEventListener(e.ERROR,r),o.load(),window[i]=function(e){e?n(e):a()}})}function r(){o.resetEventListeners(),o=null}var o,s,c="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1",u=a.extend({loadApi:i},n);return u}.apply(t,a),!(void 0!==i&&(e.exports=i))},170:function(e,t,n){var a,i;a=[n(2),n(81),n(4),n(3),n(5),n(12),n(1)],i=function(e,t,n,a,i,r,o){function s(n,a){var i=e.createElement(t({message:n}));return a&&(i.style.backgroundImage='url("'+a+'")'),i}var c=function(){var t,c,u=this;o.extend(u,a),u.setState=function(e){return r.setState.call(this,e)},u.destroy=function(){clearInterval(u.timeInterval)},u.supportsFullscreen=function(){return!1},u.setService=function(e){c=e,u._castingScreen=u.updateScreen()},u.setup=function(e){u.setState(i.BUFFERING),u.sendCommand("setup",e)},u.init=function(e){u.sendCommand("item",e)},u.load=function(e){u.init(e),u.play()},u.play=function(){u.sendCommand("play")},u.pause=function(){u.sendCommand("pause")},u.seek=function(e){u.trigger(n.JWPLAYER_MEDIA_SEEK,{position:u.getRemote("currentTime"),offset:e}),u.sendCommand("seek",e,function(){u.trigger(n.JWPLAYER_MEDIA_SEEKED)})},u.next=function(e){u.sendCommand("next",e)},u.volume=function(e){u.sendCommand("volume",e)},u.mute=function(e){u.sendCommand("mute",e)},u.sendCommand=function(e){if(c){var t=Array.prototype.slice.call(arguments,1);c[e]&&c[e].apply(c,t)}},u.getRemote=function(e){if(c){var t=c.getMedia();return t?"currentTime"===e?t.getEstimatedTime():t[e]||t.media&&t.media[e]:null}},u.updateScreen=function(e,n){t.innerHTML=s(e,n).outerHTML},u.setContainer=function(e){t=e,u._castingScreen&&e.appendChild(u._castingScreen)},u.getContainer=function(){return t},u.remove=function(){clearInterval(u.timeInterval),u._castingScreen&&t===u._castingScreen.parentNode&&t.removeChild(u._castingScreen),u._castingScreen=null},u.getDuration=function(){return u.getRemote("duration")||1/0},u.stop=u.setControls=u.setCurrentQuality=u.resize=u.seekDrag=u.setVisibility=e.noop,u.setFullScreen=u.getFullScreen=u.checkComplete=o.constant(!1),u.getCurrentQuality=o.constant(0),u.getQualityLevels=o.constant(["Auto"]),u.castEventHandlers={media:function(e){var t=u.getRemote("items"),n="IDLE"===e.playerState&&"FINISHED"===e.idleReason,a="IDLE"===e.playerState&&"ERROR"===e.idleReason,i=n&&!t;u.castEventHandlers.playerState(i?"complete":e.playerState),u.castEventHandlers.currentTime(),clearInterval(u.timeInterval),"PLAYING"===e.playerState?u.timeInterval=setInterval(u.castEventHandlers.currentTime,100):i?(u.setState("complete"),c.disconnect()):a&&(u.setState("error"),c.disconnect())},volume:function(e){u.trigger("volume",{volume:Math.round(100*e.volume)}),u.trigger("mute",{mute:e.isMute})},playerState:function(e){if(e&&i[e.toUpperCase()]){var t=e.toLowerCase();t!==i.IDLE&&t!==i.BUFFERING||u.trigger(n.JWPLAYER_MEDIA_BUFFER,{bufferPercent:0,position:u.getRemote("currentTime"),duration:u.getDuration()}),u.setState(t)}},currentTime:function(){u.trigger(n.JWPLAYER_MEDIA_TIME,{position:u.getRemote("currentTime"),duration:u.getDuration()})},duration:function(){u.trigger(n.JWPLAYER_MEDIA_TIME,{position:u.getRemote("currentTime"),duration:u.getDuration()})},isPaused:function(e){e?u.setState(i.PAUSED):u.setState(i.PLAYING)}}};return c.prototype={getName:function(){return{name:"chromecast"}}},c}.apply(t,a),!(void 0!==i&&(e.exports=i))},171:function(e,t,n){var a,i;a=[n(3),n(2),n(1)],i=function(e,t,n){return function(){function t(e,t){var r=n.find(e.allSources,function(e){return!n.size(e.mediaTypes)||!n.contains(e.mediaTypes,'video/webm; codecs="vp9"')});if(r){var o=i(r.type),c=a(r.file),u=a(e.image),l=new d.MediaInfo(c,o);return l.metadata=new d.GenericMediaMetadata,l.metadata.title=e.title,l.metadata.subtitle=e.subtitle,l.metadata.images=[{url:u}],l.metadata.index=t||0,l.metadata.playerId=s.getPlayerId(),l}}function a(e){var t=document.createElement("a");return t.href=e,t.href}function i(e){switch(e){case"mp4":case"webm":return"video/"+e;case"mpd":case"dash":return"application/dash+xml";case"m3u8":case"hls":return"application/x-mpegURL";case"aac":return"audio/x-aac";case"mp3":return"audio/mpeg";default:return e}}function r(){var e=m.getCastState()!==l.NO_DEVICES_AVAILABLE,t="";v=m.getCurrentSession(),v&&(t=v.getCastDevice().friendlyName||t),s.trigger("castState",{available:e,active:!!v,deviceName:t})}function o(){var e=s.getMedia();e&&s.trigger("mediaUpdate",{field:"media",value:e})}var s=this,c=window.chrome,u=c.cast,d=u.media,l=window.cast.framework,m=l.CastContext.getInstance(),v=null,g=l.CastContextEventType.CAST_STATE_CHANGED;n.extend(s,e),m.removeEventListener(g,r),m.addEventListener(g,r),m.setOptions({receiverApplicationId:d.DEFAULT_MEDIA_RECEIVER_APP_ID,autoJoinPolicy:u.AutoJoinPolicy.ORIGIN_SCOPED}),s.updateCastState=r,s.setPlaylist=function(e){var a,i,r,o=e.get("playlist"),u=e.get("item"),l=e.get("position"),m=e.get("repeat");"complete"===e.get("state")&&(u=0),i=n.reduce(o,function(e,n,a){var i,r=t(n,a);return r&&(i=new d.QueueItem(r),r.metadata.index===u&&(i.startTime=l),e.push(i)),e},[]),a=new d.QueueLoadRequest(i),a.startIndex=u,m&&(a.repeatMode=c.cast.media.RepeatMode.ALL),r=v.getSessionObj(),r.queueLoad(a,s.loaded,s.error)},s.getPlayerId=function(){var e,t,n=s.getMedia();return n&&n.media?(e=n.media.metadata,e.playerId):v?(t=v.getSessionObj(),t.playerId):null},s.setPlayerId=function(e){var t;v&&(t=v.getSessionObj(),t.playerId=e)},s.loaded=function(e){s.trigger("mediaUpdate",{field:"volume",value:{volume:v.getVolume(),isMute:v.isMute()}}),e.addUpdateListener(o)},s.addListeners=function(){var e;return v?(e=v.getSessionObj(),e.addUpdateListener(r),void v.addEventListener(l.SessionEventType.VOLUME_CHANGED,function(e){s.trigger("mediaUpdate",{field:"volume",value:e})})):null},s.removeListeners=function(){var e;return v?(e=v.getSessionObj(),e.removeUpdateListener(r),e.media.forEach(function(e,t){t.removeUpdateListener(o)}),void v.removeEventListener(u.framework.SessionEventType.VOLUME_CHANGED)):null},s.getMedia=function(){if(v){var e=v.getSessionObj(),t=e.media;if(t&&t.length)return t[0]}return null},s.error=function(e){console.error("Error:",e),s.disconnect()},s.item=function(e){var a=s.getMedia();if(!a)return void s.trigger("setPlaylist");var i=t(e),r=n.find(a.items,function(e){return e.media.contentId===i.contentId&&e.media.index===i.index});r?a.queueJumpToItem(r.itemId):s.trigger("setPlaylist")},s.play=function(){var e=s.getMedia();e&&s.getMedia().play()},s.pause=function(){s.getMedia().pause()},s.next=function(){s.getMedia().queueNext()},s.disconnect=function(){v.endSession(!0)},s.seek=function(e,t){var n=new d.SeekRequest;n.currentTime=e,n.resumeState=d.ResumeState.PLAYBACK_START,s.getMedia().seek(n,t)},s.mute=function(e){v.setMute(e)},s.volume=function(e){v.setVolume(e/100)}}}.apply(t,a),!(void 0!==i&&(e.exports=i))}});