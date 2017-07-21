define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /*
         * 分页查询私教
         * config: {start, limit, ...}
         */
        getPageCoach(config, refresh) {
            return Ajax.get("622095", {
                status: 1,
                ...config
            }, refresh);
        },
        // 详情查询私教
        getCoach(code, refresh) {
            return Ajax.get("622096", {code}, refresh);
        },
        // 详情查询私教（带有私课和评论）
        getCoachAndComment(code, refresh) {
            return Ajax.get("622094", {code}, refresh);
        },
        /**
         * 分页查询评论
         * @param config {start, limit, coachCode}
         */
        getPageComment(config, refresh) {
            return Ajax.get("622145", {
                status: "AB",
                ...config
            });
        },
        /**
         * 提交私课订单
         * @param config {address, mobile, perCourseCode, quantity}
         */
        applyOrder(config) {
            return Ajax.post("622120", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        // 取消订单
        cancelOrder(orderCode) {
            return Ajax.post("622125", {
                orderCode,
                updater: base.getUserId()
            });
        },
        /**
         * 分页查询私教订单
         * @param config {start, limit, status}
         */
        getPageOrders(config, refresh) {
            return Ajax.get("622130", {
                applyUser:  base.getUserId(),
                ...config
            }, refresh);
        },
        // 详情查询私课订单
        getOrder(code, refresh) {
            return Ajax.get("622131", {code}, refresh);
        },
        // 支付私课订单
        payOrder(orderCode, payType) {
            return Ajax.post("622121", {
                orderCode,
                payType
            });
        }
    };
})
