define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/ActivityCtr',
    'app/util/handlebarsHelpers',
    'swiper'
], function(base, weixin, ActivityCtr, Handlebars, Swiper) {
    var code = base.getUrlParam("code");
    init();
    function init() {
        base.showLoading();
		getActivity();
        addListener();
    }
    function getActivity() {
        ActivityCtr.getActivity(code)
            .then((data) => {
                base.hideLoading();
                weixin.initShare({
                    title: document.title,
                    desc: data.slogan,
                    link: location.href,
                    imgUrl: base.getShareImg(data.advPic)
                });
                addBanner(data);
                $("#title").text(data.title);
                $("#slogan").text(data.slogan);
                $("#contact")
                    .html(`<a href="tel://${data.contact}" class="course-tel am-flexbox-item">
                                <span>${data.contact}</span>
                            </a>
                            <i class="right-arrow"></i>`);
                $("#description").html(data.description);
                $("#datetime").text(base.formatDate(data.startDatetime, "yyyy-MM-dd hh:mm") + " ~ " +
                    base.formatDate(data.endDatetime, "yyyy-MM-dd hh:mm"));
                $("#amount").text(base.formatMoney(data.amount));
            });
    }
    function addBanner(data) {
        var html = "";
        var advPic = data.advPic.split("||");
        advPic.forEach(function(pic){
            html += `<div class="swiper-slide"><img class="wp100 hp100" src="${base.getImg(pic)}"></div>`;
        });
        if(advPic.length <= 1){
            $(".swiper-pagination").addClass("hidden");
        }
        $("#top-swiper").html(html);
        new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': advPic.length > 1,
            'autoplay': 4000,
            'autoplayDisableOnInteraction': false,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
    }
    function addListener() {
        $("#buyBtn").on("click", function() {
            location.href = "./activity-confirm.html?code=" + code;
        });
    }
});
