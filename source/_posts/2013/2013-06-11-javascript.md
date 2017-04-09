---
title: JavaScript 函式筆記
tags: 程式, 網站製作
from: http://kong0107.blogspot.tw/2013/06/javascript.html
---

喔要做法令易讀器於是翻了JavaScript的文章，筆記一些如下：

# 可省略的參數
```JavaScript
function abridgable(param1, param2) {
    if(typeof param2 == "undefined")
        param2 = "default value";
    return param1 + param2;
}
alert(abridgable("haha "));
```

# 變動引數數量
```JavaScript
function foo() {
    switch(arguments.length) {
    case 0: console.log("There is no arguments."); return;
    case 1: console.log("There's only one argument."); break;
    default: console.log(arguments.length + " arguments.");
    }
    var arg0 = arguments[0];
    console.log("The first argument is: " + arg0);
    /// 跟C系列的char *argv[0]不同，
    /// 第零個並不是程式／函數名稱，而是函數的第一個引數
}
```

# 把匿名函數指派給變數
```JavaScript
anony = function() {
    /// 相當於 function anony() { /* */ }
    /// 這只是函數的宣告，並不會執行
}
```

# 直接執行匿名參數
```JavaScript
result = (function() {
    /// 相當於「宣告後馬上執行」
    /// 因為是匿名，不用擔心函數名稱跟別人相同
})();
```

# 匿名函數的其他寫法
易混淆，不建議使用
```JavaScript
(function() {
    /// 這個寫法「一定」要加最外面的小括號
}());
result = function(){
    /// 或是一定得將執行結果馬上也丟給別的變數或函數
}();
```

# 用匿名函數回傳函數
```JavaScript
var arr = Array();
for(var i = 0; i < 10; ++i) {
    arr[i] = function() {
        var tmp = i; /// 指派後，tmp對於arr[x]即是固定的
        return function() {
            return tmp; /// 即使i變動了，tmp也不會變動
        }
    }();
}
```
若是直接return i; 那麼之後arr[3]()也只會得到10（即最後的i的值）


# 覆寫既存函數
以覆寫onLoad事件為例
```JavaScript
if(window.onload) old_onload = window.onload;
else old_onload = function(){};
window.onload = function() {
    old_onload();
    alert("頁面讀取完畢");
}
```

# 用匿名函數覆寫既存函數
幫parseInt()加上基本的中文對照
```JavaScript
parseInt = function() {
    var orig = parseInt;
    /// 區域變數不會真的消失，只是外部無法存取
    var chinese = "零一二三四五六七八九";
    return function() {
        var result = orig.apply(this, arguments);
        if(!isNaN(result)) return result;
        var str = arguments[0].replace(/\s/g, "");
        for(var i = 0; i < 10; ++i) {
            var re = new RegExp(chinese.charAt(i), "g");
            str = str.replace(re, String(i));
        }
        return orig(str, 10);
    }
}(); /// 注意是「用匿名函數回傳函數」的方式
alert(parseInt("七五三三九六七"));
```

# 用JSON宣告物件
```JavaScript
objA = {
    /// 在「只需要一個這樣的物件」時很好用
    var1: "public member variable",
    var2: "you can see it as attribute",
    func1: function() {
        /// member function
    },
    func2: function() {
        /// member function
    }
};
objA.var1 = "other value";
objA.func1(); /// 執行物件的成員函數
```

# 用匿名函數來回傳物件
```JavaScript
objB = function() {
    alert("objB");
    return { /// 同樣用JSON宣告物件
        var1: "public",
        func1: function() {
            alert("member function");
        }
    };
}(); /// 即「宣告後馬上執行」
```

# 不想用匿名函數的話當然也可以
```JavaScript
ClassB = function() { /// 想像成這就是建構子
    alert("constructor");
    return {
        var1: "public",
        func1: function() {
            alert("not constructor");
        }
    }
}
insB = ClassB();
insB2 = ClassB(); /// 也就方便宣告兩個以上相同結構的物件
```

***
以上應該夠用了，不過如果想要更多的話：

