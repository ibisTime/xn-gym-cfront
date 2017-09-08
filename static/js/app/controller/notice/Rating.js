define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'app/interface/ActivityCtr',
    'app/util/handlebarsHelpers'
], function(base, weixin, GeneralCtr, ActivityCtr, Handlebars) {
    var type = 0,
        config = {
            start: 1,
            limit: 10
        }, isEnd = false, canScrolling = false;
    var count = 2, coachList, labelList,
        genderList = {
            "0": "女",
            "1": "男"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
    const DEFAULT_IMG = location.origin + '/static/images/default-bg.png';

    init();
    function init(){
        addListener();
        $("#am-tabs-bar").find(".am-tabs-tab:eq(" + type + ")").click();
        weixin.initShare({
            title: document.title,
            desc: "邀您一起健身",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    // 获取标签数据字典
    function getLabelList() {
        return GeneralCtr.getDictList("label_kind")
            .then((data) => {
                labelList = {};
                data.forEach((label) => {
                    labelList[label.dkey] = label.dvalue;
                });
                if(!--count) {
                    addLabelData();
                }
            });
    }
    // 当label的数据字典 和 coach 的数据都获取到了之后，再把值添加到页面中
    function addLabelData() {
        var html = "";
        coachList.forEach((item) => {
            var coach = item.coach;
            var star = Math.floor(+coach.star), remainStar = 5 - star,
                starHtml = "";
            while(star--) {
                starHtml += '<i class="hot-star active"></i>';
            }
            while(remainStar--) {
                starHtml += '<i class="hot-star"></i>';
            }
            var labels = coach.label && coach.label.split("||") || [], labelHtml = "";
            labels.forEach((label, index) => {
                labelHtml += `<span class="hot-tip hot-tip${index % 3}">${labelList[label]}</span>`;
            });
            html += `<a href="javascript:void(0)" data-code="${item.code}" class="hot-item rating-item-coach">
                        <div class="hot-adv">
                            <img class="wp100 hp100" src="${base.getImg(coach.pic || DEFAULT_IMG, SUFFIX)}"/>
                            <div class="adv-wrap">
                              <label data-count="${item.totalNum}" class="rate-count">${item.totalNum}票</label>
                              <label class="vote-text">${item.isVote=='0'?'投票':'已投票'}</label>
                            </div>
                        </div>
                        <div class="hot-item-cont">
                            <div class="hot-item-time">
                                <span class="hot-time">${coach.realName}</span>
                                <span class="hot-course-title">${item.orderNo}号</span>
                            </div>
                            <div class="hot-stars">
                                ${starHtml}
                            </div>
                            <div class="hot-tips">
                                ${labelHtml}
                            </div>
                        </div>
                    </a>`;
        });
        if (type) {
            $("#talentContent")[config.start == 1 ? "html" : "append"](html);
        } else {
            $("#coachContent")[config.start == 1 ? "html" : "append"](html);
        }
    }

    // 分页查询私教
    function getPageCoach(refresh) {
        return ActivityCtr.getPageJoiners({
            type: 0,
            ...config
        }, refresh)
            .then((data) => {
                base.hideLoading();
                hideLoading(1);
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    coachList = data.list;
                    if(!labelList) {
                        if(!--count) {
                            addLabelData();
                        }
                    } else {
                        addLabelData();
                    }
                    config.start++;
                    isEnd && $("#loadAll0").removeClass("hidden");
                } else if(config.start == 1) {
                    $("#coachContent").html('<div class="no-data">暂无私教</div>');
                    $("#loadAll0").addClass("hidden");
                } else {
                    $("#loadAll0").removeClass("hidden");
                }
                !isEnd && $("#loadAll0").addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(0));
    }

    // 分页查询达人
    function getPageTalent (refresh) {
        return ActivityCtr.getPageJoiners({
            type: 1,
            ...config
        }, refresh).then((data) => {
            base.hideLoading();
            hideLoading(1);
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            } else {
                isEnd = false;
            }
            if(data.list.length) {
                coachList = data.list;
                if(!labelList) {
                    if(!--count) {
                        addLabelData();
                    }
                } else {
                    addLabelData();
                }
                config.start++;
                isEnd && $("#loadAll1").removeClass("hidden");
            } else if(config.start == 1) {
                $("#talentContent").html('<div class="no-data">暂无达人</div>');
                $("#loadAll1").addClass("hidden");
            } else {
                $("#loadAll1").removeClass("hidden");
            }
            !isEnd && $("#loadAll1").addClass("hidden");
            canScrolling = true;
        }, () => hideLoading(1));
    }
    // 投票
    function ratingActivity(attendCode) {
        base.showLoading();
        ActivityCtr.ratingActivity(attendCode).then((data) => {
            base.hideLoading();
            base.showMsg('投票成功');
            var _item = $("#am-tabs-content").find('.rating-item-coach[data-code='+attendCode+']').find('.adv-wrap');
            _item.find('.vote-text').text('已投票');
            var _label = _item.find('.rate-count');
            var count = +_label.attr('data-count') + 1;
            _label.attr('data-count', count).text(count + '票');
        });
    }
    function addListener(){
        // tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabsContent = $("#am-tabs-content"),
            _tabpanes = _tabsContent.find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass("am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "-webkit-transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                config.start = 1;
                base.showLoading();
                type = index;
                if(index) {    // 达人
                    if(!labelList){
                        count = 2;
                        getLabelList();
                        getPageTalent();
                    } else {
                        getPageTalent();
                    }
                } else {    // 私教
                    if(!labelList){
                        count = 2;
                        getLabelList();
                        getPageCoach();
                    } else {
                        getPageCoach();
                    }
                }
            }
        });
        $("#am-tabs-content").on('click', '.rating-item-coach', function() {
            ratingActivity($(this).attr('data-code'));
        });
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading(type);
                if(type) {    // 达人
                    getPageTalent();
                } else {    // 私教
                    getPageCoach();
                }
            }
        });
    }
    function showLoading(index) {
        $("#loadingWrap" + index).removeClass("hidden");
    }

    function hideLoading(index) {
        $("#loadingWrap" + index).addClass("hidden");
    }
});
