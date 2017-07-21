define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/module/showInMap',
    'app/util/dict'
], function(base, CourseCtr, showInMap, Dict) {
    var code = base.getUrlParam("code"),
        orderStatus = Dict.get("courseOrderStatus");
    var address;

    init();
    function init(){
        addListener();
        base.showLoading();
        getOrder();
    }
    function getOrder(refresh) {
        CourseCtr.getOrder(code, refresh)
            .then((data) => {
                base.hideLoading();
                $("#code").text(data.code);
                $("#applyDatetime").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm"));
                //status: 0 待付款，1 付款成功，2 用户取消订单，3 平台取消订单，4 退款申请，5 退款成功，6 退款失败，7待评价，8已完成;
                $("#status").text(orderStatus[data.status]);
                if(data.status == "7") {
                    $("#goRating").removeClass("hidden");
                }
                address = data.orgCourse.address;
                $("#address").text(address);
                $("#datetime").text(base.formatDate(data.orgCourse.skStartDatetime, "yyyy-MM-dd hh:mm") + "~" +
                    base.formatDate(data.orgCourse.skEndDatetime, "hh:mm"));
                $("#coachRealName").text(data.coachRealName);
                $("#amount").text(base.formatMoney(data.amount) + "元");
                if(data.penalty) {
                    $("#penalty").text(base.formatMoney(data.penalty) + "元")
                        .closest(".confirm-item").removeClass("hidden");
                }
                $("#applyNote").text(data.applyNote || "无");
                if(status == "0") {
                    $("#payBtn, #cancelBtn").removeClass("hidden");
                }
            });
    }
    function addListener(){
        showInMap.addMap();
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？", "取消", "确认")
                .then(() => {
                    CourseCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("取消成功");
                            base.showLoading();
                            getOrder(true);
                        });
                }, () => {});
        });
        $("#payBtn").on("click", function() {
            location.href = "../pay/pay.html?type=course&code=" + code;
        });
        $("#goRating").on("click", function() {
            location.href = "./assessment.html?code=" + code;
        });
        $("#address").on("click", function() {
            showInMap.showMapByName(address);
        });
    }
});
