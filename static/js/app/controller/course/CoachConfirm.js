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
        return GeneralCtr.getPageBizSysConfig(1, 100, 4)
            .then((data) => {
              data.list.forEach((item) => {
                  if (item.ckey === 'WY') {
                      $("#rate1").text(+item.cvalue * 100 + "%");
                  } else if (item.ckey === 'QWY') {
                      $("#rate2").text(+item.cvalue * 100 + "%");
                  }
              });
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
                    base.showMsg("该私教还未添加上课时间");
                    return;
                } else {
                    totalNum = perCourseList[0].totalNum;
                }
                if (coachType === '1') {
                    courseAddr = perCourseList[0].address;
                    $("#addrWrap").text(courseAddr);
                } else {
                    rules.address = {
                        required: true,
                        isNotFace: true
                    };
                }
                addListener();
                perCourseList.forEach((course) => {
                    var skCycle = weekList[course.skCycle],
                        skEndDatetime = course.skEndDatetime.substr(0, 5),
                        skStartDatetime = course.skStartDatetime.substr(0, 5);
                    html += `<option value="${course.code}" data-price="${course.price}">${skCycle} ${skStartDatetime}~${skEndDatetime}</option>`;
                });
                $("#perCourseCode").html(html).trigger("change");
                $("#quantity").attr('placeholder', '上课人数不超过' + totalNum + '人');
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
            _price.text(base.formatMoney($(this).find("option:selected").attr("data-price")) + "元");
            _amount.text(base.formatMoney($(this).find("option:selected").attr("data-price")) + "元");
            totalNum = perCourseList[this.selectedIndex].totalNum;
            $("#quantity").attr('placeholder', '上课人数不超过' + totalNum + '人');
            if (coachType === '1') {  // 达人
                courseAddr = perCourseList[this.selectedIndex].address;
                $("#addrWrap").text(courseAddr);
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
