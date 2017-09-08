define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询活动
         * @param config {start, limit, ...}
         */
        getPageActivities(config, refresh) {
            return Ajax.get("622020", {
                status: 1,
                orderColumn: "order_no",
                orderDir: "asc",
                type: 1,
                ...config
            }, refresh);
        },
        // 详情查询活动
        getActivity(code, refresh) {
            return Ajax.get("622021", {code});
        },
        /**
         * 提交活动订单
         * @param config {activityCode, mobile, applyNote, quantity}
         */
        applyOrder(config) {
            return Ajax.post("622030", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        // 支付活动订单
        payOrder(orderCode, payType) {
            return Ajax.post("622031", {
                orderCode,
                payType
            });
        },
        // 用户取消订单
        cancelOrder(orderCode) {
            return Ajax.post("622032", {
                orderCode,
                applyUser: base.getUserId()
            });
        },
        /**
         * 分页查询活动订单
         * @param config {start, limit, status}
         */
        getPageOrders(config, refresh) {
            return Ajax.get("622042", {
                applyUser:  base.getUserId(),
                orderColumn: "apply_datetime",
                orderDir: "desc",
                ...config
            }, refresh);
        },
        // 详情查询订单
        getOrder(code, refresh) {
            return Ajax.get("622041", {code})
        },
        // 用户申请退款
        refundOrder(orderCode) {
            return Ajax.post("622034", {
                orderCode,
                applyUser: base.getUserId()
            });
        },
        /***教练和达人端的热门活动***/
        /**
         * 分页查询活动
         * @param config {start, limit, ...}
         */
        getPageSpecActivities(config, refresh) {
            return Ajax.get("622020", {
                status: 1,
                orderColumn: "order_no",
                orderDir: "asc",
                type: 0,
                ...config
            }, refresh);
        },
        /**
         * 通过手机号和密码参与活动
         * @param config {loginName, loginPwd, kind, activityCode}
         */
        joinByMobile(config) {
            return Ajax.post('622220', config);
        },
        /**
         * 通过填写信息参与活动
         * @param config {realName, mobile, gender, duration, pdf, advPic, address, activityCode}
         */
        joinByInfos(config) {
            return Ajax.post('622221', config);
        },
        /**
         * 分页查询活动参与者
         * @param config {start, limit, type}
         */
        getPageJoiners(config, refresh) {
            return Ajax.get('622230', {
              coachStatus: 1,
              activityStatus: 1,
              userId: base.getUserId(),
              orderColumn: 'order_no',
              orderDir: 'asc',
              ...config
            }, refresh);
        },
        // 投票
        ratingActivity(attendCode) {
            return Ajax.post('622240', {
                attendCode,
                userId: base.getUserId()
            });
        }
    };
})
