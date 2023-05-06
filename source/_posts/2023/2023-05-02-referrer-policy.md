---
title: HTTP 請求檔頭 Referer 和回應檔頭 Referrer-Policy
tags: [程式, HTTP, HTML, ReferrerPolicy]
---

# 請求檔頭的 Referer

意義：傳送請求時，請求方同時告知伺服器，此連線是從哪一個頁面過來的。
值：網址。

- 屬於 request header ，例如瀏覽器對伺服器發送的請求。
- 當年編寫協定時就拼錯了，但後來將錯就錯。因此在協定中， `referrer` 反而會是錯誤的。
- 內容是網址字串，但不會包含 `#fragment` 和帳密（`username:password`）
- 因為是由請求端發送的，因此不可信任。


# 回應檔頭的 Referrer-Policy

意義：指示瀏覽器，存取資源時，是否要附上怎樣的 `Referer` 檔頭。  

- 屬於 response header ，例如網頁伺服器傳送給瀏覽器的回應。
- 當中的 "referrer" 是正確的英文拼寫。
- 有時也用於請求端的程式功能，適用於伺服器回應轉址之類的情形運作。例如 Fetch API 的 [Request 建構子選項中即有 `referrerPolicy`](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#referrerpolicy)。
- 可以用逗號分隔多個值，瀏覽器會取用「最後一個」其支援的指示。

依「同源時如何處理」、「跨源但協定相同時如何處理」及「跨源且協定降級時如何處理」區分，均有「不給資料」、「只給協定、域名、埠號」、「給完整網址」的可能。

實際在協定內有命名的組合有（我把它們分為三組）：
|Referrer-Policy|同源時|跨源但未降級|跨源且降級|備註|  
|--|--|--|--|--|  
|no-referrer|absent|absent|absent|  
|no-referrer-when-downgrade|full|full|absent|2020年前的預設值|  
|unsafe-url|full|full|full|不安全，勿用|  
|--||||  
|origin|origin|origin|origin|  
|strict-origin|origin|origin|absent|  
|--||||  
|origin-when-cross-origin|full|origin|origin|  
|strict-origin-when-cross-origin|full|origin|absent|2020年後的預設值|  
|same-origin|full|absent|absent|適合域名獨立的非公開網站或後台|

上表中：
- 降級：表示從 HTTPS 的網站連向 HTTP 的網站，或是前者頁面中請求了後者的資源。  
- absent: 請求檔頭中根本不會有 `Referer` 。  
- origin: 請求檔頭中會有 `Referer` ，其值為網站根目錄（包含最後的斜線。這點與其他使用 `origin`  的情形略異）。
- full: 請求檔中會有 `Referer` ，包含路徑及 query string （問號開頭），但不包含 fragement （井號開始的那段）。


# HTML 的 referrerpolicy 屬性

意義：指示瀏覽器端在「下一次」的請求應如何處理 `Referer` 。（同樣地，瀏覽器不一定會照做）
值：與前同。

有三種設定方式：
1. 全頁設定：`<meta name="referrer" content="{directive}" />` 。相當於在 HTTP 回應檔頭中設定 `Referrer-Policy` 。
2. 標籤屬性：`referrerpolicy="{directive}"` ，可用於 `<a>`, `<area>`, `<img>`, `<iframe>`, `<link>`, `<script>` ，但不可用於 `<form>` 。
3. 標籤屬性：`rel="noreferrer"` ，僅可用於 `<a>`, `<area>`, `<form>`。

前二方法的可選值與 `Referrer-Policy` 相同，但僅能有一值（不支援多值）；
> Specifying multiple values is only supported in the `Referrer-Policy` HTTP header, and not in the `referrerpolicy` attribute.

但第三種則不同：
- 關於 referrer 的設定僅有 `noreferrer` ，既不是前二方法的 `no-referrer` ，也不是提示搜尋引擎爬蟲用的 `nofollow` 。
- 若 `rel` 屬性有多個值（例如也想設定 `nofollow` ），需用空白分隔，類似 `class` 屬性。
  > an unordered set of unique space-separated keywords.


## 瀏覽器支援

| |Chrome|Edge|Firefox|Opera|Safari|
|--|--|--|--|--|--|
|HTTP 檔頭 Referrer-Policy|56|79|50|43|11.1|
|HTML  `<meta name="referrer">`|17|79|36|15|11.1|
|在 `<a>`, `<area>`, `<img>`, `<iframe>`, `<link>` 使用 `referrerpolicy` 屬性|51|79|50|38|11.1~14|
|在 `<script>` 使用 `referrerpolicy` 屬性|70|79|65|1|13.1|


***

# 個人意見

- 網站後台以及「網址本身即有敏感資料」的頁面，若與訪客可見的頁面不同源，則將 Referrer Policy 設為 `same-origin` 較妥。
- 很可能會為了 SEO 而想要設定 `Referrer-Policy: unsafe-url` ，但這樣的缺點是：
	1. 若來源網站有設計「知道網址的人即可瀏覽」，那麼目標網站就也會知道該來源網址。（此風險於 `no-referrer-when-downgrade` 亦同）
	2. HTTP 協定是不加密的，網路的中間節點（例如很容易有資安問題的免費 WIFI 站）都會知道使用者的前一頁瀏覽了啥。
- 要設定整份文件的 Referrer Policy 時，推薦使用 `<meta name="referrer">` 而非 HTTP 回應檔頭 `Referrer-Policy` 。理由有二：
	1. 較早就支援了。
	2. 若文件內有個別需要設定 Referrer Policy 的連結，該處是會用 HTML 寫的。而「全文件的設定」和「各別連結的設定」用同一種方式，編碼結構上比較一致。
- 因為 `<link>` 的 `rel` 屬性不能設為 `noreferrer` ，`<img>` 和 `<script>` 也根本不能用 `rel` 屬性，因此 HTML 中統一使用相對通用的 `referrerpolicy` 屬性較不會混亂。（除非要用於 `<form>` ）


# 參考

- https://en.wikipedia.org/wiki/HTTP_referer#Etymology
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
- https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel