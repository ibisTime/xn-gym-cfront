define([
    'app/controller/base',
    'app/interface/UserCtr',
    'app/module/bindMobile',
    'app/module/changeMobile',
    'app/module/setTradePwd'
], function(base, UserCtr, bindMobile, changeMobile, setTradePwd) {
    var mobile;

    init();
    function init() {
        base.showLoading();
        UserCtr.getUser().then((data) => {
            if (data.mobile) {
                $("#setMobile").find('span').text('修改手机号');
                mobile = data.mobile;
            }
            base.hideLoading();
        });
        addListener();
    }
    function addListener() {
        bindMobile.addMobileCont({
            success: function(mob) {
                mobile = mob;
                $("#setMobile").find('span').text('修改手机号');
            }
        });
        changeMobile.addMobileCont();
        setTradePwd.addCont();
        $("#setMobile").click(function() {
            if (mobile) {
                changeMobile.showMobileCont();
            } else {
                bindMobile.showMobileCont();
            }
        });
        $("#setTradePwd").click(function() {
            if (mobile) {
                setTradePwd.showCont(mobile);
            } else {
              base.confirm("您还未绑定手机号，无法设置交易密码。<br/>点击确认前往设置")
                  .then(() => {
                      bindMobile.showMobileCont();
                  }, () => {});
            }
        });
    }
});
