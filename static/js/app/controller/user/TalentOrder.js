define([
    'app/controller/base',
    'app/interface/coachCtr',
    'app/module/showInMap',
    'app/util/dict'
], function(base, coachCtr, showInMap, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("coachOrderStatus");
    var address;

    init();
    function init(){
        addListener();
        base.showLoading();
        getOrder();
    }
    function getOrder(refresh) {
        coachCtr.getOrder(code, refresh)
            .then((data) => {
                base.hideLoading();
                $("#code").text(data.code);
                $("#applyDatetime").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm"));
                // status: 0 待付款, 1 待接单, 2 待上课, 3 待下课, 4 待下课 5 待评价, 6 用户取消, 7 私教取消, 8 已完成
                $("#status").text(orderStatus[data.status]);
                if(data.status == "5") {
                    $("#goRating").removeClass("hidden");
                }
                address = data.address;
                $("#address").text(address);
                $("#datetime").text(base.formatDate(data.appointDatetime, "yyyy-MM-dd") + " " + data.skDatetime.substr(0, 5) + "~" + data.xkDatetime.substr(0, 5));
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
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    base.showLoading("取消中...");
                    coachCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true);
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
