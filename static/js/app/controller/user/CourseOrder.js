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
                // status: 0 待付款，1 付款成功，2 用户取消订单，3 平台取消订单，4 退款申请，5 退款成功，6 退款失败，
                // 7 已上课, 8 待评价, 9 已完成
                $("#status").text(orderStatus[data.status]);
                if(data.status == "8") {
                    $("#goRating").removeClass("hidden");
                }
                if(data.orgCourse.city == data.orgCourse.province) {
                    data.orgCourse.city = "";
                }
                address = (data.orgCourse.province || "") + (data.orgCourse.city || "") + (data.orgCourse.area || "") + data.orgCourse.address;
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
                if(data.remark) {
                    $("#remark").text(data.remark)
                        .closest(".confirm-item").removeClass("hidden");
                }
                if(data.status == "0") {
                    $("#payBtn, #cancelBtn").removeClass("hidden");
                } else if(data.status == "1") {
                    $("#refundBtn").removeClass("hidden");
                }
            });
    }
    function addListener(){
        showInMap.addMap();
        $("#cancelBtn").on("click", function() {
            base.confirm("确定取消订单吗？")
                .then(() => {
                    base.showLoading("取消中...");
                    CourseCtr.cancelOrder(code)
                        .then(() => {
                            base.showMsg("操作成功");
                            base.showLoading();
                            getOrder(true);
                        });
                }, () => {});
        });
        $("#refundBtn").on("click", function() {
            base.confirm('确定申请退款吗')
                .then(() => {
                    base.showLoading("提交中...");
                    CourseCtr.refundOrder(code)
                        .then(() => {
                            base.showMsg("申请提交成功");
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
