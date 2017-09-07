define([
  'app/controller/base',
  'app/module/weixin',
  'app/interface/ActivityCtr'
], function(base, weixin, ActivityCtr) {
  var code = base.getUrlParam('code');

  init();

  function init() {
    base.showLoading();
    getActivity();
    addListener();
  }

  function getActivity() {
    ActivityCtr.getActivity(code).then((data) => {
      base.setTitle(data.title);
      $("#description").html(data.description);
      weixin.initShare({
        title: data.title,
        desc: '邀您一起健身',
        link: location.href,
        imgUrl: base.getShareImg()
      });
      base.hideLoading();
    });
  }

  function addListener() {
    $("#rateBtn").click(function() {
      if (!base.isLogin()) {
        base.confirm("您还未登录，无法投票。<br/>点击确认前往登录").then(() => {
          base.goLogin();
        }, () => {});
      } else {
        location.href = '../notice/rating.html';
      }
    });
    $("#joinBtn").click(function() {
      location.href = './join.html?code=' + code;
    });
  }
});
