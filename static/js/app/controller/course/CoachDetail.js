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
        getCoachRating();
    }
    // 查询私教的评分
    function getCoachRating() {
        CoachCtr.getCoachRating(code)
            .then((data) => {
                data = +data;
                var _stars = $("#stars"),
                    _star = _stars.find(".hot-star"),
                    _span = _stars.find("span");
                _span.text(data + "分");
                data = Math.floor(data);
                while(data--) {
                    _star.eq(data).addClass("active");
                }
            })
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
                weixin.initShare({
                    title: document.title,
                    desc: base.clearTag(data.description),
                    link: location.href,
                    imgUrl: base.getShareImg(data.advPic)
                });
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

    // 分页查询私教的评价
    function getPageComment() {
        return CoachCtr.getPageComment({
            coachCode: code,
            start: 1,
            limit: 10
        }).then((data) => {
            $("#sumCom").text(data.totalCount);
            var html = "";
            data.list.forEach((item) => {
                html += buildComment(item);
            });
            $("#ratings").html(html);
        });
    }

    // 生成评论的html
    function buildComment(item) {
        var star = Math.floor(+item.score), remainStar = 5 - star,
            starHtml = "";
        while(star--) {
            starHtml += '<i class="hot-star active"></i>';
        }
        while(remainStar--) {
            starHtml += '<i class="hot-star"></i>';
        }
        return `<div class="comment-item">
                    <div class="commer-info am-flexbox">
                        <div class="commer-avatar">
                            <img src="${base.getAvatar(item.photo)}"/>
                        </div>
                        <div class="commer-ext">
                            <h1>${item.commerRealName}</h1>
                            <div class="hot-stars">
                                ${starHtml}
                                <span>${base.formatDate(item.commentDatetime, "yyyy-MM-dd")}</span>
                            </div>
                        </div>
                    </div>
                    <div class="comment-cont">${item.content}</div>
                </div>`;
    }

    function addListener() {
        // $("#top-swiper").on("touchstart", ".swiper-slide img", function (e) {
        //     var touches = e.originalEvent.targetTouches[0],
        //         me = $(this);
        //     me.data("x", touches.clientX);
        // });
        // $("#top-swiper").on("touchend", ".swiper-slide img", function (e) {
        //     var me = $(this),
        //         touches = e.originalEvent.changedTouches[0],
        //         ex = touches.clientX,
        //         xx = parseInt(me.data("x")) - ex;
        //     if(Math.abs(xx) < 6){
        //
        //     }
        // });
        $("#buy").click(function() {
            location.href = "./coach-confirm.html?code=" + code;
        });
        $("#goComment").click(function() {
            location.href = "../notice/comments.html?type=coach&code=" + code;
        });
    }
});
