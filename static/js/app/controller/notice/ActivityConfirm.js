define([
    'app/controller/base',
    'app/interface/ActivityCtr',
    'app/module/validate'
], function(base, ActivityCtr, Validate) {
    var code = base.getUrlParam("code"),
        price, remainNum;

    init();
    function init(){
        base.showLoading();
        getActivity().then(base.hideLoading);
    }
    // 获取活动详情
    function getActivity() {
        return ActivityCtr.getActivity(code)
            .then((data) => {
                price = data.amount;
                remainNum = data.remainNum;
                $("#title").html(data.title);
                $("#remainNum").html(data.remainNum);
                $("#price").html(base.formatMoney(data.amount) + "元");
                $("#startDatetime").html(base.formatDate(data.startDatetime, 'yyyy-MM-dd hh:mm'));
                $("#endDatetime").html(base.formatDate(data.endDatetime, "yyyy-MM-dd hh:mm"));
                addListener();
            });
    }

    function addListener() {
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                quantity: {
                    required: true,
                    "Z+": true,
                    ltR: true
                },
                mobile: {
                    required: true,
                    mobile: true
                },
                applyNote: {
                    required: true,
                    isNotFace: true,
                    maxlength: 255
                }
            },
            onkeyup: false
        });
        var _amount = $("#amount");
        $("#quantity").on("keyup", function() {
            var value = this.value, amount = 0;
            if(/^\d+$/.test(value)) {
                amount = value * price;
                _amount.text(base.formatMoney(amount) + "元");
            } else {
                _amount.text("--元");
            }
        });
        // 提交订单
        $("#buy").click(function() {
            if(_formWrapper.valid()) {
                base.showLoading();
                applyOrder(_formWrapper.serializeObject());
            }
        });
        $.validator.addMethod("ltR", function(value, element) {
            value = +value;
            if(value > remainNum) {
                return false;
            }
            return true;
        }, '不能超过剩余人数');
    }

    // 提交订单
    function applyOrder(param) {
        param.activityCode = code;
        ActivityCtr.applyOrder(param)
            .then((data) => {
                location.replace('../pay/pay.html?type=activity&code=' + data.code);
            });
    }
});
