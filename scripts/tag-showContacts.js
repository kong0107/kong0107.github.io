'use strict';
var hexoUtil = require('hexo-util');
var r18 = require('./r18');

/**
* @summary Facebook Post Tag
* @description FB JS SDK must be included in the front-end first and specified to the specified app ID. Otherwise this will be just a blockquote.
* @see {@link https://developers.facebook.com/docs/plugins/embedded-posts}
* @example
*   {% fbpost link [author [date]] %}
*   Quote string
*   {% endfbpost %}
*/
hexo.extend.tag.register('showContacts', function() {
    var thead = '<tr><th scope="col" class="ta-center">平臺</th><th scope="col">帳號</th></tr>';
    var tbody = "";

    var sls = hexo.locals.get("data").social_links;
    for(var id in sls) {
        var attr = sls[id].restricted
            ? {href: r18(sls[id].url), title: "猥褻連結", class: "restricted-warning"}
            : {href: sls[id].url}
        ;
        tbody += "<tr>"
            + "<td class=\"ta-right\">" + hexoUtil.htmlTag("a", {name: id}, sls[id].site) + "</td>"
            //+ "<td>" + (sls[id].logo ? hexoUtil.htmlTag("img", {alt: sls[id].site, src: hexo.config.root + "images/brand_icons/" + id + ".png", style: "width: 1.5rem"}) : "") + "</td>"
            + "<td>" + hexoUtil.htmlTag("a", attr, sls[id].account) + "</td>"
        + "</tr>";
    }

    return '<table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
});
