define([
  'jquery',
  'app/module/validate',
  'app/module/loading',
  'app/module/smsCaptcha',
  'app/interface/UserCtr'
], function($, Validate, loading, smsCaptcha, UserCtr) {
  var tmpl = __inline("index.html");
  var defaultOpt = {};
  var first = true;

  function changeMobile() {
    loading.createLoading("绑定中...");
    UserCtr.changeMobile($("#change-mobileSms").val(), $("#change-smsCaptcha").val())
      .then(function() {
        loading.hideLoading();
        BMobile.hideMobileCont(defaultOpt.success);
      }, function(error) {
        defaultOpt.error && defaultOpt.error(error || "手机号绑定失败");
      });
  }
  var BMobile = {
    addMobileCont: function(option) {
      option = option || {};
      defaultOpt = $.extend(defaultOpt, option);
      if (!this.hasMobileCont()) {
        var temp = $(tmpl);
        $("body").append(tmpl);
      }
      var wrap = $("#changeMobileSmsWrap");
      var that = this;
      if (first) {
        wrap.find(".right-left-cont-title").on("touchmove", function(e) {
          e.preventDefault();
        });
        wrap.find(".right-left-cont-back").on("click", function(){
          that.hideMobileCont();
        });
        $("#change-mobile-btnSms")
          .on("click", function() {
            if ($("#change-mobile-formSms").valid()) {
              changeMobile();
            }
          });
        $("#change-mobile-formSms").validate({
          'rules': {
            "change-smsCaptcha": {
              sms: true,
              required: true
            },
            "change-mobileSms": {
              required: true,
              mobile: true
            }
          },
          onkeyup: false
        });
        smsCaptcha.init({
          checkInfo: function() {
            return $("#change-mobileSms").valid();
          },
          bizType: "805047",
          id: "change-getVerification",
          mobile: "change-mobileSms"
        });
      }

      first = false;
      return this;
    },
    hasMobileCont: function() {
      if (!$("#changeMobileSmsWrap").length)
        return false
      return true;
    },
    showMobileCont: function() {
      if (this.hasMobileCont()) {
        var wrap = $("#changeMobileSmsWrap");
        wrap.css("top", $(window).scrollTop() + "px");
        wrap.show().animate({
          left: 0
        }, 200, function() {
          defaultOpt.showFun && defaultOpt.showFun();
        });

      }
      return this;
    },
    hideMobileCont: function(func) {
      if (this.hasMobileCont()) {
        var wrap = $("#changeMobileSmsWrap");
        wrap.animate({
          left: "100%"
        }, 200, function() {
          wrap.hide();
          func && func($("#change-mobileSms").val(), $("#change-smsCaptcha").val());
          $("#change-mobileSms").val("");
          $("#change-smsCaptcha").val("");
          wrap.find("label.error").remove();
        });
      }
      return this;
    }
  }
  return BMobile;
});
