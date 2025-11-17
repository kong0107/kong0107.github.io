---
title: HTTP 狀態碼列表
tags: [http, 程式]
---

## 前情

### 詞彙
* request: 請求
* method: 方法
* header: 標頭
* body: 正文
* response: 回應

### 提醒
* 狀態碼後面的英文，在 HTTP 1.x 是可選的；在 HTTP/2 和 HTTP/3 是「不可」存在的。
* 下列狀態碼已被棄用、將被棄用，或其實未實作： 102, 104, 306, 418, 510

|回應狀態碼|回應標頭必含|請求方法限定|請求標頭必含|
|--|--|--|--|
|100 Continue|n/a|`POST` 等包含正文的方法|`Expect: 100-continue`|
|101 Switching Protocols|n/a|不限|`Connection: Upgrade`, `Upgrade`|
|103 Early Hints|`Link`|不限|n/a|
|--|--|--|--|
|200 OK|`Content-Type`|不限|n/a|
|201 Created|`Location`|不限|n/a|
|202 Accepted|n/a|不限|n/a|
|203 Non-Authoritative Information|
|204 No Content|
|205 Reset Content|
|206 Partial Content|`Accept-Ranges: bytes`, `Content-Range`, `Content-Type`|不限|`Range`|
|207 Multi-Status|
|208 Already Reported|
|226 IM Used|
|--|--|--|--|
|300 Multiple Choices|`Location`|不限|n/a|
|301 Moved Permanently|`Location`|不限|n/a|
|302 Found|`Location`|不限|n/a|
|303 See Other|`Location`|不限|n/a|
|304 Not Modified|`Last-Modified` 或 `ETag`|不限|`If-Modified-Since` 或 `If-None-Match`|
|305 Use Proxy|
|307 Temporary Redirect|`Location`|不限|n/a|
|308 Permanent Redirect|`Location`|不限|n/a|
|--|--|--|--|
|400 Bad Request|n/a|不限|n/a|
|401 Unauthorized|`WWW-Authenticate`不限|n/a|
|402 Payment Required|n/a|不限|n/a|
|403 Forbidden|n/a|不限|n/a|
|404 Not Found|n/a|不限|n/a|
|405 Method Not Allowed|`Allow`|不限|n/a|
|406 Not Acceptable|
|407 Proxy Authentication Required|
|408 Request Timeout|n/a|不限|n/a|
|409 Conflict|
|410 Gone|n/a|不限|n/a|
|411 Length Required|`POST` 等包含正文的方法|不限|n/a|
|412 Precondition Failed|??|`POST` 等包含正文的方法|`If-Unmodified-Since` 或 `If-Match`|
|413 Payload Too Large|
|414 URI Too Long|
|415 Unsupported Media Type|
|416 Range Not Satisfiable|
|417 Expectation Failed|
|421 Misdirected Request|
|422 Unprocessable Content|
|423 Locked|
|424 Failed Dependency|
|425 Too Early|
|426 Upgrade Required|
|428 Precondition Required|
|429 Too Many Requests|
|431 Request Header Fields Too Large|
|451 Unavailable For Legal Reasons|
|--|--|--|--|
|500 Internal Server Error|
|501 Not Implemented|
|502 Bad Gateway|
|503 Service Unavailable|
|504 Gateway Timeout|
|505 HTTP Version Not Supported|
|506 Variant Also Negotiates|
|507 Insufficient Storage|
|508 Loop Detected|
|510 Not Extended|
|511 Network Authentication Required|



## Informational 1xx

### 100 Continue

方法限定：`POST` 等，可以附帶「正文」的方法。

流程：
1. 請求端僅發送標頭（但尚未請求完畢），其中包含 `Expect: 100-continue`
2. 伺服器回應 `100 Continue` （但回應尚未完畢）
3. 請求端繼續發送正文，直至完畢
4. 伺服器回應最終狀態碼（`20x` 或其他），並結束回應。

注意：
* 請求標頭的值為 `100-continue` ，中間是減號，且字母全小寫。
* 這是在請求傳送完畢前，就先傳送的狀態碼。
  即一個回應中包含二次的狀態碼，第一次是 `100` ，而後等請求正文傳送後才發送最終狀態碼。 


### 101 Switching Protocols

流程：
1. 請求端發送標頭 `Connection: Upgrade` 和 `Upgrade: <protocol>` 。（其中 `<protocol>` 是新的協議名稱）
2. 伺服器回應 `101 Switch Protocols` 。
3. 請求端以新協議發送新的請求。

提醒：
* 若伺服器逾時未回應，則依請求端情形（如僅是想從 HTTP 1.1 升到 HTTP/2，且為 `POST` 方法）可能會接續傳送正文。
* `Upgrade` 標頭僅有 `HTTP/1.1` 可用。



## 參考資料
* https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
* https://www.rfc-editor.org/rfc/rfc9110.html