# 支援私有成員的物件
以「計數器」為例
```JavaScript
function ClassC() {
    var counter = 0; /// 私有變數，外部不能使用
    var logger = function() { /// 私有函數，外部不能呼叫
        console.log(counter);
    }
    return { /// 依舊回傳JSON
        name: "name",
        inc: function() {
            ++counter;    /// 公開函數可以存取私有變數
            logger(); /// 公開函數可以呼叫私有函數
            return counter;
        }
    }
}
insC = ClassC();
alert(insC.inc()); /// 相當於 alert(1);
insC.counter; /// undefined
insC.logger; /// undefined
insC.logger(); /// TypeError: Object has no method 'abc'

insC.logger = "lalala"; /// 這樣不會出錯
insC.inc(); /// 即使inc()所呼叫的logger()看似已被複寫，這樣也依舊可以執行
```

以上依舊可以用匿名函數的方式寫
```JavaScript
objC = function () {
    var counter = 0;
    var logger = function() {console.log(counter);}
    return {
        name: "name",
        inc: function() {
            ++counter;
            logger();
            return counter;
        }
    }
}();
alert(objC.inc()); /// 相當於 alert(1);
```

# 用new宣告
```JavaScript
function ClassD() {
    var privateVar = "private";
    this.weirdVar = "weirdo"; /// 詳候述

    globalVar = "global";  /// 單純複習一下
    globalFunc = function() {
        /// 全域函數
    }

    this.weirdFunc = function() {
        /// 詳候述
    }
    var privateFunc1 = function() {
        /// 私有成員函數
    }
    function privateFunc2() {
        /// 私有成員函數（不是全域喔）
    }
}
objD = ClassD(); /// objD會undefined，weirdVar 和 weirdFunc 是全域變數／函數
insD = new ClassD; /// weirdVar 和 weirdFunc 是類別的公開成員
insD2 = new ClassD(); /// 與上同
```

前述宣告方式如果有回傳值時，要特別小心
```JavaScript
function ClassE() {
    var privateVar = "private";
    var privateFunc = function() { return "pFunc"; }
    this.weirdVar = "weirdo";
    this.weirdFunc = function() { return "wFunc"; }
    return returnValue;
}
e1 = ClassE();
e2 = new ClassE();
```
* 如果 returnValue 是函數、陣列、物件（null除外），那麼：
  * e1 與 e2 均等同 returnValue
  * weirdVar 和 weirdFunc 是全域
  * 如果是物件，即同於前述 ClassC 的用法，可在 returnValue 中存取 privateVar 和 privateFunc
* 如果 returnValue 是數字（含NaN）、布林、字串、null、未定義（即直接`return;`），那麼：
  * e1 是 returnValue，weirdVar 和 weirdFunc 消失無蹤
  * e2 是物件，weirdVar 和 weirdFunc 是公開成員


# 用 prototype
如果需要擴充既存實體，或是繼承其他類別，則需要此。
```JavaScript
function ClassF(){
    alert("constructor"); /// 可以沒有內容，但是必須宣告為function
}
ClassF.prototype = {
    var1: "public member variable",
    var2: "you can see it as attribute",
    func1: function() {
        /// member function
    },
    func2: function() {
        /// member function
    }
}
insF = new ClassF();
ClassF.prototype.addedFunc = function() {
    alert("new function");
}
insF.addedFunc(); /// 即使 insF 早於 addedFunc 宣告，前者仍可順利使用後者
```

# prototype 的應用範例
```JavaScript
String.prototype.alert=function() { alert(this); }
"application".alert();
```

# Getter & Setter
例如Array元件的length表現的像個public member variable，但其實是個getter，不能直接覆寫。
```JavaScript
function Field(val){
    var value = val;

    this.__defineGetter__("value", function(){
        return value;
    });

    this.__defineSetter__("value", function(val){
        value = val;
    });
}
```

# 參考資料
* [Eddy@Joomla!藏經閣 - Javascript Module Pattern](http://blog.joomla.org.tw/javascript/54-general/161-Javascript-Module-Pattern.html)
* [JavaScript物件導向繼承：以prototype方式繼承中需要呼叫constructor的問題 : 布丁布丁吃什麼？](http://pulipuli.blogspot.tw/2010/10/javascriptprototypeconstructor.html)
* [John Resig - JavaScript Getters and Setters](http://ejohn.org/blog/javascript-getters-and-setters/)
* [override - Overriding a JavaScript function while referencing the original - Stack Overflow](http://stackoverflow.com/questions/296667/overriding-a-javascript-function-while-referencing-the-original)
* [Types | jQuery API Documentation](http://api.jquery.com/Types/#Proxy_Pattern)
