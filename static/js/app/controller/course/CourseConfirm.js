define([
    'app/controller/base',
    'app/module/weixin',
    'app/interface/CourseCtr',
    'app/module/validate',
    'app/module/showInMap'
], function(base, weixin, CourseCtr, Validate, showInMap) {
    var code = base.getUrlParam("code"),
        price, remainNum, address;

    init();
    function init(){
        base.showLoading();
        getCourse().then(base.hideLoading);
    }
    // 获取课程详情
    function getCourse() {
        return CourseCtr.getCourse(code)
            .then((data) => {
                price = data.price;
                remainNum = data.remainNum;
                address = data.address;
                $("#price").html(base.formatMoney(data.price) + "元");
                $("#skStartDatetime").html(base.formatDate(data.skStartDatetime, 'yyyy-MM-dd hh:mm'));
                $("#remainNum").html(data.remainNum);
                $("#address").html(data.address);
                addListener();
            });
    }

    function addListener() {
        showInMap.addMap();
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
        var _price = $("#price");
        $("#quantity").on("keyup", function() {
            var value = this.value, amount = 0;
            if(/^\d+$/.test(value)) {
                amount = value * price;
                $("#amount").text(base.formatMoney(amount) + "元");
            } else {
                $("#amount").text("--元");
            }
        });
        // 提交订单
        $("#buy").click(function() {
            if(_formWrapper.valid()) {
                base.showLoading();
                applyOrder(_formWrapper.serializeObject());
            }
        });
        // 点击在地图上显示地址
        $("#address").on("click", function() {
            showInMap.showMapByName(address);
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
        param.orgCourseCode = code;
        CourseCtr.applyOrder(param)
            .then((data) => {
                location.replace('../pay/pay.html?type=course&code=' + data.code);
            });
    }
});
