define([
    'app/controller/base',
    'app/module/weixin',
    'app/module/commentModal',
    'app/interface/CoachCtr',
    'app/interface/GeneralCtr',
    'swiper'
], function(base, weixin, commentModal, CoachCtr, GeneralCtr, Swiper) {
    var code = base.getUrlParam("code"),
        genderList = {
            "0": "女",
            "1": "男"
        },
        count = 2, labelList = {}, labels;

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
                if (data.type == '1') {
                    base.setTitle('达人详情');
                }
                weixin.initShare({
                    title: '自玩自健',
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
                if (data.province) {
                    data.province = data.province === data.city ? '' : data.province;
                    data.area = data.area === '全部' ? '' : data.area;
                    let address = data.province + data.city + data.area;
                    $("#skAddr").text('授课区域：' + address);
                }
                $("#realName").text(data.realName);
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
        return `<div class="comment-item" data-code="${item.code}">
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
        commentModal.addCont();
        $("#buy").click(function() {
            location.href = "./coach-confirm.html?code=" + code;
        });
        $("#goComment").click(function() {
            location.href = "../notice/comments.html?type=coach&code=" + code;
        });
        $("#ratings").on("click", ".comment-item", function() {
            CoachCtr.getComment($(this).attr("data-code"))
                .then((data) => {
                    commentModal.showCont(data);
                });
        });
    }
});
