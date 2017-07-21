define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    var orderCode = base.getUrlParam("code");
    init();

    function init(){
        base.showLoading();
        getPageRatekey();
        addListener();
    }
    function getPageRatekey() {
        GeneralCtr.getPageRatekey({
            start: 1,
            limit: 100
        }).then((data) => {
            base.hideLoading();
            var html = "";
            data.list.forEach((item) => {
                html += `<div class="assessment-item" data-ckey="${item.ckey}">
                            <div class="am-flexbox">
                                <div class="assessment-title">${item.note}</div>
                                <div class="assessment-content">
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <i class="hot-star"></i>
                                    <span class="text">非常好</span>
                                </div>
                            </div>
                        </div>`
            });
            $("#wrapper").html(html);
        });
    }
    function addListener(){
        $("#wrapper").on("click", ".hot-star", function() {
            $(this).toggleClass("active");
        });
        $("#applyBtn").click(function() {
            //
            rating();
        });
    }
    // 评论
    function rating() {
        var content = $("#content").val();
        if(!content) {
            base.showMsg("评论内容不能为空");
        } else if(content.length > 255) {
            base.showMsg("评论内容不能超过255位");
        } else {
            base.showLoading("提交中...");
            var itemScoreList = [];
            $("#wrapper").find(".assessment-item")
                .each(function() {
                    var _item = $(this),
                        ckey = _item.attr("data-ckey"),
                        score = _item.find(".hot-star.active").length;
                    itemScoreList.push({
                        ckey,
                        score
                    });
                });
            GeneralCtr.rating(orderCode, content, itemScoreList)
                .then(() => {
                    base.hideLoading();
                    base.showMsg("评论成功");
                    setTimeout(() => {
                        location.href = "../index.html";
                    }, 500);
                });
        }

    }
});
