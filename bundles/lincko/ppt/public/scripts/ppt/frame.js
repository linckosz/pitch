var ppt_frame_qrcode_refresh = function(){
	$("#ppt_frame_right_top")
			.css('visibility', 'visible')
			.css("background-image", "url('"+ppt_frame_right_top_src()+"')");
};

$(function() {
	setTimeout(ppt_frame_qrcode_refresh, 100);
	setInterval(ppt_frame_qrcode_refresh, 3600*1000); //Rfersh every hour
});
