'use strict';
var hexoUtil = require('hexo-util');
var r18 = require('./r18');

/**
* @summary Show Contact info
* @description output a HTML table if no argument; output a link image if with argument
* @example
*   {% showContact [social_net [text]] %}
*/
hexo.extend.tag.register('showContact', function(args) {
    var sls = hexo.locals.get("data").social_links;

    if(args.length && sls.hasOwnProperty(args[0])) {
        var id = args[0];
        return hexoUtil.htmlTag("a",
            Object.assign(makeAttr(sls[id]), {"class": "icon"}),
            hexoUtil.htmlTag("img", {
                "alt": sls[id].site,
                "class": "brand-icon",
                "src": "/images/brand_icons/" + id + ".png"
            })
            + ((args.length > 1) ? args[1] : "")
        );
    }

    var thead = '<tr><th scope="col" class="ta-center">平臺</th><th scope="col">帳號</th></tr>';
    var tbody = "";

    for(var id in sls) {
        var attr = makeAttr(sls[id]);
        tbody += "<tr>"
            + "<td class=\"ta-right\">" + hexoUtil.htmlTag("a", {name: id}, sls[id].site) + "</td>"
            + "<td>" + hexoUtil.htmlTag("a", attr, sls[id].account) + "</td>"
        + "</tr>";
    }

    return '<table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
});

function makeAttr(sl) {
    return sl.restricted
        ? {href: r18(sl.url), title: "猥褻連結", class: "restricted-warning"}
        : {href: sl.url, title: sl.site + ": " + sl.account}
    ;
}
