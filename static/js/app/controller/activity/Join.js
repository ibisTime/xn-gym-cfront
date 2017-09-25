define([
  'app/controller/base',
  'app/module/validate',
  'app/module/qiniu',
  'app/module/picker',
  'app/interface/ActivityCtr'
], function(base, Validate, qiniu, picker, AcitvityCtr) {
  var code = base.getUrlParam('code');
  var choseType = 0;
  const TALENT = 'TALENT', COACH = 'COACH';
  const PDF = 'PDF', ADV_PIC = 'ADV_PIC';
  var SUFFIX = "?imageMogr2/auto-orient/thumbnail/!200x200r";
  var token;

  init();

  function init() {
    base.showLoading();
    qiniu.getQiniuToken().then((data) => {
      base.hideLoading();
      token = data.uploadToken
    });
    addListener();
  }
  // 初始化身份证、证件照、健身照片上传控件
  function initPdf(bType, type) {
    var _pdfFile, btnId, containerId, count = 0;
    if (bType === PDF) {
      if (type === COACH) {
        _pdfFile = $('#cPdfFile');
        btnId = 'cPdfFile';
        containerId = 'cPdfWrapper';
      } else {
        _pdfFile = $('#tPdfFile');
        btnId = 'tPdfFile';
        containerId = 'tPdfWrapper';
      }
    } else {
      if (type === COACH) {
        _pdfFile = $('#cAdvPicFile');
        btnId = 'cAdvPicFile';
        containerId = 'cAdvPicWrapper';
      } else {
        _pdfFile = $('#tAdvPicFile');
        btnId = 'tAdvPicFile';
        containerId = 'tAdvPicWrapper';
      }
    }
    qiniu.uploadInit({
      token,
      btnId,
      containerId,
      multi_selection: false,
      showUploadProgress: function(up, file){
        $('#' + file.id).find('.progress-text').text(parseInt(file.percent, 10) + '%');
      },
      fileAdd: function(file, up){
        count++;
        var _img = $(getInitImgHtml(file));
        (function(_img, file){
          _img.find('.close-icon').on('click', function (e) {
            count--;
            up.removeFile(file);
            _img.remove();
            var pics = _pdfFile.data('pic').split('||');
            pics.splice(pics.indexOf(file.id), 1);
            pics = pics.length ? pics.join('||') : '';
            _pdfFile.data('pic', pics);
            hideOrShowContainer(bType, type, count, containerId);
          });
        })(_img, file)
        _img.insertBefore('#' + containerId);
        hideOrShowContainer(bType, type, count, containerId);
      },
      fileUploaded: function(up, url, key, file){
        $("#" + file.id).find('.img-content').html(`<img src="${url + SUFFIX}"/>`);
        var pic = _pdfFile.data('pic');
        pic = pic ? pic + '||' + key : key;
        _pdfFile.data('pic', pic);
      }
    });
  }

  function getInitImgHtml(file) {
    return `<div class="img" id="${file.id}">
              <div class="img-content">
                <div class="progress-infos">
                  <h2>上传中...</h2>
                  <div class="progress-text">0%</div>
                </div>
              </div>
              <i class="close-icon"></i>
            </div>`;
  }

  function initPicker(id) {
      picker.init({
          id,
          select: function(prov, city, area) {
              var _nameEl = $(id);
              _nameEl.val(prov + ' ' + city + ' ' + area);
              _nameEl.attr("data-prv", prov);
              _nameEl.attr("data-city", city);
              _nameEl.attr("data-area", area);
          }
      });
  }

  function hideOrShowContainer(bType, type, count, containerId) {
    var _container = $('#' + containerId);
    if (bType === PDF) {
      if (type === COACH) {
        if (count >= 1) {
          _container.css({
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          _container.css({
            'visibility': 'visible',
            'position': 'relative'
          });
        }
      } else {
        if (count >= 2) {
          $('#' + containerId).css({
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          _container.css({
            'visibility': 'visible',
            'position': 'relative'
          });
        }
      }
    } else {
      if (type === COACH) {
        if (count >= 3) {
          $('#' + containerId).css({
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          _container.css({
            'visibility': 'visible',
            'position': 'relative'
          });
        }
      } else {
        if (count >= 5) {
          $('#' + containerId).css({
            'visibility': 'hidden',
            'position': 'absolute'
          });
        } else {
          _container.css({
            'visibility': 'visible',
            'position': 'relative'
          });
        }
      }
    }
  }

  function getCityInfo(param, id) {
    var province = $(id);
    var prov = province.attr('data-prv');
    if (!prov) {
        base.showMsg('授课区域不能为空');
        return;
    }
    var city = province.attr('data-city');
    var area = province.attr('data-area');
    param.province = prov;
    param.city = city;
    param.area = area;
    joinByInfos(param);
  }

  function addListener() {
    // 教练form
    var _coachForm = $('#coachForm');
    _coachForm.validate({
      rules: {
        realName: {
          required: true,
          isNotFace: true,
          maxlength: 20
        },
        mobile: {
          required: true,
          mobile: true
        },
        gender: {
          required: true
        },
        age: {
          required: true,
          "Z+": true
        },
        duration: {
          required: true,
          "Z+": true
        },
        address: {
          required: true,
          maxlength: 100
        }
      }
    });

    // 达人form
    var _talentForm = $('#talentForm');
    _talentForm.validate({
      rules: {
        realName: {
          required: true,
          isNotFace: true,
          maxlength: 20
        },
        mobile: {
          required: true,
          mobile: true
        },
        gender: {
          required: true
        },
        age: {
          required: true,
          "Z+": true
        },
        duration: {
          required: true,
          "Z+": true
        },
        address: {
          required: true,
          maxlength: 100
        }
      }
    });

    // 已经是达人或私教form
    var _specForm = $('#specForm');
    _specForm.validate({
      rules: {
        loginName: {
          required: true,
          mobile: true
        },
        loginPwd: {
          required: true,
          maxlength: 16,
          minlength: 6,
          isNotFace: true
        }
      }
    });

    // 选择教练或达人
    $('#joinItems').on('click', '.join-item', function() {
      var _self = $(this);
      _self.addClass('active').siblings('.active').removeClass('active');
      choseType = _self.index();
    });

    var _choseWrapper = $('#choseWrapper');
    var _coachWrapper = $('#coachWrapper');
    var _talentWrapper = $('#talentWrapper');
    var _specWrapper = $('#specWrapper');
    // 点击填写基础信息
    $('#goWriteBtn').click(function() {
      var name = choseType ? '达人' : '教练';
      base.confirm('您是否已经是' + name + '?', '否', '是').then(() => {
        _choseWrapper.addClass('hidden');
        _specWrapper.removeClass('hidden');
      }, () => {
        _choseWrapper.addClass('hidden');
        if (choseType) {
          _talentWrapper.removeClass('hidden');
          initPdf(PDF, TALENT);
          initPdf(ADV_PIC, TALENT);
          initPicker('#talentProvince');
        } else {
          _coachWrapper.removeClass('hidden');
          initPdf(PDF, COACH);
          initPdf(ADV_PIC, COACH);
          initPicker('#coachProvince');
        }
      });
    });

    // 已经是教练或达人点击参加
    $('#specSubmitBtn').click(function() {
      _specForm.valid() && joinByMobile(_specForm.serializeObject());
    });
    // 达人点击参加
    $('#talentSubmitBtn').click(function() {
      if (_talentForm.valid()) {
        var param = _talentForm.serializeObject();
        getCityInfo(param, '#talentProvince');
      }
    });
    // 教练点击参加
    $('#coachSubmitBtn').click(function() {
      if (_coachForm.valid()) {
        var param = _coachForm.serializeObject();
        getCityInfo(param, '#coachProvince');
      }
    });
  }

  // 参与(已经是教练或达人)
  function joinByMobile(params) {
    params.kind = choseType ? 'f3' : 'f2';
    params.activityCode = code;
    base.showLoading("提交中...");
    AcitvityCtr.joinByMobile(params).then((data) => {
      base.hideLoading();
      base.showMsg('申请提交成功');
      setTimeout(() => {
        history.back();
      }, 1000);
    });
  }

  // 参加(还不是教练或达人)
  function joinByInfos(params) {
    params.activityCode = code;
    if (choseType) {
      var pdf = $('#tPdfFile').data('pic');
      if (!pdf) {
        base.showMsg('身份证照片不能为空');
        return;
      }
      params.pdf = pdf;
      var advPic = $('#tAdvPicFile').data('pic');
      if (!advPic) {
        base.showMsg('健身照片不能为空');
        return;
      }
      params.advPic = advPic;
    } else {
      var pdf = $('#cPdfFile').data('pic');
      if (!pdf) {
        base.showMsg('教练资格证书不能为空');
        return;
      }
      params.pdf = pdf;
      var advPic = $('#cAdvPicFile').data('pic');
      if (!advPic) {
        base.showMsg('健身照片不能为空');
        return;
      }
      params.advPic = advPic;
    }
    base.showLoading("提交中...");
    AcitvityCtr.joinByInfos(params).then((data) => {
      base.hideLoading();
      base.showMsg('申请提交成功');
      setTimeout(() => {
        history.back();
      }, 1000);
    });
  }

});
