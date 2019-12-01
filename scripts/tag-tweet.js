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

  const content = hexoUtil.htmlTag(
    "blockquote",
    {"class": "twitter-tweet"},
    hexoUtil.htmlTag("p", content) + hexoUtil.htmlTag("a", {href: url}, '&mdash; ' + author)
  );
  const script = hexoUtil.htmlTag(
    "script", {
      "async": true,
      "src": "https://platform.twitter.com/widgets.js",
      "charset": "utf-8"
    }
  );

  return hexoUtil.htmlTag("div", {}, content + script);



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
