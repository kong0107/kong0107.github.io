'use strict';
var hexoUtil = require('hexo-util');

/**
* @summary Facebook Post Tag without texts
* @description FB JS SDK must be included in the front-end first and specified to the specified app ID. Otherwise this will be just a link.
* @see {@link https://developers.facebook.com/docs/plugins/embedded-posts}
* @example
*   {% fbphoto link %}
*/
hexo.extend.tag.register('fbphoto', function(args) {
    var link = args[0];
    // return hexoUtil.htmlTag('a', {href: link}, link);
    return hexoUtil.htmlTag(
        "div", {
            "class": "fb-post",
            "data-href": link,
            "data-show-text": "false"
        },
        hexoUtil.htmlTag(
            "blockquote", {
                "cite": link,
                "class": "fb-xfbml-parse-ignore"
            },
            hexoUtil.htmlTag(
                "a", {
                    "rel": "external",
                    "href": link
                }, link, false
            ), false
        ), false
    );
});
