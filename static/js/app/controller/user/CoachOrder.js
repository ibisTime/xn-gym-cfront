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
                // // status: 0 待付款，1 付款成功，2 已接单，3 已上课，4 已下课，5 用户取消，6 平台取消，7 已完成
                $("#status").text(orderStatus[data.status]);
                if(data.status == "4") {
                    $("#goRating").removeClass("hidden");
                }
                address = data.address;
                $("#address").text(address);
                $("#datetime").text(base.formatDate(data.appointDatetime, "yyyy-MM-dd") + " " + data.skDatetime.substr(0, 5) + "~" + data.xkDatetime.substr(0, 5));
                $("#coachRealName").text(data.coach.realName);
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
                if(data.status == "0") {
                    $("#payBtn, #cancelBtn").removeClass("hidden");
                } else if(data.status == "1" || data.status == "2") {
                    $("#cancelBtn").removeClass("hidden");
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
