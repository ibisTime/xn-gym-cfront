define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /**
         * 分页查询课程
         * @param config {start, limit, location?}
         */
        getPageCourse(config, refresh) {
            return Ajax.get("622060", {
                status: 1,
                orderColumn: "order_no",
                orderDir: "asc",
                ...config
            }, refresh);
        },
        // 详情查询课程
        getCourse(code, refresh) {
            return Ajax.get("622061", {code}, refresh);
        },
        /**
         * 分页查询评论
         * @param config {start, limit, productCode}
         */
        getPageComment(config, refresh) {
            return Ajax.get("622145", {
                status: "AB",
                ...config
            });
        },
        /**
         * 提交课程订单
         * @param config {orgCourseCode, mobile, quantity, applyNote}
         */
        applyOrder(config) {
            return Ajax.post("622070", {
                applyUser: base.getUserId(),
                ...config
            });
        },
        // 取消订单
        cancelOrder(orderCode) {
            return Ajax.post("622072", {
                orderCode,
                applyUser: base.getUserId()
            });
        },
        /**
         * 分页查询团课订单
         * @param config {start, limit, status}
         */
        getPageOrders(config, refresh) {
            return Ajax.get("622080", {
                applyUser:  base.getUserId(),
                ...config
            }, refresh);
        },
        // 详情查询团课订单
        getOrder(code, refresh) {
            return Ajax.get("622081", {code}, refresh);
        },
        // 支付团课订单
        payOrder(orderCode, payType) {
            return Ajax.post("622071", {
                orderCode,
                payType
            });
        }
    };
})
