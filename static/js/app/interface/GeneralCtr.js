define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 获取微信sdk初始化的参数
        getInitWXSDKConfig() {
            return Ajax.get("807910", {
                url: location.href.split('#')[0]
            }, true);
        },
        // 获取appId
        getAppId() {
            return Ajax.get("806031", {
                account: "ACCESS_KEY",
                type: "3"
            }, true);
        },
        // 发送短信
        sendCaptcha(bizType, mobile, sendCode = '805904') {
            return Ajax.post(sendCode, {
                bizType,
                mobile,
                "kind": "f1"
            });
        },
        // 获取转化汇率
        getTransRate(fromCurrency, toCurrency) {
            return Ajax.get("002051", {
                fromCurrency,
                toCurrency
            });
        },
        /**
         * 分页查询系统公告
         * @param config {start, limit}
         */
        getPageSysNotice(config, refresh) {
            return Ajax.get("804040", {
                "pushType": 41,
                "toKind": 1,
                "channelType": 4,
                "status": 1,
                "fromSystemCode": SYSTEM_CODE,
                ...config
            }, refresh);
        },
        // 查询数据字典列表
        getDictList(parentKey, code = "807706"){
            return Ajax.get(code, {parentKey});
        },
        // 查询user系统参数
        getUserSysConfig(ckey){
            return Ajax.get("807717", {ckey});
        },
        // 查询account系统参数
        getAccountSysConfig(key){
            return Ajax.get("802027", {key});
        },
        // 查询业务系统参数
        getBizSysConfig(ckey){
            return Ajax.get("622917", {ckey});
        },
        // 查询banner列表
        getBanner(refresh){
            return Ajax.get("806051", {
                type: "2"
            }, refresh);
        },
        /**
         * 分页查询评论的key列表
         * @param config {start, limit}
         */
        getPageRatekey(config, refresh) {
            return Ajax.get("622915", {
                type: 2,
                ...config
            }, refresh);
        },
        // 评论
        rating(orderCode, content, itemScoreList) {
            return Ajax.post("622140", {
                orderCode,
                content,
                itemScoreList,
                commer: base.getUserId()
            });
        }
    };
})
