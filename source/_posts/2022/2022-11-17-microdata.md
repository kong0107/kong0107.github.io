---
title: Microdata 與 Schema.org 入門
tags: [程式, Microdata]
---

## 概念

* 用 Microdata 是為了 SEO ，讓各大搜尋引擎也能解析出網頁裡有哪些資料。
* 跟 DOM 樹做結合，並用 HTML 標籤的屬性來宣告資料的範 (scope)、型態 (type)、屬性 (prop) 。


## 基本範例

 以「商品」為例，要標記一個商品時，即：
```html
<div itemscope itemtype="https://schema.org/Product"></div>
```

表示這個元件裡頭是一個範圍 (scope)，會描述一個型態 (type) 為 `Product` 的項目 (item)，而項目內的屬性等規格宣告於 `https://schema.org/Product` 。

這個元件不一定要是 `<div>` ，也可以是其他「可包含其他元件」的 HTML 元件。


### 抱怨

`itemscope` 似乎跟 `itemtype` 必一起出現，但是 `itemscope` 不可省，而由於基本上都是用 Schema.org 的字典，所以實際上 `itemtype` 每次都要以 `https://schema.org/` 開頭。

若能像 #RDFa 那樣，在頂層用一次 `vocab` 屬性的話應該可以省版面，可惜不行。
[MDN 在 `itemref` 屬性的頁面](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemref)有個範例是「有 `itemscope` 但沒有 `itemtype` 」，但我沒翻到有哪個網站真的那樣用。


## 項目裡的屬性

前述例子只宣告了「這裡有個商品」，但其他什麼資訊都沒有。
若要加其他屬性，則要在該容器裡加 HTML *元件* (element)，一個 HTML 元件可以代表一個 Microdata *屬性* (property)。

```html
<div itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">微鹼性手工玫瑰香皂</span>
</div>
```

此即宣告
> 有一個 `Product` ，它的 `name` 是「微鹼性手工玫瑰香皂」。


### 確認自己在關注哪種結構
前例中，
若從 HTML 的結構來描述， `<span>` 有一個屬性 (attribute) 名叫 `itemprop` ，它的值是 `"name"` ；
若從 Microdata 的結構來描述，這個 `Product` 有一個屬性 (property) 名叫 `name` ，它的值是「微鹼性手工玫瑰香皂」。

中文都常翻成「屬性」，但英文的用詞不同，結構上指稱的也不同，撰寫時要留意。


## 若屬性有自己的結構

一個物件的屬性值可能是另一個物件，例如一本書的作者是某些人，每個人有各自的所屬屬性（而不是只有名字）。
在 Microdata ，這恰好可以跟 HTML/XML 的巢狀結構結合。例如：

```html
<div itemscope itemtype="https://schema.org/Painting">
  <span itemprop="headline">蒙娜麗莎</span>
  <div itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="givenName">李奧納多</span>
    達
    <span itemprop="birthPlace">文西</span>
  </div>
  <div itemprop="maintainer" itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">羅浮宮</span>
    <span itemprop="location" itemscope itemtype="https://schema.org/Place">
      <span itemprop="name">法國巴黎</span>
    </span>
  </div>
</div>
```

上例即意指有一個畫作 (Painting) ，它的
* 標題 (headline) 是「蒙娜麗莎」；
* 作者 (author) 是一個人 (Person) ，他的
  * 名字 (givenName) 是「李奧納多」；
  * 出生地 (birthPlace) 是「文西」。
* 維護者 (maintainer) 是一個機構 (Organization)，它的
  * 名稱 (name) 是「羅浮宮」；
  * 地點 (location) 是一個場所 (Place)，它的
    * 名稱 (name) 是「法國巴黎」。

其中「達」字落單了，但沒有關係，它會被 Microdata 解析的程式忽略。

若有其他沒有宣告 `item*` 屬性的 HTML 元件，也會被 Microdata 解析的程式忽略。
例如上例中，瀏覽器渲染的結果對於人來說並不好閱讀，實際的網頁應該會比較像這樣：

