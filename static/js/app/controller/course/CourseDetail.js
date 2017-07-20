define([
    'app/controller/base',
    'app/module/weixin',
    'app/module/showInMap',
    'app/interface/CourseCtr',
    'swiper'
], function(base, weixin, showInMap, CourseCtr, Swiper) {
    var code = base.getUrlParam("code"), address;

    init();
    function init(){
        addListener();
        base.showLoading();
        $.when(
            getCourse(),
            getPageComment()
        ).then(base.hideLoading);
    }
    // 获取课程详情
    function getCourse() {
        return CourseCtr.getCourse(code)
            .then((data) => {
                addBanner(data);
                address = data.address;
                $("#name").html(data.name);
                $("#remainNum").html(data.remainNum);
                $("#datetime").html(base.formatDate(data.skStartDatetime, 'yyyy-MM-dd hh:mm') + " ~ " + base.formatDate(data.skEndDatetime, 'yyyy-MM-dd hh:mm'));
                $("#realName").html(data.realName);
                $("#address").html(data.address);
                $("#contact")
                    .html(`<a href="tel://${data.contact}" class="course-tel am-flexbox-item">
                                <span>${data.contact}</span>
                            </a>
                            <i class="right-arrow"></i>`);
                $("#description").html(data.description);
                $("#price").html(base.formatMoney(data.price));
            });
    }

    function addBanner(data) {
        var html = "";
        var advPic = data.advPic.split("||");
        advPic.forEach(function(pic){
            html += `<div class="swiper-slide"><img class="wp100 hp100" src="${base.getImg(pic)}"></div>`;
        });
        if(advPic.length <= 1){
            $(".swiper-pagination").addClass("hidden");
        }
        $("#top-swiper").html(html);
        new Swiper('#swiper-container', {
            'direction': 'horizontal',
            'loop': advPic.length > 1,
            'autoplay': 4000,
            'autoplayDisableOnInteraction': false,
            // 如果需要分页器
            'pagination': '.swiper-pagination'
        });
    }

    // 分页查询课程的评价
    function getPageComment() {
        return CourseCtr.getPageComment({
            productCode: code,
            start: 1,
            limit: 10
        }).then((data) => {

        });
    }

    function addListener() {
        showInMap.addMap();
        $("#address").click(function() {
            showInMap.showMapByName(address);
        });
        $("#buy").click(function() {
            location.href = "./course-confirm.html?code=" + code;
        });
    }
});
