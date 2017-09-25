define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询私教
         * @param config: {start, limit, ...}
         */
        getPageCoach(config, refresh) {
            return Ajax.get("622095", {
                status: 3,
                type: 0,
                orderColumn: 'teach_num',
                orderDir: 'desc',
                ...config
            }, refresh);
        },
        /**
         * 分页查询私教(带有筛选)
         * @param config: {start, limit, skCycle, ...}
         */
        getPageFilterCoach(config, refresh) {
            return Ajax.get("622093", {
                status: 3,
                type: 0,
                orderColumn: 'teach_num',
                orderDir: 'desc',
                ...config
            }, refresh);
        },
        /**
         * 分页查询达人
         * @param config: {start, limit, ...}
         */
        getPageTalent(config, refresh) {
            return Ajax.get(622095, {
                status: 3,
                type: 1,
                orderColumn: 'teach_num',
                orderDir: 'desc',
                ...config
            }, refresh);
        },
        /**
         * 分页查询达人(带有筛选)
         * @param config: {start, limit, skCycle, ...}
         */
        getPageFilterTalent(config, refresh) {
            return Ajax.get("622093", {
                status: 3,
                type: 1,
                orderColumn: 'teach_num',
                orderDir: 'desc',
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
        // 详情查询评论
        getComment(code, refresh) {
            return Ajax.get("622146", {code}, refresh);
        },
        // 查询私教的评分
        getCoachRating(coachCode) {
            return Ajax.get("622147", {
                coachCode
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
                type: 0,
                orderColumn: "apply_datetime",
                orderDir: "desc",
                ...config
            }, refresh);
        },
        /**
         * 分页查询达人订单
         * @param config {start, limit, status}
         */
        getPageTalentOrders(config, refresh) {
            return Ajax.get("622130", {
                applyUser:  base.getUserId(),
                type: 1,
                orderColumn: "apply_datetime",
                orderDir: "desc",
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
