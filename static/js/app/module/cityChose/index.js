define([
  'jquery',
  'node_modules/better-scroll/build/bscroll.min'
], function($, BScroll) {
  var tmpl = __inline("index.html");
  var css = __inline("index.css");
  $("head").append('<style>'+css+'</style>');
  var defaultOption = {};
  var shortcutList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K',
   'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];
  var cityInfos = {};
  var wrapper, mainCont, cutCont, fixedCont, fixedTitle, listGroup;
  var listHeight, scroll, currentIndex = 0, fixedTop = 0, touch = {};
  var ANCHOR_HEIGHT = 0;
  var TITLE_HEIGHT = 0;

  function _hasContent() {
    return !!$("#cityChoseWrapper").length;
  }

  function updatePos(newY) {
    // 当滚动到顶部，newY>0
    if (newY > 0) {
      currentIndex = 0;
      fixedTitle.text('').hide();
      activeCutItem();
      return;
    }
    // 在中间部分滚动
    for (let i = 0; i < listHeight.length - 1; i++) {
      let height1 = listHeight[i];
      let height2 = listHeight[i + 1];
      if (-newY >= height1 && -newY < height2) {
        currentIndex = i;
        fixedTitle.text(shortcutList[currentIndex]).show();
        activeCutItem();
        diff(height2 + newY);
        return;
      }
    }
    // 当滚动到底部，且-newY大于最后一个元素到上限
    currentIndex = listHeight.length - 2;
    fixedTitle.text(shortcutList[currentIndex]).show();
    activeCutItem();
  }

  function diff(newVal) {
    let _fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
    if (fixedTop === _fixedTop) {
      return;
    }
    fixedTop = _fixedTop;
    fixedCont.style.transform = `translate3d(0,${fixedTop}px,0)`;
  }

  function _calculateHeight() {
    listHeight = [];
    const list = listGroup;
    let height = 0;
    listHeight.push(height);
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      height += item.clientHeight;
      listHeight.push(height);
    }
  }

  function _buildContent(data) {
    for(var i = 0; i < data.length; i++) {
      let prov = data[i];
      if (prov.sub) {
        for(var j = 0; j < prov.sub.length; j++) {
          let city = prov.sub[j];
          if (city.sort) {
            if (!cityInfos[city.sort]) {
              cityInfos[city.sort] = [];
            }
            cityInfos[city.sort].push({
              name: city.name,
              prov: prov.name,
              city: city.name,
              area: ''
            });
          }
          if (city.sub) {
            for(var k = 0; k < city.sub.length; k++) {
              let area = city.sub[k];
              if (area.sort) {
                if (!cityInfos[area.sort]) {
                  cityInfos[area.sort] = [];
                }
                cityInfos[area.sort].push({
                  name: area.name,
                  prov: prov.name,
                  city: city.name,
                  area: area.name
                });
              }
            }
          }
        }
      }
    }
    var cutHtml = '', cityHtml = '';
    for(var i = 0; i < shortcutList.length; i++) {
      let key = shortcutList[i];
      cutHtml += `<li data-index="${i}" class="item ${i===0?'active':''}">${key}</li>`;
      cityHtml += `<li data-index="${i}" class="list-group">
        <h2 class="list-group-title">${key}</h2><ul>`;
      for(var j = 0; j < cityInfos[key].length; j++) {
        let info = cityInfos[key][j];
        cityHtml += `<li class="list-group-item" prov="${info.prov}" city="${info.city}" area="${info.area}">
          <span class="name">${info.name}</span>
        </li>`;
      }
      cityHtml += '</ul></li>';
    }
    mainCont.html(cityHtml);
    cutCont.html(cutHtml);
  }

  function onShortcutTouchStart(e) {
    let anchorIndex = e.target.getAttribute('data-index');
    let firstTouch = e.originalEvent.targetTouches[0];
    touch.y1 = firstTouch.pageY;
    touch.anchorIndex = anchorIndex;
    _scrollTo(anchorIndex);
  }

  function onShortcutTouchMove(e) {
    e.stopPropagation();
    e.preventDefault();
    let firstTouch = e.originalEvent.changedTouches[0];
    touch.y2 = firstTouch.pageY;
    let delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0;
    let anchorIndex = +touch.anchorIndex + delta;
    _scrollTo(anchorIndex);
  }

  function _scrollTo(index) {
    if (!index && index !== 0) {
      return;
    }
    if (index < 0) {
      index = 0;
    } else if (index > listHeight.length - 2) {
      index = listHeight.length - 2;
    }
    updatePos(-listHeight[index]);
    scroll.scrollToElement(listGroup[index], 0);
  }

  function activeCutItem() {
    cutCont.find('.item.active').removeClass('active').end().find('.item').eq(currentIndex).addClass('active');
  }

  const CITY_CHOSE = {
    addCont: function (option) {
      if(!_hasContent()){
        option = option || {};
        defaultOption = $.extend(defaultOption, option);
        var cont = $(tmpl);
        $("body").append(cont);
        wrapper = cont.find('.chose-scroll')[0];
        mainCont = cont.find('.main-content');
        cutCont = cont.find('.list-shortcut');
        fixedCont = cont.find('.list-fixed')[0];
        fixedTitle = cont.find('.list-fixed').find('.fixed-title');
        defaultOption.data && _buildContent(defaultOption.data);
        listGroup = mainCont.find('.list-group');
        cont.find('.module-icon-close').on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          defaultOption.close && defaultOption.close();
          CITY_CHOSE.hideCont();
        });
        cont.on('click', '.list-group-item', function() {
          var self = $(this);
          defaultOption.chose && defaultOption.chose(self.text(), self.attr('prov'), self.attr('city'), self.attr('area'));
          CITY_CHOSE.hideCont();
        });
        cutCont.on('touchstart', onShortcutTouchStart).on('touchmove', onShortcutTouchMove);
        scroll = new BScroll(wrapper, {
          probeType: 3,
          click: true
        });
        scroll.on('scroll', (pos) => {
          updatePos(pos.y);
        });
      }
      return this;
    },
    showCont: function() {
      if(_hasContent()){
        $("#cityChoseWrapper").show().animate({
          top: 0
        }, 200, function() {
          scroll.refresh();
          if (!listHeight) {
            setTimeout(() => {
              if (!TITLE_HEIGHT) {
                TITLE_HEIGHT = mainCont.find('.list-group-title')[0].offsetHeight;
                ANCHOR_HEIGHT = cutCont.find('li')[0].offsetHeight;
              }
              _calculateHeight();
            }, 20);
          }
        });
      }
      return this;
    },
    hideCont: function(){
      var wrap = $("#cityChoseWrapper");
      wrap.animate({
        top: "100%"
      }, 200, function() {
        wrap.hide();
      });
      return this;
    }
  };

  return CITY_CHOSE;
});
