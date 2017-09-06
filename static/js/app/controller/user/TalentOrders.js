define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/CoachCtr',
    'app/module/scroll'
], function(base, Dict, CoachCtr, scroll) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;
    var orderStatus = Dict.get("coachOrderStatus");
    var currentType = 0,
        // status: 0 待付款, 1 待接单, 2 待上课, 3 待下课, 4 待下课 5 待评价, 6 用户取消, 7 私教取消, 8 已完成
        type2Status = {
            "0": "",
            "1": "0",
            "2": "1",
            "3": "2",
            "4": [3, 4],
            "5": "5",
            "6": "8"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!150x113r";
    var myScroll;

    init();
    function init(){
        initScroll();
        addListener();
        base.showLoading();
        getPageOrders();
    }
    function initScroll() {
        var width = 0;
        var _wrap = $("#am-tabs-bar");
        _wrap.find('.am-tabs-tab').each(function () {
            width += this.clientWidth;
        });
        _wrap.find('.scroll-content').css('width', width + 'px');
        myScroll = scroll.getInstance().getScrollByParam({
            id: 'am-tabs-bar',
            param: {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true,
                snap: true,
                hideScrollbar: true,
                hScrollbar: false,
                vScrollbar: false
            }
        });
    }
    // 分页查询订单
    function getPageOrders(refresh) {
        var params = {
            ...config
        };
        if (type2Status[currentType].length === 2) {
            params.statusList = type2Status[currentType];
        } else {
            params.status = type2Status[currentType];
        }
        return CoachCtr.getPageTalentOrders(params, refresh)
            .then((data) => {
                base.hideLoading();
                hideLoading(currentType);
                var lists = data.list;
                var totalCount = +data.totalCount;
                if (totalCount <= config.limit || lists.length < config.limit) {
                    isEnd = true;
                } else {
                    isEnd = false;
                }
                if(data.list.length) {
                    var html = "";
                    lists.forEach((item) => {
                        html += buildHtml(item);
                    });
                    $("#content" + currentType)[refresh || config.start == 1 ? "html" : "append"](html);
                    isEnd && $("#loadAll" + currentType).removeClass("hidden");
                    config.start++;
                } else if(config.start == 1) {
                    $("#content" + currentType).html('<div class="no-data">暂无订单</div>');
                    $("#loadAll" + currentType).addClass("hidden");
                } else {
                    $("#loadAll" + currentType).removeClass("hidden");
                }
                !isEnd && $("#loadAll" + currentType).addClass("hidden");
                canScrolling = true;
            }, () => hideLoading(currentType));
    }
    function buildHtml(item) {
        return `<div class="order-item">
                    <div class="order-item-header">
                        <span>${item.code}</span>
                        <span class="fr">${base.formatDate(item.applyDatetime, "yyyy-MM-dd")}</span>
                    </div>
                    <a href="./talent-order.html?code=${item.code}" class="order-item-cont">
                        <div class="am-flexbox am-flexbox-align-top">
                            <div class="order-img">
                                <img src="${base.getImg(item.coach.pic, SUFFIX)}"/>
                            </div>
                            <div class="order-name-infos am-flexbox-item">
                                <div class="am-flexbox am-flexbox-dir-column am-flexbox-justify-between am-flexbox-align-top">
                                    <div>
                                        <h1>${item.coach.realName}</h1>
                                        <div class="order-infos">
                                            <span class="pdr">${base.formatDate(item.appointDatetime, "MM-dd")} ${item.skDatetime.substr(0, 5)}~${item.xkDatetime.substr(0, 5)}</span><span class="pdr pdl">${item.quantity}人</span><span class="pdl">¥${base.formatMoney(item.amount)}</span>
                                        </div>
                                    </div>
                                    <div class="order-addr">
                                        <span class="t-3dot">${item.address}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="order-status">${currentType == 0 ? orderStatus[item.status] : "¥" + base.formatMoney(item.amount)}</div>
                        </div>
                    </a>
                    ${
                        item.status == "0" || item.status == "1" || item.status == "5"
                            ? `<div class="order-item-footer">
                                    ${
                                        item.status == "0"
                                            ? `<a class="am-button am-button-small" href="../pay/pay.html?code=${item.code}&type=coach">立即支付</a>
                                                <button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button>`
                                            : item.status == "1"
                                                ? `<button class="am-button am-button-small cancel-order" data-code="${item.code}">取消订单</button>`
                                                : `<a class="am-button am-button-small rating-order" href="./assessment.html?code=${item.code}">去评价</a>`
                                    }
                                </div>`
                            : ''
                    }
                </div>`;
        // status: 0 待付款, 1 待接单, 2 待上课, 3 待下课, 4 待下课 5 待评价, 6 用户取消, 7 私教取消, 8 已完成
    }

    function addListener(){
        // tabs切换事件
        var _tabpanes = $("#am-tabs-content").find(".am-tabs-tabpane");
        $("#am-tabs-bar").on("click", ".am-tabs-tab", function(){
            var _this = $(this), index = _this.index();
            if(!_this.hasClass("am-tabs-tab-active")){
                _this.addClass("am-tabs-tab-active")
                    .siblings(".am-tabs-tab-active").removeClass("am-tabs-tab-active");
                myScroll.myScroll.scrollToElement(_this[0], 200, true);
                _tabpanes.eq(index).removeClass("am-tabs-tabpane-inactive")
                    .siblings().addClass("am-tabs-tabpane-inactive");
                // 当前选择查看的订单tab的index
                currentType = index;
                config.start = 1;
                base.showLoading();
                getPageOrders();
            }
        });
        $("#orderWrapper").on("click", ".cancel-order", function() {
            var orderCode = $(this).attr("data-code");
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    CoachCtr.cancelOrder(orderCode)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            config.start = 1;
                            getPageOrders(true);
                        });
                }, () => {});
        });

        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageOrders();
            }
        });
    }
    function showLoading() {
        $("#loadingWrap" + currentType).removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap" + currentType).addClass("hidden");
    }
});
