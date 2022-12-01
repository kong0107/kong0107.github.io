'use strict';
var hexoUtil = require('hexo-util');

/**
* @summary Tweet Tag
* @see {@link https://publish.twitter.com/}
* @example
*   {% tweet author tweetID %}
*   Quote string
*   {% endtweet %}
*/
hexo.extend.tag.register('tweet', function(args, content) {
  const author = args[0];
  const tid = args[1];

  const url = `https://twitter.com/${author}/status/${tid}?ref=twsrc%5Etfw`;

  content = hexoUtil.htmlTag(
    "blockquote",
    {"class": "twitter-tweet"},
    hexoUtil.htmlTag("p", {}, content, false) + hexoUtil.htmlTag("a", {href: url}, '&mdash; ' + author, false)
  );
  const script = hexoUtil.htmlTag(
    "script", {
      "async": true,
      "src": "https://platform.twitter.com/widgets.js",
      "charset": "utf-8"
    }, null, false
  );

  return hexoUtil.htmlTag("div", {}, content + script);
}, {ends: true});
