---
title: Schema.org 的 Product 相關類別
tags: [程式, Microdata]
---

Product 的子類中，有幾個容易相混淆的：
* IndividualProduct
* ProductCollection
* ProductGroup
* ProductModel
* SomeProducts

後面會追加一起談 `category` 和 `keywords` 。

在說明他們有甚麼不同之前，要先釐清一個觀念：
上面說的 `Product` 和其「子類別」，是從物件導向的類別繼承角度來看，而不是產品分類的角度。

下面我們會看到，雖然從 OO 來看， `ProductGroup` 是 `Product` 的子類別；
但在商品展示資訊上，某個 `Product` 實體（例如某件衣服的S號尺寸）是隸屬於某個 `ProductGroup` （該件衣服）之下
—這個上下關係就是產品分類的角度，而不是物件導向的角度。


## IndividualProduct
例如：
* 《蒙娜麗莎》真跡
* 某地、某房、某戶
* 特定一張網卡（有獨特的 MAC 位址）
* 特定一輛車（跟車號一起）

只會有一個，跟其他同類產品有所區別、相互間不可替代的。
用物件導向來理解的話即是類別實體，用法律來理解的話即是「特定物」。


## Product
例如：
* iPhone 14 紫色 256GB
* 某大樓裡的每一戶
* 百樂0.5按鍵式魔擦筆 粉紅色
* 「狗才想你 / 汪」T恤 墨綠色 L 號

特定的產品樣貌，每一個新品之間幾乎完全相同。（仍可能會有序號的差別，如 3C 類）
用法律來理解的話即是「種類物」。
Google 說到各個 `Product` 在「詳細資料方面有差異，例如尺寸、顏色、材質、圖案、年齡層，以及性別。」


## ProductGroup
例如：
* iPhone 14
* 百樂0.5按鍵式魔擦筆
* 「懶得理你 / 喵」T恤

特別注意這個「不是」套裝商品（例如「一個漢堡和四個雞塊」的套餐）的概念。
Google 說到：
> 如果一件 T 恤有 9 個子類：3 種尺寸 (「小」、「中」、「大」) 和 3 種顏色 (「紅色」、「藍色」、「綠色」)，請將每項子類做為獨立產品提交 (共 9 項不同的產品)，並為每項子類的商品群組 ID 屬性提交相同的值，藉此表示這些子類屬於同一產品。

其中「9 項不同的產品」即是指要有 9 個 `Product`；「這些子類屬於同一產品」的「同一產品」則是指同一個 `ProductGroup` 。


## ProductModel
例如：
* iPhone
* 洛克人系列遊戲

說明文是「商品原型的規格」
> A datasheet or vendor specification of a product (in the sense of a prototypical description).

我是打算將之應用為商品分類，而且可以實作樹狀多層結構。


## ProductCollection

例如：
* 可口可樂易開罐 330mL 六瓶裝
* 大麥克經典套餐
* PILOT LJU-10UF 0.38mm Juice 果汁筆 12色組

把原本可以單賣的商品組在一起，可以另外設定賣價和供應情形。

Google 另外有兩個詞：
* [multipack](https://support.google.com/merchants/answer/6324488?hl=zh-Hant) 組合：用於「將多個相同產品包裝成一項商品」的情形，如上例的可口可樂六瓶裝。
* [bundle](https://support.google.com/merchants/answer/6324449?hl=zh-Hant&ref_topic=6324338)套裝組合：將一個主要產品搭配其他不同產品，並以單一價格成套出售。


## SomeProducts

這個我還不太確定，感覺就只是把 `Product` 多一個庫存量的屬性 `inventoryLevel` 而已。

庫存量允許一個數字範圍，不一定要精確值（可用 [QuantitativeValue](https://www.schema.org/QuantitativeValue) 的 `maxValue` 和 `minValue` 屬性），
但如果不打算精確的話，我覺得用 `Product.offers.availability` 才比較對…吧？


## Product.category

`Product.category` 屬性可接受的資料型態中，比較符合其字義的是 `CategoryCode` ，但那個還要搭配 `CategoryCodeSet` 使用，而且似乎不支援多層的分類，我是不打算用。

Google 有一個 [google_product_category](https://support.google.com/merchants/answer/6324436) ，由於名稱上的高度相似，我認為 `Product.category` 就直接當成 `google_product_category` ，型態就用 `Text` 比較好。

Google 還有提供一個屬性叫做 [product_type](https://support.google.com/merchants/answer/6324406?hl=zh-Hant)，可以「加入自己的產品分類系統」，或是可以「為 Google 產品類別 [google_product_category] 屬性和產品類型 [product_type] 屬性提供相同的值」。
但由於同樣只接受單一字串的值，想要實作多層的分類時要留意。


## Product.keywords

首先說一下：[Google 決定網站排名時不會參考keywords 中繼標記](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag?hl=zh-tw) (2009-09-21)。

不過，那是在 Schema.org 成立（2011）之前，所以有可能只是指 `<head>` 裡面的 `<meta name="keywords">` 而已。
至於商品的標記裡的 `itemprop="keywords"` （以 Microdata 為例），即使 Google 真的不參考，就網站而言仍有可能想提供給訪客參考（例如提供連結，列出有同樣關鍵字的商品）。

`Product.keywords` 可以使用 `DefinedTerm` 型態，與其對應的是 `DefinedTermSet` 類別。
但跟 `CategoryCode` 及 `CategoryCodeSet` 一樣，看起來不支援多層次的結構。

若是直接使用字串，使用逗號分隔值或是多次宣告屬性都可以。 [Schema.org](https://schema.org/keywords) 寫道：
> Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property.


## 附論：要給 Google 看的東西，少用逗點

Google 在 [product_type](https://support.google.com/merchants/answer/6324406?hl=zh-Hant&ref_topic=6324338) 的說明中寫道：
> 切勿在個別產品類型的值中使用半形逗號 (,)，因為這樣會導致 Google 將其視為不同產品類型的分隔。

在[顏色](https://support.google.com/merchants/answer/6324487)的說明中寫道：
> 如果產品是由多種顏色組成，您可以指定 1 種主要顏色，後面加上最多 2 種次要顏色，並分別以斜線 (/) 隔開，例如：`Red/Green/Black`。
> 請勿使用逗號 (,) 來分隔多個顏色

在[材質](https://support.google.com/merchants/answer/6324410)的說明中寫道：
> 如果產品是由多種材質組成，可以指定一種主要材質，後面加上最多 2 種次要材質，並分別以斜線 (/) 隔開。

綜上，我建議在 `keywords` 也不要用逗點。因此若同時要符合 Schema.org 的說法的話，那就是會要在多個 HTML 物件上套用 `itempropo="keywords"` 。
