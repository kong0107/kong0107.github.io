'use strict';
var hexoUtil = require('hexo-util');

/**
* @summary Facebook Post Tag
* @description FB JS SDK must be included in the front-end first and specified to the specified app ID. Otherwise this will be just a blockquote.
* @see {@link https://developers.facebook.com/docs/plugins/embedded-posts}
* @example
*   {% fbpost link [author [date]] %}
*   Quote string
*   {% endfbpost %}
*/
hexo.extend.tag.register('fbpost', function(args, content) {
  var link = args[0];
  var author = args.length > 1 ? args[1] : null;
  var date = args.length > 2 ? args[2] : null;

  var footer = author
    ? hexoUtil.htmlTag("a", {href: link, rel: "author"}, author)
    : hexoUtil.htmlTag("a", {href: link}, link)
  ;

  if(date) footer += hexoUtil.htmlTag("time", {datetime: date}, date);

  footer = hexoUtil.htmlTag("address", {}, footer);
  footer = hexoUtil.htmlTag("footer", {}, footer);

  var result = hexo.render.renderSync({text: content, engine: 'markdown'});
  result = hexoUtil.htmlTag("blockquote", {
    "class": "fb-xfbml-parse-ignore",
    "cite": link
  }, result + footer);
  result = hexoUtil.htmlTag("div", {
    "class": "fb-post",
    "data-href": link,
    "data-show-text": true
  }, result);

  return result;

}, {ends: true});
