define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/module/cityChose',
    'app/interface/GeneralCtr',
    'app/interface/CoachCtr',
    'app/interface/ActivityCtr',
    'swiper',
    'app/util/handlebarsHelpers'
], function(base, Foot, weixin, cityChose, GeneralCtr, CoachCtr, ActivityCtr, Swiper, Handlebars) {
    var count = 3, coachList = [], talentList = [], labelList = {},
        genderList = {
            "0": "女",
            "1": "男"
        };
    const SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
    const DEFAULT_IMG = location.origin + '/static/images/default-bg.png';

    init();

    function init(){
        Foot.addFoot(0);
        base.showLoading();
      	$.when(
        		getBanner(),
            getCategorys(),
        		getNotice(),
            getLabelList(),
            getPageCoach(),
            getPageTalent(),
            getPageActivities()
      	).then(base.hideLoading);
        initAddr();
      	addListener();
        weixin.initShare({
            title: document.title,
            desc: "自玩自健",
            link: location.href,
            imgUrl: base.getShareImg()
        });
    }
    function initAddr() {
        var prov = sessionStorage.getItem('prov');
        if (prov) {
            var city = sessionStorage.getItem('city');
            var area = sessionStorage.getItem('area') || '';
            var text = area || city;
            $("#cityWrap").find('.city-content').text(text)
              .attr('data-prv', prov)
              .attr('data-city', city)
              .attr('data-area', area);
        }
    }
    // 获取标签数据字典
    function getLabelList() {
        return GeneralCtr.getDictList("label_kind")
            .then((data) => {
                data.forEach((label) => {
                    labelList[label.dkey] = label.dvalue;
                });
                if(!--count) {
                    addLabelData();
                }
            });
    }
    // 当label的数据字典 和 coach 的数据都获取到了之后，再把值添加到页面中
    function addLabelData() {
        coachList.length && buildHtml(coachList, '#coachContent');
        talentList.length && buildHtml(talentList, '#courseContent');
    }

    function buildHtml(list, id) {
        var html = "";
        list.forEach((item) => {
            var star = +item.star, remainStar = 5 - star,
                starHtml = "", address = "";
            while(star--) {
                starHtml += '<i class="hot-star active"></i>';
            }
            while(remainStar--) {
                starHtml += '<i class="hot-star"></i>';
            }
            var labels = item.label && item.label.split("||") || [], labelHtml = "";
            labels.forEach((label, index) => {
                labelHtml += `<span class="hot-tip hot-tip${index % 3}">${labelList[label]}</span>`;
            });
            if (item.province) {
                item.province = item.province === item.city ? '' : item.province;
                item.area = item.area === '全部' ? '' : item.area;
                address = item.province + item.city + item.area;
            }
            html += `<a href="./course/coach-detail.html?code=${item.code}" class="hot-item hot-item-coach">
                        <div class="hot-adv">
                            <img class="wp100 hp100" src="${base.getImg(item.pic || DEFAULT_IMG, SUFFIX)}"/>
                        </div>
                        <div class="hot-item-cont">
                            <div class="hot-item-time">
                                <span class="hot-time">${item.realName}</span>
                                <span class="hot-course-title">${genderList[item.gender]}</span>
                                <span class="hot-course-title1">${item.duration}年</span>
                            </div>
                            <div class="hot-stars">
                                ${starHtml}
                            </div>
                            <div class="hot-item-addr">${address}</div>
                            <div class="hot-tips">
                                ${labelHtml}
                            </div>
                        </div>
                    </a>`;
        });
        $(id).html(html);
    }

    // 分页查询私教
    function getPageCoach(refresh) {
        return CoachCtr.getPageCoach({
            start: 1,
            limit: 10,
            location: 1,
            orderColumn: 'order_no',
            orderDir: 'asc'
        }, refresh).then((data) => {
            coachList = data.list;
            if(!--count) {
                addLabelData();
            }
            if(!data.list.length) {
                $("#coachContent").html('<div class="no-data">暂无私教</div>');
            }
        })
    }

    // 分页查询达人
    function getPageTalent(refresh) {
        return CoachCtr.getPageTalent({
            start: 1,
            limit: 10,
            location: 1,
            orderColumn: 'order_no',
            orderDir: 'asc'
        }, refresh).then((data) => {
            talentList = data.list;
            if (!--count) {
                addLabelData();
            }
            if (!data.list.length) {
                $("#courseContent").html('<div class="no-data">暂无达人</div>');
            }
        });
    }
    // 分页查询活动
    function getPageActivities(refresh) {
        var _tmpl = __inline('../ui/index_activity.handlebars');
        return ActivityCtr.getPageActivities({
            start: 1,
            limit: 10,
            location: 1
        }, refresh).then((data) => {
            if(data.list.length) {
                $("#actContent").html(_tmpl({items: data.list}));
            } else {
                $("#actContent").html('<div class="no-data">暂无活动</div>');
            }
        });
    }

    //banner图
    function getBanner(refresh){
        return GeneralCtr.getBanner(refresh)
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#top-swiper").html(html);
                    new Swiper('#swiper-container', {
                        'direction': 'horizontal',
                        'loop': data.length > 1,
                        'autoplay': 4000,
    		            'autoplayDisableOnInteraction': false,
                        // 如果需要分页器
                        'pagination': '.swiper-pagination'
                    });
                }
            });
    }

    // 引流
    function getCategorys(refresh) {
      return GeneralCtr.getCategorys(refresh).then((data) => {
        if (data.length) {
          var html = '';
          for(var i = 0; i < data.length; i++) {
            html += `<a href="${data[i].url || 'javascript:void(0)'}" class="cate-item">
                <img src="${base.getImg(data[i].pic)}"/>
                <p>${data[i].name}</p>
            </a>`;
          }
          $('#category').html(html);
        }
      });
    }

    //公告
    function getNotice(){
        return GeneralCtr.getPageSysNotice({
            start: 1,
            limit: 1
        }).then(function(data){
            if(data.list.length){
			          $("#noticeWrap").html(`
                    <a href="../notice/notice.html" class="am-flexbox am-flexbox-justify-between">
                        <div class="am-flexbox am-flexbox-item">
                            <img src="/static/images/notice.png" alt="">
                            <span class="am-flexbox-item t-3dot">${data.list[0].smsTitle}</span>
                        </div>
                        <i class="right-arrow"></i>
                    </a>`).removeClass("hidden");
            }
        });
    }

    function addListener(){
        cityChose.addCont({
          // data: city,
          chose: function(text, prov, city, area) {
              $("#cityWrap").find('.city-content').text(text)
                .attr('data-prv', prov)
                .attr('data-city', city)
                .attr('data-area', area);
              sessionStorage.setItem('prov', prov);
              sessionStorage.setItem('city', city);
              sessionStorage.setItem('area', area || '');
          }
        });
        $("#cityWrap").on('click', function() {
          cityChose.showCont();
        });
        $("#swiper-container").on("touchstart", ".swiper-slide img", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper-container").on("touchend", ".swiper-slide img", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                }

            }
        });
    }
});
