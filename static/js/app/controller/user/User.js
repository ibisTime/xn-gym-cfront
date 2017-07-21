define([
    'app/controller/base',
    'app/module/foot',
    'app/interface/UserCtr',
    'app/interface/AccountCtr'
], function(base, Foot, UserCtr, AccountCtr) {

    init();

    function init() {
        Foot.addFoot(3);
        base.showLoading("加载中...", 1);
        $.when(
            getUserInfo(),
            getAccount()
        ).then(base.hideLoading);
    }
    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(d, i) {
                    if (d.currency == "CNY") {
                        $("#cnyAmount").html(base.formatMoneyD(d.amount));
                    } else if (d.currency == "JF") {
                        $("#jfAmount").html(base.formatMoneyD(d.amount));
                    }
                })
            });
    }
    // 获取用户信息
    function getUserInfo() {
        return UserCtr.getUser().then(function(data) {
            $("#nickName").text(data.nickname);
            $("#userImg").attr("src", base.getImg(data.userExt.photo))
            $("#mobile").text(data.mobile);
        });
    }
});
