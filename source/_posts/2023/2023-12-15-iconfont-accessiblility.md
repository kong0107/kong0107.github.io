---
title: 圖標字體 (iconfont) 與無障礙網頁
tags: [程式, HTML, 無障礙]
---

# 網頁中的圖示

在網頁中使用符號圖示的概念，有多種不同的實作方式與發展：

1. 純文字，例如顏文字和 ASCII 藝術，後來 Unicode 發展的 emoji 也可算入。
2. 在 `<img>` 裡顯示一整張圖片。
3. 不使用 `<img>` ，用 CSS 的 `background-image` 來顯示一整張圖片。
4. 不使用 `<img>` ，用 CSS 的 `background-position` 來顯示一大張圖片的一小部分。即 image sprites 技術。
5. 用 dataurl 直接將圖片資料以 base64 格式寫在 HTML 的 `<img src>` 或 CSS 的 `background-image` 中。
6. 用字型儲存多個向量圖，將 HTML 中的文字以該字型顯示。 Wingdings 系列字型即是如此。因晚近的實作多使用 Unicode 的 Private Use Area 區塊 (`U+E000..U+F8FF`) ，也稱 Unicode 模式。
7. 用字型儲存多個向量圖，利用連字 (ligature) 的設計，將多個字元顯示成所須的圖示。 Google Fonts 的 Icons 的程式碼範例即使用此方式。我稱之為 Ligature 模式。
8. 用字型儲存多個向量圖，將元件用 CSS 在偽元素 (pseudo-element) 中顯示。 Font Awesome 和 Bootstrap Icons 使用此方式。因使用 CSS 的 Class 實作，也稱 Font Class 模式。

這些發展都有其歷史因素，涉及 HTTP 協定原理、開發週期等，不過本篇想要討論的是：


# 無障礙網頁

我在意的有下列情形：
1. 當外部資源（無論是圖片或字型，甚至可能是 CSS）失效或被禁用時，網頁上的資料是否仍好理解。
2. 視障者（未必全盲）或螢幕閱讀軟體 (screen reader ，中國稱「讀屏軟件」) 的使用者是否好理解頁面內容。
3. 視力沒有問題，但不理解圖示意義的人，是否能輕易理解其意義。
4. 複製網頁內容並於其他軟體貼上純文字時，該純文字是否容易理解。

其中第 4 點通常在無障礙網頁的議題不太會討論，但我個人有點在意，故而前述的方法 6 與 7 即不適合。
從 Unicode 模式複製出來的，是一個在其他字型中均沒有意義的字元；
從 Ligature 模式複製出來的是會有一些語意，但一來對中文使用者來說仍然不通順，二來圖示的使用情境未必符合使用的單詞。

以下用「一個『加入購物車』的按鈕，若螢幕夠寬，則顯示文字於圖片之後」的需求，討論兩種圖示的引用方式：
* 使用 `<img>` ，即前述方法 2 。
* 不使用 `<img>` ，也不在 HTML 中直接設定顯示的文字，即前述方法 3, 4, 8 。以下用 FontAwesome 以方法 8 實作。


# 簡單的開始

以最簡單的，一個圖示按鈕為例。

用 `<img>`
```html
<a href="#">
    <img src="cart-add.svg">
    加入購物車
</a>
```

iconfont 的 Font Class 模式（以 FontAwesome 為例）
```html
<a href="#">
    <i class="fa-solid fa-cart-plus"></i>
    加入購物車
</a>
```

注意 `<a href="#" />` 是一個被濫用過久的寫法。
一來 `href="#"` 從未被規範要做什麼事（在某些情形，可能會重載頁面）；
二來此處我們想要的是一個「按鈕」，那麼就應該使用對應的元件 `<button>` 。

但 `<button>` 又因為歷史因素，我們必須指定其 `type` （否則其預設值為 `submit` ）。
故上述寫法宜均改為：

```html
<button type="button">
    ...
</button>
```

# 對不熟圖示的人友善

有時為了版面需求，只想留下圖示，或是「螢幕不夠寬時，只顯示圖示」，但這樣看不懂圖示的人就會不知道怎麼操作。
這時我們可以善用 `title` 屬性的「滑鼠移上時會顯示小提示框給健全者看」的表現：


```html
<button type="button">
    <img title="加入購物車" src="cart-add.svg">
    <span class="d-none d-md-inline">加入購物車</span>
</button>
```

```html
<button type="button">
    <i title="加入購物車" class="fa-solid fa-cart-plus"></i>
    <span class="d-none d-md-inline">加入購物車</span>
</button>
```

這邊使用了 Bootstrap 的 `d-none` 和 `d-md-inline` 實作「螢幕夠寬時才會顯示」的效果。


# 視障友善

若是不「看見」圖片（可能是使用者看不到，也可能是圖片或字型連結失效），則無從得知這個連結是要做啥。
因此 WCAG 要求 `<img>` 原則上必須有 `alt` 屬性；其他元件的情形，則可以用 `aria-label` 屬性。

遺憾的是，螢幕閱讀軟體不會讀出 `title` ，因此同樣的東西我們要設置多次。（也可以設定為不同的值，但除非狀況複雜不然一般不建議那樣。）

