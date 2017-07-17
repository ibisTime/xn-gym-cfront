define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr'
], function(base, Foot, weixin, GeneralCtr) {
    init();
    function init(){
        Foot.addFoot(1);
        addListener();
    }

    function addListener(){
        // tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabsContent = $("#am-tabs-content"),
            _tabpanes = _tabsContent.find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass(".am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "-webkit-transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 3.75 + "rem, 0px, 0px)"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
            }
        });
        _tabsContent.on("click", ".week-days span", function(){
            var _this = $(this),
                index = _this.index(),
                _weekTitles = _this.parent().siblings(".week-titles");
            if(!_this.hasClass("active")) {
                _this.addClass("active")
                    .siblings(".active").removeClass("active");
                _weekTitles.find("span").eq(index).addClass("active")
                    .siblings(".active").removeClass("active");
            }
        });
        _tabsContent.on("click", ".week-titles span", function(){
            var _this = $(this),
                index = _this.index(),
                _weekdays = _this.parent().siblings(".week-days");
            if(!_this.hasClass("active")) {
                _this.addClass("active")
                    .siblings(".active").removeClass("active");
                _weekdays.find("span").eq(index).addClass("active")
                    .siblings(".active").removeClass("active");
            }
        });
    }
});
