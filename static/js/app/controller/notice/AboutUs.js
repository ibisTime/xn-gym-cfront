define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, weixin, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getUserSysConfig("aboutus")
			.then(function(data){
                weixin.initShare({
                    title: document.title,
                    desc: base.clearTag(data.note),
                    link: location.href,
                    imgUrl: base.getShareImg()
                });
                base.hideLoading();
			 	$("#description").html(data.note);
			});
	}
})