```html
<dl itemscope itemtype="https://schema.org/Painting">
  <dt>畫作標題</dt>
  <dd itemprop="headline">蒙娜麗莎</dd>

  <dt>作者</dt>
  <dd itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="givenName">李奧納多</span>
    達
    <span itemprop="birthPlace">文西</span>
  </dd>

  <dt>維護單位</dt>
  <dd itemprop="maintainer" itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">羅浮宮</span>
    <span itemprop="location" itemscope itemtype="https://schema.org/Place">
      （位於<span itemprop="name">法國巴黎</span>）
    </span>
  </dd>
</dl>
```


## 規格

哪些資料型態有哪些屬性？這個屬性應該用哪種資料型態？
這些並不是規範在 Microdata ，而是可以自訂的。
幾大搜尋引擎則都有使用 Schema.org 的規格。

在前例程式碼中的「維護單位」裡， https://schema.org/Organization 提到了 `location` 屬性除了可以是 `Place` 型態外，也可以是 `Text` 。
其中 `Place` 即像上面那樣進行巢狀宣告，而 `Text` 屬於基本型態，可如前面香皂的例子，不再宣告 `itemtype` 就直接在 HTML 元件中使用純文字。
也就是說，前例關於羅浮宮那一部分的 HTML 也可寫成：

```html
  <dt>維護單位</dt>
  <dd itemprop="maintainer">法國巴黎羅浮宮</dd>
```

至於結構到底多複雜才好，那就是實際製作網頁時要衡量的了。


## 對機器友善，也要對人友善

以數字為例，對一般訪客來說， `$ 1,234,567` 會比 `1234567` 清楚，但對程式來說則不是。
在這種情形，可以改用 HTML 的 `content` 屬性 (attribute) 來宣告 Microdata 需要的值。

以商品的販售資料 (Offer 類型) 為例， Schema.org 有這樣的例子（節錄）：

```html
  <div itemscope itemtype="https://schema.org/Offer">
    <span itemprop="priceCurrency" content="USD">$</span>
    <span itemprop="price" content="1000.00">1,000.00</span>
  </div>
```

在讀取 `priceCurrency` 時，Microdata 的解析程式即會判斷 "USD" 才是該屬性的值，而忽略 "$" 。
另注意 Schema.org 有在許多地方強調數字型態 (Number) 應：
> Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.

