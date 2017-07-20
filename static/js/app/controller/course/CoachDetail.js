define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/CoachCtr',
    'app/interface/GeneralCtr',
    'swiper'
], function(base, weixin, CoachCtr, GeneralCtr, Swiper) {
    var code = base.getUrlParam("code"),
        genderList = {
            "0": "女",
            "1": "男"
        };
    var count = 2, labelList = {}, labels;

    init();
    function init(){
        addListener();
        base.showLoading();
        $.when(
            getCoach(),
            getLabelList(),
            getPageComment()
        ).then(base.hideLoading);
    }
    // 获取标签数据字典
    function getLabelList() {
        return GeneralCtr.getDictList("label_kind")
            .then((data) => {
                data.forEach((label) => {
                    labelList[label.dkey] = label.dvalue;
                });
                if(!--count) {
                    addLabelData();
                }
            });
    }
    // 当label的数据字典 和 coach 的数据都获取到了之后，再把值添加到页面中
    function addLabelData(list) {
        var labelHtml = "";
        labels.forEach((label, index) => {
            labelHtml += `<span class="hot-tip hot-tip${index % 3}">${labelList[label]}</span>`;
        });
        $("#hotTips").html(labelHtml);
    }
    // 获取私教详情
    function getCoach() {
        return CoachCtr.getCoach(code)
            .then((data) => {
                addBanner(data);
                $("#gender").text(genderList[data.gender]);
                var star = +data.star,
                    _hotStars = $("#hotStars").find(".hot-star");
                while(star--) {
                    _hotStars.eq(star).addClass("active")
                }
                $("#realName").html(data.realName);
                $("#description").html(data.description);
                labels = data.label.split("||");
                if(!--count) {
                    addLabelData();
                }
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

    // 分页查询课程的评价
    function getPageComment() {
        return CoachCtr.getPageComment({
            coachCode: code,
            start: 1,
            limit: 10
        }).then((data) => {

        });
    }

    function addListener() {
        $("#buy").click(function() {
            location.href = "./coach-confirm.html?code=" + code;
        });
    }
});
