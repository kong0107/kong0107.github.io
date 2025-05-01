---
title: Apache 的 ErrorLog 和 CustomLog 比較
tags: [Apache]
---

## Apache 中可設定紀錄檔的指令 (directive)

|名稱|條件篩選|自訂格式|
|--:|--|--|
|ErrorLog|`%+`|用 `ErrorLogFormat`，若無則為預設格式|
|TransferLog|無|最後一個未取別名的 `LogFormat` ，若無則為預設格式|
|CustomLog|`env=`, `expr=`|直接寫，或用 `LogFormat` 設定的別名|
|GlobalLog|`env=`, `expr=`|直接寫，或用 `LogFormat` 設定的別名|

* 均須在 `*.conf` 中設定，不能在 `.htaccess` 設定。
* 僅有 `ErrorLog` 是由核心模組提供，其他均須啟用 `mod_log_config` 才能用。
* `TransferLog` 可完全被 `CustomLog` 替代。
* `GlobalLog` 要 Apache 版本 2.4.19 以後才有，特色是即使虛擬主機有自訂 `CustomLog` 了， `GlobalLog` 也仍會紀錄。（也因此，`GlobalLog` 被設計為不能在 Virtual Host 中使用，而是整個伺服器共通的）

## ErrorLogFormat 和 LogFormat 可用的參數對照

|format|in ErrorLogFormat|in LogFormat|description|
|--|:--:|:--:|--|
|%%	|v|v|百分比符號|
|%a, %{c}a|v|v|連線 IP ，後者不受 `mod_remoteip` 影響|
|%A	|v|v|伺服器本地 IP|
|%B, %b| |v|response body 的尺寸，為0時後者記錄`-`|
|%{*name*}C| |v|Cookie|
|%D| |v|此請求的處理總時，單位為微秒（百萬分之一秒）|
|%{*name*}e|v|v|環境變數|
|%E|v| |APR/OS error status code and string|
|%F|v| |Source file name and line number of the log call|
|%h, %{c}h| |v|請求中描述的伺服器名稱或位址|
|%H| |v|請求的協定|
|%{*name*}i|v|v|請求的 HTTP 標頭，可能被 `mod_headers` 改過|
|%k|v|v|被 keep-alive 的連線數|
|%l|LogLevel|請求者名稱|兩邊意義不同|
|%L|v|v|請求的 id 。若 ErrorLog 沒有記錄這筆，則 LogFormat 的對應結果會是 `-`|
|%{c}L, %{C}L|v| |連線 id|
|%m|觸發此訊息的模組名|請求方法(GET, POST, ...)|兩邊意義不同|
|%M|v| |訊息內容|
|%{*name*}n|v|v|The contents of note VARNAME from another module.|
|%{*name*}o| |v|回應的 HTTP 標頭|
|%p, %{*format*}p| |v|連接埠|
|%P|v|v|process ID|
|%{*format*}P| |v|pid, tid, hextid|
|%q| |v|請求網址的查詢字串（如 `?a=b&c=d`）|
|%r| |v|請求標頭的第一行（如 `POST /path HTTP/1.1`）|
|%R| |v|The handler generating the response (if any).|
|%s, %>s| |v|回應的狀態碼|
|%t|v|v|請求時間，格式如 `18/Sep/2011:19:18:28 -0400`|
|%{u}t, %{cu}t, %{cuz}t|v| |精確至微秒的時間|
|%{*format*}t|v|v|自訂的時間格式|
|%T, %{*unit*}T| |v|此請求的處理總時，單位預設為秒|
|%u| |v|認證的使用者名稱|
|%U| |v|請求的路徑（不含查詢字串）|
|%v, %V|v|v|伺服器名稱|
|%X| |v|連線是否被完成或中斷|
|%I| |v|包含標頭的請求位元數。若未啟用 `mod_logio` 會報錯|
|%O| |v|包含標頭的回應位元數。若未啟用 `mod_logio` 會報錯|
|%S| |v|前兩者的加總。若未啟用 `mod_logio` 會報錯|
|%{*name*}^ti| |v|請求中主體後的 trailer 資訊|
|%{*name*}^to| |v|回應中主題後的 trailer 資訊|
|"\ "|v| |排版用空格|
|"% "|v| |無空格的分隔符|

特別注意：
`%I`, `%O`, `%S` 需要啟用 `mod_logio` 才能用，否則伺服器會根本不能啟動。
相對地， `%l` 雖然依賴 `mod_ident` ，但就算未啟用後者，也只是造成前者必定轉換為 `-` 而已。



## ErrorLogFormat 的特殊處

以下複製自官網並稍作排版：

> It can happen that some format string items do not produce output.
> For example, the `Referer` header is only present if the log message is associated to a request and the log message happens at a time when the Referer header has already been read from the client.
> If no output is produced, the default behavior is to delete everything **from the preceding space character to the next space character**.
> This means the log line is implicitly divided into fields on non-whitespace to whitespace transitions.

> If a format string item does not produce output, the whole field is omitted.
> For example, if the remote address `%a` in the log format `[%t] [%l] [%a] %M` is not available, the surrounding brackets are not logged either.

> Space characters can be escaped with a backslash to prevent them from delimiting a field.
> The combination '% ' (percent space) is a zero-width field delimiter that does not produce any output.

> The above behavior can be changed by adding modifiers to the format string item.
> A `-` (minus) modifier causes a minus to be logged if the respective item does not produce any output.
> In once-per-connection/request formats, it is also possible to use the `+` (plus) modifier.
> **If an item with the plus modifier does not produce any output, the whole line is omitted.**

> A number as modifier can be used to assign a log severity level to a format item.
> The item will only be logged if the severity of the log message is not higher than the specified log severity level.
> The number can range from 1 (alert) over 4 (warn) and 7 (debug) to 15 (trace8).

> For example, here's what would happen if you added modifiers to the `%{Referer}i` token, which logs the Referer request header.

|Modified Token|Meaning|
|--|--|
|`%-{Referer}i`	|Logs a - if Referer is not set.|
|`%+{Referer}i`	|Omits the entire line if Referer is not set.|
|`%4{Referer}i`	|Logs the Referer only if the log message severity is higher than 4.|


## 參考資料
* https://httpd.apache.org/docs/current/mod/core.html#errorlogformat
* https://httpd.apache.org/docs/current/mod/mod_log_config.html#page-header
