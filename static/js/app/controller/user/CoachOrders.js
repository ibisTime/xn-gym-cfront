define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    init();
    function init(){
        addListener();
    }

    function addListener(){
        // tabs切换事件
        var _tabsInkBar = $("#am-tabs-bar").find(".am-tabs-ink-bar"),
            _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index() - 1;
            if(!_this.hasClass(".am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                _tabsInkBar.css({
                    "-webkit-transform": "translate3d(" + index * 1.875 + "rem, 0px, 0px)",
                    "-moz-transform": "translate3d(" + index * 1.875 + "rem, 0px, 0px)",
                    "transform": "translate3d(" + index * 1.875 + "rem, 0px, 0px)"
                });
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
            }
        });
    }
});
