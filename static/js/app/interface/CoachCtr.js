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
            // orderColumn
            // orderDir
            return Ajax.get("622095", {
                status: 1,
                ...config
            }, refresh);
        }
    };
})
