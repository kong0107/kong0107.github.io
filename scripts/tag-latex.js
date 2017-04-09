'use strict';
var hexoUtil = require('hexo-util');
var querystring = require('querystring');

/**
* @summary Render latex codes by CodeCogs
* @example
*   {% latex [[CLASS] HUMAN_READABLE] %}
*       FORMULA
*   {% endlatex %}
* @example
*   {% latex block "sum k^2 from k=1 to n" %}
*       \sum_{k=1}^{n}k^2=\frac{n(n+1)(2n+1)}{6}
*   {% endlatex %}
* @see {@link https://www.codecogs.com/eqnedit.php}
*/
hexo.extend.tag.register('latex', function(args, content) {
    content = content.trim();
    var formula = translate(content);
    /*var formula = content;
    for(var t in synonyms)
        formula = formula.replace(synonyms[t], "\\" + t);
    return formula;*/

    var escaped = querystring.escape(formula);
    var href = "https://www.codecogs.com/eqnedit.php?latex=" + escaped;
    var src = "http://latex.codecogs.com/gif.latex?" + escaped;

    var className = "", alt;
    switch(args.length) {
        case 0:
            alt = content;
            break;
        case 1:
            alt = args[0];
            break;
        case 2:
        default:
            className += args[0];
            alt = args[1];
            break;
    }
    if(!className) className = "inline-block";
    className += " formula";

    return hexoUtil.htmlTag(
        "span",
        {class: className},
        hexoUtil.htmlTag(
            "a",
            {target: "_blank", rel: "external", href: href},
            hexoUtil.htmlTag(
                "img",
                {src: src, alt: alt}
            )
        )
    );
}, {ends: true});

/**
 * @summary Array mapping from human readable string to latex notation
 * @see {@link https://en.wiktionary.org/wiki/Appendix:Unicode/Mathematical_Operators}
 */
var synonyms = {
    "leq": ["<=", "\u2264", "\u2266", "\u2A7D"],
    "geq": [">=", "\u2265", "\u2267", "\u2A7E"]
};
for(var t in synonyms)
    synonyms[t] = new RegExp(synonyms[t].join("|"), "g");

function translate(str) {
    for(var t in synonyms)
        str = str.replace(synonyms[t], "\\" + t + " ");
    ///^ 後面不補空格的話，遇到後面緊接著英文字母時即會有錯。例如 "0<=x" 變成 "0\leqx" ，可是 LaTeX 並沒有 \leqx 符號。
    return str;
}
