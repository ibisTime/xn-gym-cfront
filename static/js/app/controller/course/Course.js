define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/CourseCtr',
    'app/interface/GeneralCtr',
    'app/interface/CoachCtr',
    'app/util/handlebarsHelpers'
], function(base, Foot, weixin, CourseCtr, GeneralCtr, CoachCtr, Handlebars) {
    var type = base.getUrlParam("type") || 0,
        config = {
            start: 1,
            limit: 10
        }, isEnd = false, canScrolling = false;
    var count = 2, coachList, labelList,
        genderList = {
            "0": "女",
            "1": "男"
        };
    var _weeks = {
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六",
            "0": "七",
        }, courseDatetime, coachDatetime;
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";

    init();
    function init(){
        Foot.addFoot(1);
        addListener();
        buildDate();
        $("#am-tabs-bar").find(".am-tabs-tab:eq(" + type + ")").click();
        weixin.initShare({
            title: document.title,
            desc: "自玩自健",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    // 生成日期选择器
    function buildDate() {
        var topHtml = "", bottomHtml = "";
        var now = new Date(),
            date = now.getDate();
        for(var i = 1; i <= 7; i++) {
            var date1 = now.getDate() + "",
                day = now.getDay(),
                attr_date = now.format("yyyy-MM-dd");
            topHtml += `<span data-time="${day + 1}" class="${i === 1 ? "active" : ""}">${_weeks[day]}</span>`;
            bottomHtml += `<span data-time="${attr_date}" class="${i === 1 ? "active" : ""}">${("00" + date1).substr(date1.length)}</span>`;
            now.setDate(date + i);
            if(i === 1) {
                courseDatetime = attr_date;
                coachDatetime = day + 1;
            }
        }
        $("#weekWrapper0, #weekWrapper1").html(topHtml);
        $("#dayWrapper0, #dayWrapper1").html(bottomHtml);
    }
    // 分页查询课程
    function getPageCourse(refresh) {
        var _tmpl = __inline('../../ui/course_course.handlebars');
        return CourseCtr.getPageCourse({
            classDatetime: courseDatetime,
            ...config
        }, refresh)
            .then((data) => {
                base.hideLoading();
                hideLoading(0);
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    $("#courseContent")[refresh || config.start == 1 ? "html" : "append"](_tmpl({items: data.list}));
                    config.start++;
                    isEnd && $("#loadAll0").removeClass("hidden");
                } else if(config.start == 1) {
                    $("#courseContent").html('<div class="no-data">暂无课程</div>');
                    $("#loadAll0").addClass("hidden");
                } else {
                    $("#loadAll0").removeClass("hidden");
                }
                !isEnd && $("#loadAll0").addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(0));
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
    function addLabelData(list) {
        var html = "";
        coachList.forEach((coach) => {
            var star = Math.floor(+coach.star), remainStar = 5 - star,
                starHtml = "";
            while(star--) {
                starHtml += '<i class="hot-star active"></i>';
            }
            while(remainStar--) {
                starHtml += '<i class="hot-star"></i>';
            }
            var labels = coach.label.split("||"), labelHtml = "";
            labels.forEach((label, index) => {
                labelHtml += `<span class="hot-tip hot-tip${index % 3}">${labelList[label]}</span>`;
            });
            html += `<a href="./coach-detail.html?code=${coach.code}" class="hot-item hot-item-coach">
                        <div class="hot-adv">
                            <img class="wp100 hp100" src="${base.getImg(coach.pic, SUFFIX)}"/>
                        </div>
                        <div class="hot-item-cont">
                            <div class="hot-item-time">
                                <span class="hot-time">${coach.realName}</span>
                                <span class="hot-course-title">${genderList[coach.gender]}</span>
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
        $("#coachContent")[config.start == 1 ? "html" : "append"](html);
    }

    // 分页查询私教
    function getPageCoach(refresh) {
        return CoachCtr.getPageFilterCoach({
            skCycle: coachDatetime,
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
                    isEnd && $("#loadAll1").removeClass("hidden");
                } else if(config.start == 1) {
                    $("#coachContent").html('<div class="no-data">暂无私教</div>');
                    $("#loadAll1").addClass("hidden");
                } else {
                    $("#loadAll1").removeClass("hidden");
                }
                !isEnd && $("#loadAll1").addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(1));
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
                if(!index) {    // 团课
                    getPageCourse();
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
        _tabsContent.on("click", ".week-days span", function(){
            var _this = $(this),
                index = _this.index(),
                _weekTitles = _this.parent().siblings(".week-titles");
            if(!_this.hasClass("active")) {
                _this.addClass("active")
                    .siblings(".active").removeClass("active");
                var _span = _weekTitles.find("span").eq(index);
                _span.addClass("active").siblings(".active").removeClass("active");
                courseDatetime = _this.attr("data-time");
                coachDatetime = _span.attr("data-time");
                config.start = 1;
                base.showLoading();
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                if(!choseIndex) {    // 团课
                    getPageCourse();
                } else {    // 私教
                    getPageCoach();
                }
            }
        });
        _tabsContent.on("click", ".week-titles span", function(){
            var _this = $(this),
                index = _this.index(),
                _weekdays = _this.parent().siblings(".week-days");
            if(!_this.hasClass("active")) {
                _this.addClass("active")
                    .siblings(".active").removeClass("active");
                var _span = _weekdays.find("span").eq(index);
                _span.addClass("active").siblings(".active").removeClass("active");
                coachDatetime = _this.attr("data-time");
                courseDatetime = _span.attr("data-time");
                config.start = 1;
                base.showLoading();
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                if(!choseIndex) {    // 团课
                    getPageCourse();
                } else {    // 私教
                    getPageCoach();
                }
            }
        });
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                var choseIndex = $(".am-tabs-tab-active").index() - 1;
                showLoading(choseIndex);
                if(!choseIndex) {    // 团课
                    getPageCourse();
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
