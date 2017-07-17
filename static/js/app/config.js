var SYSTEM_USERID = 'SYS_USER_YAOCHENG';
var SYSTEM_CODE = "CD-ZWZJ000012";
var COMPANYCODE = "CD-ZWZJ000012";
var PIC_PREFIX = 'http://oq4vi26fi.bkt.clouddn.com/';

// (function() {
//     // 判断是否登录
//     if (!/\/redirect\.htm/.test(location.href)) {
//         var arr,
//             reg = new RegExp("(^| )userId=([^;]*)(;|$)"),
//             userId,
//             userReferee = "";
//         if (arr = document.cookie.match(reg))
//             userId = unescape(arr[2]);
//         // 未登录
//         if (!userId) {
//             var reg = new RegExp("(^|&)userReferee=([^&]*)(&|$)", "i");
//             var r = window.location.search.substr(1).match(reg);
//             if (r != null)
//                 userReferee = decodeURIComponent(r[2]);
//             sessionStorage.setItem("userReferee", userReferee);
//             sessionStorage.setItem("l-return", location.pathname + location.search);
//             location.replace("../user/redirect.htm");
//         }
//     }
// })()