```html
<button type="button">
    <img alt="加入購物車" title="加入購物車" src="cart-add.svg">
    <span class="d-none d-md-inline" aria-hidden="true">加入購物車</span>
</button>
```

其中 `alt` 除了會被螢幕閱讀軟體念出；當圖片顯示錯誤時，瀏覽器也會改顯示此處設定的文字給健全者看。
而 `aria-hidden` 則會指示螢幕閱讀軟體忽視此元件，這樣就不會重複念出「加入購物車」了。

如此：
對於健全者的視覺，看到的是按鈕中有一張圖片，滑鼠移上後可以看到文字說明；
對於螢幕閱讀軟體，可辨識出那是一個按鈕，裡面的元件說明是「加入購物車」（源自 `<img>` 的 `alt` 屬性）， `<span>` 則會被略過不讀。


使用 font class 模式的情形：

```html
<button type="button" aria-label="加入購物車">
    <i title="加入購物車" class="fa-solid fa-cart-plus" aria-hidden="true"></i>
    <span class="d-none d-md-inline" aria-hidden="true">加入購物車</span>
</button>
```

這裡在 iconfont 那邊也使用了 `aria-hidden` ，這是因為偽元素（此處是 `i::before` ）的內容在複製貼上時雖然不會被選擇到，但螢幕閱讀軟體卻仍會試著唸出該內容。若不設定 `aria-hidden="true"` 則 Accessibility Tree 在那邊還是有一個亂碼字元（歸屬於 Unicode 的 Private Use Area ）。


# 複製友善

前述的程式碼應該已能符合一些無障礙規範和需求，不過我自己還蠻希望網頁的內容被複製後，再被貼到其他軟體—例如純文字的對話框—時，也可以直接有不錯的內容。

但是，前述的 `<img>` 寫法，在貼上為純文字時，會因為 `<img>` 被替換為其 `alt` 屬性內文， `<span>` 的內文在螢幕夠寬時也會被貼上，而變成「加入購物車加入購物車」這樣重複的文字。

想了許久，最後覺得棄用 `alt` ，並且把 `<span>` 改成「看不到時仍複製得到」較好：

```html
<button type="button">
    <img alt="" title="加入購物車" src="cart-add.svg">
    <span class="hidden-md">加入購物車</span>
</button>
<style>
    @media (max-width: 767.98px) {
        .hidden-md {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
        }
    }
</style>
```

其中 `.hidden-md` 早期的寫法是 `left: -9999px` ，不過晚近是上面的寫法，或另參考 Bootstrap 5 的 `.visually-hidden` ，還有 Font Awesome 的 `.sr-only` 。
（注意： `display: none` 和 `visibility: hidden` 均會使螢幕閱讀軟體也忽視該元件；而元件若是無須顯示（例如寬度或高度為0），則複製時也會被忽略。）

依照 [W3C 的指引](https://www.w3.org/WAI/tutorials/images/decorative/)，`alt` 屬性仍然必須指定，只是可以為空字串。

而以 Font Class 模式使用 iconfont 的情形，在前面的程式碼中，在螢幕較窄而文字被隱藏時，複製起來也不會有文字。
故宜用 CSS 來達成「看不到但複製得到」的效果：

```html
<button type="button">
    <i aria-hidden="true" title="加入購物車" class="fa-solid fa-cart-plus"></i>
    <span class="hidden-md">加入購物車</span>
</button>
```

如此，便能同時符合「視覺上OK」、「螢幕閱讀軟體也OK」、「複製後貼到別的地方也OK」三種需求。且兩種寫法也相似，在 iconfont 和 `<img>` 混用的情形也較好維護。


# 結語

其實我個人很不喜歡用 `visually-hidden` 和 `sr-only` 那類方式來「在視覺上隱藏該元件，但螢幕閱讀軟體可支援」的作法，我認為根本就應該有一個 CSS 屬性要可以做到這件事。
不過在目前的技術和瀏覽器支援下，前述的似乎是主流做法了。

至於各家 iconfont 的發展多元，我總覺得這應該是 Unicode 制定要解決的問題—就像 emoji 一樣。
以齒輪為例， Unicode 的 `U+2699` 即是齒輪 `⚙` 。那麼各 iconfont 的齒輪圖示就應該要在實作時套用此 unicode 編碼，而不是在 private use area 自訂，造成使用者變更字型時的顯示問題。
現在這種「各家 iconfont 自己訂出字元編碼和圖示的對應」的情形，讓我想到大五碼時代我國的不同政府機關也是對許多字做了不同編碼，造成後來整頓的許多困難。（unicode 都不 uni 了啊）
但 Unicode 的符號選擇一直都不夠齊全。例如，直到現在裡面甚至沒有交通錐的符號，但是卻有獨角獸的符號 (🦄，U+1F984)。

附帶提一下，除了「複製友善」之外，其實也有「列印友善」的設計需求，早期是設計另外的頁面，後來則通常是在 CSS 用 `@media print {}` 實作。
（但說到底…我目前從來沒看過複製友善的討論文章…該不會只有我在意吧 QQ ）

# 參考

- https://lepture.com/zh/2015/fe-aria-label
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
- https://www.w3.org/WAI/tutorials/images/decision-tree/
