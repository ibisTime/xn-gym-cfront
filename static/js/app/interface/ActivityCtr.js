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
            // orderColumn, orderDir
            return Ajax.get("622020", {
                status: 1,
                ...config
            }, refresh);
        }
    };
})