--- [Number - Schema.org Data Type](https://schema.org/Number)

筆者譯：「小數點請用 '.' 而不要用 ',' ，避免用這些符號增加（對人類的）可讀性。」
因此上例的 `price` 屬性也是把「給機器看的」和「給人看的」各寫一次。

### 提醒

「給機器看 HTML ，再用 JavaScript 把一些東西改成人類好閱讀的」這個方法不可行，因為 Google 現在看的是執行 JavaScript 後的 DOM 結構，包含非同步執行的那些。

也就是說，「不要」這樣做：

```html
<span itemprop="price">1000</span>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[itemprop=price]').forEach(elem => {
      elem.textContent = parseFloat(elem.textContent).toLocaleString();
    });
  });
  // Don't do this.
</script>
```


## 不可見的 HTML 元件

有時 *給機器看的* 和 *給人看的* 結構差太多，不方便用前述的方式表達，則可以用下述兩個「以往只用在 `<head>` 裡」且「不需要結束標籤」的元件：


### meta

用法如其他 HTML 元件加上 `content` 屬性 (attribute) 。
Google 的文件即有這樣的範例（節錄）：

```html
<div itemscope itemtype="https://schema.org/NewsArticle">
  <div itemprop="headline">Title of News Article</div>
  <meta itemprop="image" content="https://example.com/photos/1x1/photo.jpg" />
  <meta itemprop="image" content="https://example.com/photos/4x3/photo.jpg" />
  <img itemprop="image" src="https://example.com/photos/16x9/photo.jpg" />
</div>
```
--- [瞭解文章結構定義標記 | Google 搜尋中心  |  說明文件  |  Google Developers](https://developers.google.com/search/docs/appearance/structured-data/article)

本例中我們也看到：一個屬性 (property) 可以出現多次，且使用不同的 HTML 標籤和屬性 (attribute) 來呈現。


### link

若資料型態為 [Enumeration](https://schema.org/Enumeration)， Schema.org 有範例如下（節錄）：

```html
<div itemscope itemtype="https://schema.org/Offer">
  <link itemprop="availability" href="https://schema.org/InStock" />In stock
</div>
```
--- [Offer - Schema.org Type](https://schema.org/Offer#eg-0010)

看起來似乎是：
* 若是網址類的，就用 `<link>` ，且用 `href` （而非 `content` ）指定值。
* Enumeration 型態的，其值必須是規格網址，而非單純字串（如 "InStock" ）。


### 其他用法

不過， Google 則有將 `<meta>` 和 `<link>` 交替使用的例子（節錄）：

```html
<div itemtype="https://schema.org/Offer" itemscope>
  <link itemprop="url" href="https://example.com/anvil" />
  <meta itemprop="availability" content="https://schema.org/InStock" />
  <meta itemprop="priceCurrency" content="USD" />
  <meta itemprop="itemCondition" content="https://schema.org/UsedCondition" />
  <meta itemprop="price" content="119.99" />
  <meta itemprop="priceValidUntil" content="2020-11-20" />
</div>
```
--- [如何加入產品結構化資料 | Google 搜尋中心  |  說明文件  |  Google Developers](https://developers.google.com/search/docs/appearance/structured-data/product#microdata)

本例中我們也看到：
* 可使用 `<link href>` 在 [`URL` 型態](https://schema.org/URL)的屬性上。
* 文字、數字、日期型態，也可用 `<meta content>` 表示。
* 可以用 `<div>` 將多個不可見的元件包起來，成為一個不可見的 `itemscope` 。

另外，在 `availability` 屬性的指示上， Google 也說
> 系統也支援不含網址前置字元的簡稱 (例如 `BackOrder`)。

亦即， Google 支援 `<meta itemprop="availability" content="InStock" />` 這樣的簡寫。


## 同一層的 itemprop 之間可以在 DOM 上有親子關係嗎？

可以。Google 在導覽標記（ #麵包屑 ）的範例有：

```html
<a itemprop="item" href="https://example.com/books">
    <span itemprop="name">Books</span>
</a>
```


## 哪些 HTML 屬性會被當成 Microdata 的值？

大部分的元件加上 `itemprop` 時，都是意指「我包住的文字內容就是這個屬性的值」，但有些元件如 `<img>` 和 `<meta>` 並不能「包住」其他節點，此時「屬性的值要去哪找」的規則就不太一樣。
Mark Pilgrim 整理出下表（筆者略改格式）：

> A microdata property **name** ... is always declared on an HTML element.
> The corresponding property **value** is then taken from the element’s DOM. For most HTML elements, the property value is simply the text content of the element. But there are a handful of exceptions.

|element                                 | property value from|
|----------------------------------------|-------------------:|
|meta                                    | `content` attribute|
|audio, embed, iframe, img, source, video|     `src` attribute|
|a, area, link                           |    `href` attribute|
|object                                  |    `data` attribute|
|time                                    |`datetime` attribute|
|(all other elements)                    |        text content|

--- [Microdata - Dive Into HTML5](https://diveinto.html5doctor.com/extensibility.html#property-values)

不過，在前述的例子裡，我們看到 HTML 的 `content` 屬性不只能放在 `<meta>` 標籤中， Schema.org 也將之用在 `<span>` 上來表示 Microdata 的資料。

### 小結

這樣看來，下面五種寫法在 Microdata 的結構上是等價的：
```html
<img itemprop="contentUrl" src="https://fakeimg.pl/64/" alt="">
<link itemprop="contentUrl" href="https://fakeimg.pl/64/">
<meta itemprop="contentUrl" content="https://fakeimg.pl/64/">
<span itemprop="contentUrl" content="https://fakeimg.pl/64/"></span>
<span itemprop="contentUrl">href="https://fakeimg.pl/64/</span>
```


### 各搜尋引擎的要求

各搜尋引擎會有不同要求，例如 Google 要求圖片物件：
> 除了 contentUrl 以外，您還必須添加下列其中一個屬性：
> * creator
> * creditText
> * copyrightNotice
> * license

--- [圖片 SEO：圖片中繼資料  |  說明文件  |  Google Developers](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata?hl=zh-tw#json-ld)

實際上使用 Microdata 畢竟是為了 SEO ， Google 也說：
> 雖然大部分的 Google 搜尋結構化資料都使用 schema.org 詞彙，但在瞭解 Google 搜尋的運作方式時，請忽略 schema.org 的說明文件，並以 Google 搜尋中心說明文件為最終參考指南。
> schema.org 上有許多屬性或物件對其他搜尋引擎、服務、工具和平台來說可能很實用，但對 Google 搜尋而言並非必要。

--- [瞭解結構化資料標記的運作方式 | Google 搜尋中心  |  說明文件  |  Google Developers](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data#structured-data-format)

所以若遇到有衝突的情形，請不要糾結「我的語法又沒錯，你為什麼不吃」這種事，
善用 Google 的[複合式搜尋結果測試](https://search.google.com/test/rich-results)來達成弄這些東西的目的。


## 附論：簡化 `itemscope` 和 `itemtype`

既然 Google 會執行完 JavaScript 後才從 DOM 裡去抓資料，那也許我們在寫 HTML 的時候，可以簡化  `itemscope` 和 `itemtype` ，到前端再用 JavaScript 補完整。

原本的：

```html
<div itemscope itemtype="https://schema.org/Product"></div>
```

簡化成：

```html
<div itemtype="Product"></div>
```

但每頁都再執行 JavaScript ：
```js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[itemtype]').forEach(item => {
    item.setAttribute('itemscope', '');
    let type = item.getAttribute('itemtype');
    if(!type.startsWith('https://')) {
      type = 'https://schema.org/' + type;
      item.setAttribute('itemtype', type);
    }
  });
});
```

不過，我不知道這在其他情形（例如對於其他搜尋引擎）是否會有問題。


## 附論：我為何選用 Microdata

### vs JSON-LD

Google 已經主推 **JSON-LD** 了，但我總覺得 JSON-LD 應該是要獨立出去成為 API 的東西，而不該內嵌在給使用者看的網頁之中。

在傳統「由伺服器端運算出靜態 HTML ，再傳輸給瀏覽器」的結構下， `<body>` 中就已經有資料了， JSON-LD 則要求在 `<head>` 裡也要有一份資料。這樣根本就浪費資源——瀏覽器拿到 JSON-LD 到底要幹嘛？

若要用 JSON-LD ，應該是搭配 Angular 那類，讓資料可以由瀏覽器解析後，再逐一建構出 HTML 元件，呈現給使用者看。這樣的話，資料就只需傳輸一次。

不過我目前仍是「用伺服器端輸出靜態 HTML 」的方式寫網站，因此用不到 JSON-LD 的前述特點。


### Microdata 與 RDFa

相比之下，使用 Microdata 和 RDFa 在某種程度上可以協助前端編排的人員更理解資料的結構。

比方說，網頁底部的版權宣告，依傳統方式有可能是這樣呈現

```html
<footer>
  <div>&copy; 2022 My Corporation</div>
  <div>Tel: xx-xxxx-xxxx</div>
</footer>
```

但我在試著套用 Microdata 後，才「意識」到這個結構其實不對。資料的結構上應該是：
* Webpage:
  * copyrightYear (Number): 2022
  * copyrightHolder (Organization):
    * legalName (Text): "My Corporation"
    * telephone (Text): "xx-xxxx-xxxx"

意即，公司的「名稱」和「電話」之間，在資料上的連結性才比較強，跟版權年份的關聯反而較低。

使用 Microdata 和 RDFa 這種，要在 HTML 裡面加屬性的框架，則有助於釐清這樣的情形，可以讓我們在理解「這個資料是甚麼」的情形下，再去編排 HTML。

當然這也有缺點。
同樣在此例，要順應結構又達成傳統的版面編排（版權年與公司名在同一行，電話在另一行）就會比較困難。
儘管可以考慮用 HTML 的 `itemref` 屬性，但我覺得那樣結構很容易變亂。
