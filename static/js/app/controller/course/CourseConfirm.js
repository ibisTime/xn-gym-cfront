define([
    'app/controller/base',
    'app/interface/CourseCtr',
    'app/interface/GeneralCtr',
    'app/module/validate',
    'app/module/showInMap'
], function(base, CourseCtr, GeneralCtr, Validate, showInMap) {
    var code = base.getUrlParam("code"),
        price, remainNum, address;
    var defAddr;

    init();
    function init(){
        base.showLoading();
        $.when(
            getCourse(),
            getRate()
        ).then(() => {
            base.hideLoading();
            addListener();
        });
    }
    // 获取违约金比率
    function getRate() {
        return GeneralCtr.getBizSysConfig("WY")
            .then((data) => {
                $("#rate").text(+data.cvalue * 100 + "%");
            });
    }
    // 获取课程详情
    function getCourse() {
        return CourseCtr.getCourse(code)
            .then((data) => {
                price = data.price;
                remainNum = data.remainNum;
                if(data.city == data.province) {
                    data.city = "";
                }
                address = (data.province || "") + (data.city || "") + (data.area || "") + data.address;
                $("#price").text(base.formatMoney(data.price) + "元");
                $("#skStartDatetime").text(base.formatDate(data.skStartDatetime, 'yyyy-MM-dd hh:mm') + " ~ " + base.formatDate(data.skEndDatetime, 'hh:mm'));
                $("#remainNum").text(data.remainNum);
                $("#address").text(address);
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
