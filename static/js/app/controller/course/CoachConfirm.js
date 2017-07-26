define([
    'app/controller/base',
    'app/interface/CoachCtr',
    'app/interface/GeneralCtr',
    'app/module/validate',
    'app/module/searchMap'
], function(base, CoachCtr, GeneralCtr, Validate, searchMap) {
    var code = base.getUrlParam("code");

    init();
    function init(){
        base.showLoading();
        $.when(
            getCoach(),
            getRate()
        ).then(base.hideLoading);
    }
    // 获取违约金比率
    function getRate() {
        return GeneralCtr.getBizSysConfig("WY")
            .then((data) => {
                $("#rate").text(+data.cvalue * 100 + "%");
            });
    }
    // 获取私教详情
    function getCoach() {
        return CoachCtr.getCoachAndComment(code)
            .then((data) => {
                addListener();
                var weekList = {
                    "1": "周日",
                    "2": "周一",
                    "3": "周二",
                    "4": "周三",
                    "5": "周四",
                    "6": "周五",
                    "7": "周六"
                }
                var perCourseList = data.perCourseList, html = "";
                if(!perCourseList.length) {
                    base.showMsg("该私教还未添加上课时间");
                    return;
                }
                perCourseList.forEach((course) => {
                    var skCycle = weekList[course.skCycle],
                        skEndDatetime = course.skEndDatetime.substr(0, 5),
                        skStartDatetime = course.skStartDatetime.substr(0, 5);
                    html += `<option value="${course.code}" data-price="${course.price}">${skCycle} ${skStartDatetime}~${skEndDatetime}</option>`;
                });
                $("#perCourseCode").html(html).trigger("change");
            });
    }

    function addListener() {
        searchMap.addMap();
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': {
                address: {
                    required: true,
                    isNotFace: true
                },
                perCourseCode: {
                    required: true
                },
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
        var _price = $("#price"),
            _amount = $("#amount"),
            _perCourseCode = $("#perCourseCode");

        _perCourseCode.on("change", function() {
            _price.text(base.formatMoney($(this).find("option:selected").attr("data-price")) + "元");
            _amount.text(base.formatMoney($(this).find("option:selected").attr("data-price")) + "元");
        });
        // 提交订单
        $("#buy").click(function() {
            if(_formWrapper.valid()) {
                base.showLoading();
                applyOrder(_formWrapper.serializeObject());
            }
        });
        // 点击显示地图
        $("#addrWrap").on("click", function() {
            searchMap.showMap({
                success: function(point, address) {
                    $("#address").val(address).valid();
                    $("#addrWrap").text(address);
                }
            });
        });
        $.validator.addMethod("ltR", function(value, element) {
            value = +value;
            if(value > 5) {
                return false;
            }
            return true;
        }, '不能超过5人');
    }

    // 提交订单
    function applyOrder(param) {
        CoachCtr.applyOrder(param)
            .then((data) => {
                location.replace('../pay/pay.html?type=coach&code=' + data.code);
            });
    }
});
