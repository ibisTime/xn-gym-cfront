define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/AccountCtr'
], function(base, Foot, AccountCtr) {
    var config = {
        start: 1,
        limit: 10
    }, isEnd = false, canScrolling = false;

    init();

    function init() {
        Foot.addFoot(3);
        base.showLoading();
        getAccount();
        addListener();
    }
    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(account) {
                    if (account.currency == "CNY") {
                        $("#amount").html(base.formatMoneyD(account.amount));
                        config.accountNumber = account.accountNumber;
                    }
                });
                getPageFlow().then(base.hideLoading);
            });
    }
    // 分页查询流水
    function getPageFlow() {
        return AccountCtr.getPageFlow(config).then(function(data) {
            base.hideLoading();
            hideLoading();
            var lists = data.list;
            var totalCount = +data.totalCount;
            if (totalCount <= config.limit || lists.length < config.limit) {
                isEnd = true;
            }
            if(data.list.length) {
                $("#content").append(buildHtml(data.list));
                isEnd && $("#loadAll").removeClass("hidden");
                config.start++;
            } else if(config.start == 1) {
                $("#content").html('<li class="no-data">暂无资金流水</li>')
            } else {
                $("#loadAll").removeClass("hidden");
            }
            canScrolling = true;
        }, hideLoading);
    }
    function buildHtml(data) {
        var html = "";
        data.forEach((item) => {
            var transAmount = +item.transAmount,
                positive = transAmount > 0;
            transAmount = base.formatMoney(transAmount);
            var createDatetime = item.createDatetime,
                day = base.formatDate(createDatetime, "MM日"),
                time = base.formatDate(createDatetime, "hh:mm");

            html += `<div class="flow-item border-bottom-1px">
                <div class="am-flexbox">
                    <div class="flow-datetime">
                        <p class="f-date">${day}</p>
                        <p class="f-time">${time}</p>
                    </div>
                    <div class="flow-icon">
                        <i class="${positive ? 'receive-icon' : 'pay-icon'}"></i>
                    </div>
                    <div class="flow-content am-flexbox-item">
                        <p class="f-transAmount f-trans-red">${positive ? `+${transAmount}` : transAmount}</p>
                        <p class="flow-remark">${item.bizNote}</p>
                    </div>
                </div>
            </div>`;
        });
        return html;
    }
    function addListener() {
        //下拉加载
        $(window).off("scroll").on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                showLoading();
                getPageFlow();
            }
        });
        // 充值
        $("#rechargeBtn").click(() => {
            location.replace("../pay/recharge.html");
        });
        // 提现
        $("#withdrawBtn").click(() => {
            location.replace("./withdraw.html");
        });
    }
    function showLoading() {
        $("#loadingWrap").removeClass("hidden");
    }

    function hideLoading() {
        $("#loadingWrap").addClass("hidden");
    }
});
