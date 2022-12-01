'use strict';
var hexoUtil = require('hexo-util');
var r18 = require('./r18');

/**
* @summary Link tag to restricted webpage.
* @example
*   {% r18 text url %}
* @see {@link https://github.com/hexojs/hexo/blob/master/lib/plugins/tag/link.js}
*/
hexo.extend.tag.register('r18', function(args) {
  var url = args.pop();
  var text = args.length ? args[0] : url;
  return hexoUtil.htmlTag("a", {target: "_blank", href: r18(url)}, text, false);
});

hexo.extend.helper.register('r18', r18);
