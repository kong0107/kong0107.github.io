'use strict';
var querystring = require('querystring');

/**
* @summary Output a link that will warn the user about the obscene target.
*/
module.exports = function(url) {
    return "http://kong0107.github.io/misc/redirect.html?obscenity=on&restricted=on&url=" + querystring.escape(url);
}
