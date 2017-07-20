define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/interface/CoachCtr',
    'app/module/weixin'
], function(base, CourseCtr, CoachCtr, weixin) {
    const COURSE_ORDER = "course", COACH_ORDER = "coach";
    const BALANCE_PAY = 0, WX_PAY = 1;
    var code = base.getUrlParam("code"),
        type = base.getUrlParam("type"),
        pay_type = 0;

    init();
    function init(){
        if(!type) {
            base.showMsg("未传入订单类型");
        } else if(!code) {
            base.showMsg("未传入订单编号");
        } else {
            base.showLoading();
            if(type == COURSE_ORDER) {
                getCourseOrder();
            } else if(type == COACH_ORDER) {
                getCoachOrder();
            }
            addListener();
        }
    }
    // 详情查询课程订单
    function getCourseOrder() {
        CourseCtr.getOrder(code)
            .then((data) => {
                base.hideLoading();
                $("#price").text(base.formatMoney(data.amount));
            });
    }
    //
    function getCoachOrder() {
        CoachCtr.getOrder(code)
            .then((data) => {
                base.hideLoading();
                $("#price").text(base.formatMoney(data.amount));
            });
    }

    function addListener() {
        $("#payType").on(".pay-item", "click", function() {
            var _me = $(this);
            if(!_me.hasClass("active")) {
                _me.addClass("active").siblings(".active").removeClass("active");
                pay_type = _me.index();
            }
        });
        $("#payBtn").on("click", function(){
            base.showLoading("支付中...");
            // 余额支付
            if(pay_type == BALANCE_PAY) {
                payByBalance();
            } else if(pay_type == WX_PAY) {   //微信支付
                payByWx();
            }
        });
    }
    function payByBalance() {
        // 课程订单
        if(type == COURSE_ORDER) {
            payCourseOrder(code, 1);
        } else if(type == COACH_ORDER) {   //私教订单
            payCoachOrder(code, 1);
        }

    }
    function payByWx() {
        // 课程订单
        if(type == COURSE_ORDER) {
            payCourseOrder(code, 5);
        } else if(type == COACH_ORDER){    //私教订单
            payCoachOrder(code, 5);
        }
    }
    // 支付课程订单
    function payCourseOrder(code, payType) {
        CourseCtr.payOrder(code, payType)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
                    }, 500);
                }
            });
    }
    // 支付私教订单
    function payCoachOrder(code, payType) {
        CoachCtr.payOrder(code, payType)
            .then((data) => {
                if(pay_type == WX_PAY) {
                    wxPay(data);
                } else {
                    base.hideLoading();
                    base.showMsg("支付成功");
                    setTimeout(() => {
                        location.href = "../user/user.html";
                    }, 500);
                }
            });
    }
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.href = "../user/user.html";
                }, 500);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }
});
