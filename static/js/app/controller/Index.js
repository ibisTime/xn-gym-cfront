define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/interface/CoachCtr',
    'app/interface/ActivityCtr',
    'swiper',
    'app/util/handlebarsHelpers'
], function(base, Foot, weixin, GeneralCtr, CoachCtr, ActivityCtr, Swiper, Handlebars) {
    init();
    function init(){
        Foot.addFoot(0);
        base.showLoading();
    	$.when(
    		getBanner(),
    		getNotice(),
            getPageCoach(),
            getPageActivities()
    	).then(base.hideLoading);
    	addListener();
        // weixin.initShare({
        //     title: document.title,
        //     desc: document.title,
        //     link: location.href,
        //     imgUrl: base.getShareImg()
        // });
    }

    function addListener(){

        $("#swiper-container").on("touchstart", ".swiper-slide img", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper-container").on("touchend", ".swiper-slide img", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                }

            }
        });
    }
    // 分页查询私教
    function getPageCoach(refresh) {
        return CoachCtr.getPageCoach({
            start: 1,
            limit: 10
        }, refresh).then((data) => {
            console.log(data);
        })
    }
    // 分页查询活动
    function getPageActivities(refresh) {
        var _tmpl = __inline('../ui/index_activity.handlebars');
        return ActivityCtr.getPageActivities({
            start: 1,
            limit: 10
        }, refresh).then((data) => {
            if(data.list.length) {
                $("#actContent").html(_tmpl({items: data.list}));
            } else {
                $("#actContent").html('<div class="no-data">暂无活动</div>')
            }
        });
    }

    //banner图
    function getBanner(){
        return GeneralCtr.getBanner()
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic, 1)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#top-swiper").html(html);
                    new Swiper('#swiper-container', {
                        'direction': 'horizontal',
                        'loop': true,
                        'autoplay': 4000,
    		            'autoplayDisableOnInteraction': false,
                        // 如果需要分页器
                        'pagination': '.swiper-pagination'
                    });
                }
            });
    }

    //公告
    function getNotice(){
    	return GeneralCtr.getPageSysNotice(1, 1)
            .then(function(data){
    			if(data.list.length){
    				$("#noticeWrap").html(`
                        <a href="../notice/notice.html" class="am-flexbox am-flexbox-justify-between">
                            <div class="am-flexbox am-flexbox-item">
                                <img src="/static/images/notice.png" alt="">
                                <span class="am-flexbox-item t-3dot">${data.list[0].smsTitle}</span>
                            </div>
                            <i class="right-arrow"></i>
                        </a>`).removeClass("hidden");
    			}
        	});
    }
});
