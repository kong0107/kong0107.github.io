---
title: HTML 的 crossorigin 屬性 及 HTTP 回應檔頭的 Access-Control-Allow-*
tags: [程式, HTTP, HTML, CORS]
---

要引入其他網站的資料時，有時會遇到**同源政策** (same-origin policy) 的限制。
最常見的就是在設計 A 網站時，想要使用者在瀏覽時引用 B 網站的資料，但是前端卻出現這樣的錯誤：
> Access to script at 'https://bbb.com' from origin 'https://aaa.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

先說前提：要引用資料，一定要 B 網站的配合。不可能僅編輯 A 網站就成功讓瀏覽器可以在 A 網站的頁面中引用 B 網站的資料。
這是基於安全考量而有的限制，原因不在此文贅述。而是做些下述筆記。

前備知識：「HTTP 回應檔頭」(response header) 並**不是** HTML 的一部分，所以對網頁進行「檢視原始碼」也是看不到的。如果你只能編輯 HTML ，那麼是沒法解決前述問題的。請到別處學習「 HTTP 連線的請求與回應」的相關知識。


# HTTP 回應檔頭的 Access-Control-Allow-*

意義：
於前述跨源請求（A網站跟瀏覽器說「請去跟B網站要資料」，而後瀏覽器向B網站發出請求）時，
被請求資源的伺服器（B網站）會表示此資源是否有設計讓來源（A網站）進行**跨源請求**。

- `Access-Control-Allow-Origin` ：僅能為 `*` 或一個來源名。若需要允許多個來源存取資源，即要設計為針對不同來源做出不同回應檔頭。
  雖然規格上允許設為 `null` ，但 MDN 表示那會被視為跟 `data:` 和 `file:` 同源而有安全疑慮。
- `Access-Control-Allow-Credentials` ：要設定的話就只能為 `true` ，不然就是省略這個檔頭。若有設定此檔頭，則 `Access-Control-Allow-Origin` 不可為 `*` 。

由於 CORS 的請求檔頭應要包含 `Origin` ，所以 `Access-Control-Allow-Origin` 直接回傳域名即可。以 PHP 為例：
```php
<?php
	if(isset($_SERVER['HTTP_ORIGIN']))
		header('Access-Control-Allow-Origin:' . $_SERVER['HTTP_ORIGIN']);
?>
```


# HTML 的 crossorigin 屬性

意義：
在 A 網站的頁面中要引入 B 網站的資源時，瀏覽器會依 A 網站中的此屬性而對 B 網站的請求與回應有不同的措施。
此設計同於 `fetch()` 或 `XMLHttpRequest` 請求跨源資源時的限制。

適用標籤：`<audio>`, `<img>`, `<link>`, `<script>`, `<video>`

不同的設置情形：
|設定值|請求檔頭的 `Origin`|回應檔頭的 `Access-Control-Allow-Origin` |回應檔頭的 `Access-Control-Allow-Credentials` |  
|--|--|--|--|  
|不設定|不存在|隨便|可不存在|
|`anonymous` 、留白或其他|存在|須為 `*` 或 **源名**|可不存在|
|`use-credentials`|存在|須為源名|`true`|

總地來說，僅有「不設定」、「設為 `use-credentials` 」、「其他均視為 `anonymous`」 三種情形。
其中「源名」指前述A網站的網址中，從同訊協定（https）到網域名稱結尾，但不包含路徑開頭的斜線的部分。


## 與 referrerpolicy 不太有關係

這二者均是在指示瀏覽器，在存取後續（或當前網頁的內嵌）資源時，是否要調整 HTTP 檔頭。 
`crossorigin` 並會指示瀏覽器，對伺服器的回應進行檢查。  
  
|差別|referrerpolicy|crossorigin|  
|--|--|--|  
|適用的存取對象|所有資源|跨源資源|  
|影響的請求檔頭|`Referer`|`Origin`|  
|檢查回應檔頭|不檢查|可能檢查 `Access-Control-Allow-Origin` 和 `Access-Control-Allow-Credentials`|


試想在 `https://aaa.com/foo.html` 的網頁有這樣的 HTML ：
```html
<script src="https://bbb.com/x.js" crossorigin="anonymous"></script>
```

由於有設定 `crossorigin` 屬性，瀏覽器會使用 CORS 連線。
這個意思是，請求檔頭會有一個 `Origin: https://aaa.com`  。

但關於「A網站跟瀏覽器說『請去跟B網站要資料』」這件事，一般瀏覽器對 B 網站連線時，還會傳送 `referer` 檔頭： `Referer: https://aaa.com/` 。

雖然在一般情形下， `Origin` 和 `Referer` 是差不多的（預設情形下會差那個斜線），但請務必注意其目的不同：
- Origin 是針對同源政策而設計出來的東西，僅考量協定、主機名、埠號（通常會省略，表示使用域設埠號）
- Referer （注意這個字是拼錯的）是為了傳遞「前一個網頁的（完整）網址是啥」，是早期為了統計網路流量的設計。後來考量隱私，現今瀏覽器在跨源的時候會預設為僅傳送根目錄（包含最後的斜線）。

若要指示讓瀏覽器傳送不同詳細程度的 Referer ，則可以設定 referrerpolicy 屬性（注意後者的 referrer 是拚對的），參閱[前一篇文](https://kong0107.github.io/posts/2023/05/referrer-policy/)。


# 個人意見

- 若不想讓B網站知道「訪客是從A網站連過去的」的話，就要設定 `referrerpolicy="same-origin"` ，但**不能**設定 `crossorigin` 。
  不過 MDN 說 `<link>` 的情形下， `Request with no appropriate crossorigin header may be discarded.`
- 若要運作「會被其他網站引用的資源」的伺服器（例如CDN），且僅為特定來源設計，可以在來源不明（或已被列入黑名單）時直接拒絕請求，而根本不用告知 `Access-Control-Allow-*` 。


# 參考

- https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
