define([
    'app/controller/base',
    'app/interface/CoachCtr',
    'app/interface/GeneralCtr',
    'app/module/validate',
    'app/module/searchMap',
    'app/module/showInMap'
], function(base, CoachCtr, GeneralCtr, Validate, searchMap, showInMap) {
    var code = base.getUrlParam("code");
    var totalNum = 5, perCourseList = [];
    var coachType, courseAddr;
    var defAddr;
    var rules = {
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
            isNotFace: true,
            maxlength: 255
        }
    };

    init();
    function init(){
        base.showLoading();
        $.when(
            getCoach(),
            getConfigs(),
            getDefAddr()
        ).then(() => {
            $("#J_SearchMapInput").attr("placeholder", defAddr);
            base.hideLoading();
        });
    }
    // 获取默认的地址
    function getDefAddr() {
        return GeneralCtr.getUserSysConfig('default_address').then((data) => {
            defAddr = data.cvalue;
        });
    }
    // 获取违约金比率
    function getConfigs() {
        return $.when(
            GeneralCtr.getBizSysConfig('WY'),
            GeneralCtr.getBizSysConfig('QWY')
        ).then((data1, data2) => {
            $("#rate1").text(+data1.cvalue * 100 + "%");
            $("#rate2").text(+data2.cvalue * 100 + "%");
        });
    }
    // 获取私教详情
    function getCoach() {
        return CoachCtr.getCoachAndComment(code)
            .then((data) => {
                coachType = data.coach.type;
                var weekList = {
                    "1": "周日",
                    "2": "周一",
                    "3": "周二",
                    "4": "周三",
                    "5": "周四",
                    "6": "周五",
                    "7": "周六"
                }, html = "";
                perCourseList = data.perCourseList;
                if (!perCourseList.length) {
                    base.showMsg("该私教还未添加课程");
                    return;
                }
                if (coachType !== '1') {
                    rules.address = {
                        required: true,
                        isNotFace: true
                    };
                }
                var flag = false;
                perCourseList.forEach((course) => {
                    var skCycle = weekList[course.skCycle],
                        skEndDatetime = course.skEndDatetime.substr(0, 5),
                        skStartDatetime = course.skStartDatetime.substr(0, 5);
                    if (course.isAppoint=='1') {
                        html += `<option disabled value="${course.code}" data-price="${course.price}">${skCycle} ${skStartDatetime}~${skEndDatetime}(已被预定)</option>`;
                    } else {
                        flag = true;
                        html += `<option value="${course.code}" data-price="${course.price}">${skCycle} ${skStartDatetime}~${skEndDatetime}</option>`;
                    }
                });
                if (flag) {
                    addListener();
                } else {
                    var str = coachType !== '1' ? '该私教暂无可以预约的课程' : '该达人暂无可以预约的课程';
                    base.showMsg(str);
                }
                $("#perCourseCode").html(html).trigger("change");
            });
    }

    function addListener() {
        if (coachType === '1') {  // 达人
            showInMap.addMap();
        } else {  // 私教
            searchMap.addMap({
              initInDW: true
            });
        }
        var _formWrapper = $("#formWrapper");
        _formWrapper.validate({
            'rules': rules,
            onkeyup: false
        });
        var _price = $("#price"),
            _amount = $("#amount"),
            _perCourseCode = $("#perCourseCode");

        _perCourseCode.on("change", function() {
            var selectOpt = $(this).find("option:selected");
            if (selectOpt.length) {
                _price.text(base.formatMoney(selectOpt.attr("data-price")) + "元");
                _amount.text(base.formatMoney(selectOpt.attr("data-price")) + "元");
                totalNum = perCourseList[this.selectedIndex].totalNum;
                $("#quantity").attr('placeholder', '上课人数不超过' + totalNum + '人');
                if (coachType === '1') {  // 达人
                    courseAddr = perCourseList[this.selectedIndex].address;
                    $("#addrWrap").text(courseAddr);
                }
            }
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
            if (coachType === '1') {
                showInMap.showMapByName(courseAddr);
            } else {
                searchMap.showMap({
                    success: function(point, address) {
                        $("#address").val(address).valid();
                        $("#addrWrap").text(address);
                    }
                });
            }
        });
        $.validator.addMethod("ltR", function(value, element) {
            value = +value;
            if(value > totalNum) {
                return false;
            }
            return true;
        }, '不能超过最多上课人数');
    }

    // 提交订单
    function applyOrder(param) {
        CoachCtr.applyOrder(param)
            .then((data) => {
                location.replace('../pay/pay.html?type=coach&code=' + data.code);
            });
    }
});
