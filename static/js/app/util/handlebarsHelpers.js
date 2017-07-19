define(['Handlebars'], function(Handlebars) {
    Handlebars.registerHelper('formatMoney', function(num, options) {
        if (!num && num !== 0)
            return "--";
        num = +num / 1000;
        num = (num + "").replace(/^(\d+\.\d\d)\d*/i, "$1");
        return (+ num).toFixed(2);
    });
    Handlebars.registerHelper('formatImage', function(pic, isAvatar, options) {
        if (!pic)
            return "";
        pic = pic.split(/\|\|/)[0];
        if (/^http/.test(pic)) {
            return pic;
        }
        return PIC_PREFIX + pic;
    });
    Handlebars.registerHelper('formatDateTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm:ss");
    });
    Handlebars.registerHelper('formatDateTime1', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd hh:mm");
    });
    Handlebars.registerHelper('formatDate', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("yyyy-MM-dd");
    });
    Handlebars.registerHelper('formateTime', function(date, options) {
        if (!date)
            return "--";
        return new Date(date).format("hh:mm");
    });
    Handlebars.registerHelper('clearTag', function(des, options) {
        return des && des.replace(/(\<[^\>]+\>)|(\<\/[^\>]+\>)|(\<[^\/\>]+\/\>)/ig, "") || "";
    });

    Handlebars.registerHelper('safeString', function(text, options) {
        return new Handlebars.SafeString(text);
    });

    return Handlebars;
});
