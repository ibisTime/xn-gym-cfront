define([
    'app/controller/base',
    'app/module/weixin',
    'app/module/showInMap',
    'app/interface/CourseCtr',
    'swiper'
], function(base, weixin, showInMap, CourseCtr, Swiper) {
    var code = base.getUrlParam("code"), address;

    init();
    function init(){
        addListener();
        base.showLoading();
        $.when(
            getCourse(),
            getPageComment()
        ).then(base.hideLoading);
        getCourseRating();
    }
    // 查询私教的评分
    function getCourseRating() {
        CourseCtr.getCourseRating(code)
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
    // 获取课程详情
    function getCourse() {
        return CourseCtr.getCourse(code)
            .then((data) => {
                weixin.initShare({
                    title: document.title,
                    desc: base.clearTag(data.description),
                    link: location.href,
                    imgUrl: base.getShareImg(data.advPic)
                });
                addBanner(data);
                if(data.city == data.province) {
                    data.city = "";
                }
                address = (data.province || "") + (data.city || "") + (data.area || "") + data.address;
                $("#name").html(data.name);
                $("#remainNum").html(data.remainNum);
                $("#datetime").html(base.formatDate(data.skStartDatetime, 'yyyy-MM-dd hh:mm') + " ~ " + base.formatDate(data.skEndDatetime, 'hh:mm'));
                $("#realName").html(data.realName);
                $("#address").find("span").html(address);
                $("#contact")
                    .html(`<a href="tel://${data.contact}" class="course-tel am-flexbox-item">
                                <span>${data.contact}</span>
                            </a>
                            <i class="right-arrow"></i>`);
                $("#description").html(data.description);
                $("#price").html(base.formatMoney(data.price));
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
            'pagination': '.swiper-pagination'
        });
    }

    // 分页查询课程的评价
    function getPageComment() {
        return CourseCtr.getPageComment({
            productCode: code,
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
        showInMap.addMap();
        $("#address").click(function() {
            showInMap.showMapByName(address);
        });
        $("#buy").click(function() {
            location.href = "./course-confirm.html?code=" + code;
        });
        $("#goComment").click(function() {
            location.href = "../notice/comments.html?type=course&code=" + code;
        });
    }
});
