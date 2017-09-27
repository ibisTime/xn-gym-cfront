define([
    'app/controller/base',
    'app/interface/coachCtr',
    'app/interface/GeneralCtr',
    'app/module/showInMap',
    'app/util/dict'
], function(base, coachCtr, GeneralCtr, showInMap, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("coachOrderStatus");
    var address, status, rate1, rate2;

    init();
    function init(){
        addListener();
        base.showLoading();
        $.when(
            getOrder(),
            getConfigs()
        ).then(base.hideLoading);
    }
    // 获取违约金比率
    function getConfigs() {
        return $.when(
            GeneralCtr.getBizSysConfig('WY'),
            GeneralCtr.getBizSysConfig('QWY')
        ).then((data1, data2) => {
            rate1 = +data1.cvalue * 100 + "%";
            rate2 = +data2.cvalue * 100 + "%";
        });
    }
    function getOrder(refresh) {
        return coachCtr.getOrder(code, refresh)
            .then((data) => {
                $("#code").text(data.code);
                $("#applyDatetime").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm"));
                // status: 0 待付款, 1 待接单, 2 待上课, 3 待下课, 4 待下课 5 待评价, 6 用户取消, 7 私教取消, 8 已完成
                $("#status").text(orderStatus[data.status]);
                if(data.status == "5") {
                    $("#goRating").removeClass("hidden");
                }
                status = data.status;
                address = data.address;
                $("#address").text(address);
                if (data.skStartDatetime && data.skEndDatetime) {
                    $("#datetime").text(base.formatDate(data.skStartDatetime, 'yyyy-MM-dd hh:mm') + '~' + base.formatDate(data.skEndDatetime, 'hh:mm'));
                } else {
                    $("#datetime").text(base.formatDate(data.appointDatetime, "yyyy-MM-dd") + " " + data.skDatetime.substr(0, 5) + "~" + data.xkDatetime.substr(0, 5));
                }
                $("#coachRealName").html(`<a class="under" href="../course/coach-detail.html?code=${data.coach.code}">${data.coach.realName}</a>`);
                $("#mobile").html(`<a href="tel://${data.coach.mobile}">${data.coach.mobile}</a>`);
                $("#amount").text(base.formatMoney(data.amount) + "元");
                if(data.penalty) {
                    $("#penalty").text(base.formatMoney(data.penalty) + "元")
                        .closest(".confirm-item").removeClass("hidden");
                }
                $("#applyNote").text(data.applyNote || "无");
                if(data.remark) {
                    $("#remark").text(data.remark)
                        .closest(".confirm-item").removeClass("hidden");
                }
                if(refresh) {
                    $(".confirm-btn").find("button").addClass("hidden");
                }
                if(data.status == "0") {
                    $("#payBtn, #cancelBtn").removeClass("hidden");
                    $("#callWrapper").empty();
                } else if(data.status == "1") {
                    $("#cancelBtn").removeClass("hidden");
                    $("#callWrapper").html(`<a href="tel://${data.coach.mobile}" class="am-button am-button-primary am-button-call">联系达人</a>`);
                } else {
                    $("#callWrapper").html(`<a href="tel://${data.coach.mobile}" class="am-button am-button-primary am-button-call">联系达人</a>`);
                }
            });
    }
    function addListener(){
        showInMap.addMap();
        $("#cancelBtn").on("click", function() {
            var str = '确定取消订单吗？';
            if (status != '0') {
                str += `<div style="font-size: 12px;color: #999;padding-top: 4px;">上课前两小时外取消扣${rate1}订单金额，两小时内取消扣${rate2}订单金额</div>`;
            }
            base.confirm(str, "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    coachCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true).then(base.hideLoading);
                        });
                }, () => {});
        });
        $("#payBtn").on("click", function() {
            location.href = "../pay/pay.html?type=coach&code=" + code;
        });
        $("#goRating").on("click", function() {
            location.href = "./assessment.html?code=" + code;
        });
        $("#address").on("click", function() {
            showInMap.showMapByName(address);
        });
    }
});
