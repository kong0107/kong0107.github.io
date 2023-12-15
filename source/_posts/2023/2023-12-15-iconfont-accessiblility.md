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


# 哪個比較適合實作成無障礙網頁。

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


# 試作

## 基礎

以最簡單的，一個圖示按鈕為例。

用 `<img>`
```html
<a href="#">
    <img src="cart-add.svg">
    加入購物車
</a>
```

Font Class 模式（以 FontAwesome 為例）
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

## 視障友善

若是不「看見」圖片（可能是使用者看不到，也可能是圖片或字型連結失效），則無從得知這個連結是要做啥。
因此 WCAG 要求 `<img>` 原則上必須有 `alt` 屬性；其他元件的情形，則可以用 `aria-label` 屬性。MDN 說：

> By default, a button's accessible name is the content between the opening and closing `<button>` tags, an image's accessible name is the content of its `alt` attribute, and a form input's accessible name is the content of the associated `<label>` element.
>
> If none of these options are available, or if the default accessible name is not appropriate, use the aria-label attribute to define the accessible name of an element.

-- [aria-label - Accessibility | MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)


### 使用 `<img>` 的情形

```html
<button type="button">
    <img alt="加入購物車" title="加入購物車" src="cart-add.svg">
    <span class="d-none d-md-inline" aria-hidden="true">加入購物車</span>
</button>
```

各屬性說明如下：
* `alt`: 圖片無法顯示時，會改為顯示此處的純文字給健全者看；螢幕閱讀軟體也會念出這個。
* `title`: 滑鼠移到元件上方時，會出現小小的提示框，顯示此處設定的文字給健全者看。但螢幕閱讀軟體不會念出這個。
* `class="d-none d-md-inline"`: Bootstrap 的響應式設定，元件僅會在螢幕寬度達到 `md` (768px) 以上時顯示。
* `aria-hidden`: 指示螢幕閱讀軟體忽視此元件。

如此：
對於健全者的視覺，看到的是按鈕中有一張圖片，滑鼠移上後可以看到文字說明；
對於螢幕閱讀軟體，可辨識出那是一個按鈕，裡面的元件說明是「加入購物車」（源自 `<img>` 的 `alt` 屬性）， `<span>` 則會被略過不讀。


### 使用 font class 模式的情形

如果只是要「滑鼠移過去有字」和「螢幕閱讀軟體看得到字，且不會重複讀出」，可以這樣：

```html
<button type="button" aria-label="加入購物車">
    <i title="加入購物車" class="fa-solid fa-cart-plus" aria-hidden="true"></i>
    <span class="d-none d-md-inline" aria-hidden="true">加入購物車</span>
</button>
```


## 複製友善

前述的程式碼應該已能符合一些無障礙規範和需求，不過我自己還蠻希望網頁的內容被複製後，再被貼到其他軟體—例如純文字的對話框—時，也可以直接有不錯的內容。

但是，前述的 `<img>` 寫法，在貼上為純文字時，會因為 `<img>` 被替換為其 `alt` 屬性內文， `<span>` 的內文也被貼上，而變成「加入購物車加入購物車」這樣重複的文字。

想了許久，最後覺得棄用 `alt` ，並且把 `<span>` 改成「看不到時仍複製得到」較好：

```html
<button type="button">
    <img title="加入購物車" src="cart-add.svg" aria-hidden="true">
    <span class="hidden-md">加入購物車</span>
</button>
<style>
    @media (max-width: 767.98px) {
        .hidden-md {
            position: fixed;
            left: -100vw;
            transform: translateX(-100%);
        }
    }
</style>
```

其中 `.hidden-md` 的樣式也有不同的寫法，可參考 Bootstrap 5 的 `.visually-hidden` ，或是 Font Awesome 的 `.sr-only` 。須注意： `display: none` 和 `visibility: hidden` 均會使螢幕閱讀軟體也忽視該元件；而元件若是無須顯示（例如寬度或高度為0），則複製時也會被忽略。

前面以 Font Class 模式使用 iconfont 的程式碼，在螢幕較窄而文字被隱藏時，複製起來也不會有文字。故宜用 CSS 來達成「看不到但複製得到」的效果：

```html
<button type="button">
    <i title="加入購物車" class="fa-solid fa-cart-plus" aria-hidden="true"></i>
    <span class="hidden-md">加入購物車</span>
</button>
```

如此，便能同時符合「視覺上OK」、「螢幕閱讀軟體也OK」、「複製後貼到別的地方也OK」三種需求。且兩種寫法也相似，在 iconfont 和 `<img>` 混用的情形也較好維護。


# 參考

- https://lepture.com/zh/2015/fe-aria-label
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
- https://www.w3.org/WAI/tutorials/images/decision-tree/