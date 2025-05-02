---
title: Apache 的 ErrorLog 和 CustomLog 比較
tags: [Apache]
---

## Apache 中可設定紀錄檔的指令 (directive)

|名稱|條件篩選|自訂格式|
|--:|--|--|
|ErrorLog|視 `ErrorLogFormat` 設定，預設不篩選|用 `ErrorLogFormat`，若無則為預設格式|
|TransferLog|無|最後一個未取別名的 `LogFormat` ，若無則為預設格式|
|CustomLog|`env=`, `expr=`|直接寫，或用 `LogFormat` 設定的別名|
|GlobalLog|`env=`, `expr=`|直接寫，或用 `LogFormat` 設定的別名|

* 均須在 `*.conf` 中設定，不能在 `.htaccess` 設定。
* 僅有 `ErrorLog` 是由核心模組提供，其他均須啟用 `mod_log_config` 才能用。
* `TransferLog` 可完全被 `CustomLog` 替代。
* `GlobalLog` 要 Apache 版本 2.4.19 以後才有，特色是即使虛擬主機有自訂 `CustomLog` 了， `GlobalLog` 也仍會紀錄。（也因此，`GlobalLog` 被設計為不能在 Virtual Host 中使用，而是整個伺服器共通的）

本文中提到 `LogFormat` 時的描述，也適用於 `CustomLog` 和 `GlobalLog` 直接將格式字串寫出的情形。

## 可用的變數對照

|format|in ErrorLogFormat|in LogFormat|description|
|--|:--:|:--:|--|
|%%	|v|v|百分比符號|
|%a, %{c}a|v|v|連線 IP ，後者不受 `mod_remoteip` 影響|
|%A	|v|v|伺服器本地 IP|
|%B, %b| |v|回應主體 (response body) 的位元數，為 0 時後者記錄 `-`|
|%{*name*}C| |v|Cookie|
|%D| |v|此請求的處理總時，單位為微秒（百萬分之一秒）|
|%{*name*}e|v|v|環境變數|
|%E|v| |APR/OS error status code and string|
|%F|v| |呼叫紀錄功能的原始碼檔名和行號|
|%h, %{c}h| |v|請求中描述的伺服器名稱或位址|
|%H| |v|請求的協定（如 `HTTP/2.0`）|
|%{*name*}i|v|v|請求的 HTTP 標頭，可能被 `mod_headers` 改過|
|%k|v|v|被 keep-alive 的連線數|
|%l|LogLevel|請求者名稱|兩邊意義不同|
|%L|v|v|請求的 id 。若 ErrorLog 沒有記錄這筆，則 LogFormat 的對應結果會是 `-`|
|%{c}L, %{C}L|v| |連線 id|
|%m|觸發此訊息的模組名|請求方法(如 `GET`)|兩邊意義不同|
|%M|v| |訊息內容|
|%{*name*}n|v|v|The contents of note VARNAME from another module.|
|%{*name*}o| |v|回應的 HTTP 標頭|
|%p, %{*format*}p| |v|連接埠|
|%P|v|v|process ID|
|%{*format*}P| |v|pid, tid, hextid|
|%q| |v|請求網址的查詢字串（如 `?a=b&c=d`）|
|%r| |v|請求標頭的第一行（如 `POST /path?foo HTTP/1.1`），相當於 `%m %U%q %H`|
|%R| |v|The handler generating the response (if any).|
|%s, %>s| |v|回應的狀態碼|
|%t|v|v|請求時間，格式如 `18/Sep/2011:19:18:28 -0400`|
|%{*format*}t|v|v|自訂的時間格式（使用 `strftime` 的格式），精度僅到秒|
|%{u}t, %{cu}t, %{cuz}t|v| |精確至微秒的時間|
|%{sec}t, %{msec}t, %{usec}t| |v|自 Epoch 起的秒／毫秒／微秒數|
|%{msec_frac}, %{usec_frac}t| |v|未達一秒的毫秒／微秒數|
|%T, %{*unit*}T| |v|此請求的處理總時，單位預設為秒|
|%u, %<u| |v|認證的使用者名稱|
|%U| |v|請求的路徑（不含查詢字串）|
|%v, %V|v|v|伺服器網域名稱|
|%X| |v|連線是否被完成或中斷|
|%I, %O, %S| |v|包含標頭的請求／回應／加總位元數。若未啟用 `mod_logio` 會報錯|
|%{*name*}^ti| |v|請求主體後的 trailer 資訊|
|%{*name*}^to| |v|回應主體後的 trailer 資訊|
|%{*name*}x| |v|其他模組提供的變數引用，如 `mod_ssl` 提供了 `%{SSL_PROTOCOL}x`|
|"\ "|v| |排版用空格|
|"% "|v| |無空格的分隔符|


### 注意事項
* `%I`, `%O`, `%S` 需要啟用 `mod_logio` 才能用，否則伺服器會根本不能啟動；
  相對地，`LogFormat` 中 `%l` 雖然依賴 `mod_ident` ，但就算未啟用後者，也只是造成前者必定轉換為 `-` 而已。
* 要取得比秒更高的精度，在 `ErrorLogFormat` 只能用 `%{u}t` 系列；在 `LogFormat` 只能用 `%{sec}t` 系列。
* `ErrorLogFormat` 不能用 `%{...}x`，但是可以用 `%{...}e`。故在 `ErrorLogFormat` 可以用 `%{SSL_PROTOCOL}e` 。


## 「變數無值」時的效果與修飾子 (modifier)

在 `LogFormat` ，若引用的變數沒有值，則預設會顯示 `-` ；
但在 `ErrorLogFormat` ，則是會將「往前找到的空格」和「往後找到的空格」之間的東西都拿掉。

例如：
|語法|無 `%{Referer}i` 時的結果|
|--|--|
|`LogFormat "A [%{Referer}i] B"`|`A [-] B`|
|`ErrorLogFormat "A [%{Referer}i] B"`|`A B`|

關於 `ErrorLogFormat`，[官網](https://httpd.apache.org/docs/current/mod/core.html#page-header)是說：
> If no output is produced, the default behavior is to delete everything **from the preceding space character to the next space character**.

但其實並非前後的空格都一起被刪（否則前述結果應該會是 `AB` 而非 `A B`）。
實測感覺是刪了前方的空格，但沒有刪後方的空格（在變數位於字串最前或最後時會有差）。

由於這個特性，切記在 `ErrorLogFormat` 中原則上變數之間至少要有一個空格，或是使用 "\ " 或 "% "。否則像是 `%{AA}i__%{BB}i__%{CC}i`，會在任一個標頭不存在時整個都不被記錄。
另外， `\n` 和 `\t` 「不會」被當成空格。
（一般來說也不建議使用 `\n` ，會造成後續要用程式解析紀錄檔時的困擾）

或是使用修飾子 (modifier) 來變更這個效果：

|修飾子|例|變數無值時的效果|
|--|--|--|
|（無）|`%{Referer}i`|連同前後的字元一起刪除，連鎖直至空格|
|`-`|`%-{Referer}i`|轉譯為減號 `-`|
|`+`|`%+{Referer}i`|直接不進行這筆紀錄|
|整數0~15|`%4{Referer}i`|嚴重程度比此數字高時才紀錄，否則同無修飾子的效果|

* `+` ，應能做為篩選的依據。
  （畢竟 `ErrorLog` 不支援 `env=` 和 `expr=` 的篩選方式）
* 「嚴重程度」可參考 [LogLevel](https://httpd.apache.org/docs/current/mod/core.html#loglevel)


### `LogFormat` 用的修飾子

主要分兩種：指定回應狀態碼，或是指定是修改前或修改後。

|Format String|Meaning|
|--|--|
|`%400,501{User-agent}i`|僅在 400 和 501 的時候紀錄瀏覽器資訊，其他情形紀錄 `-`|
|`%!200,304,302{Referer}i`|在不是那三個狀態碼的情形，紀錄 `Referer` 標頭|

|modifier|meaning|
|--|--|
|`>`|`%s`, `%U`, `%T`, `%D`, `%r` 這些預設是取初始值，故若要紀錄其他模組改過後的值，就加上 `>` ，如 `%>s`。|
|`<`|前述以外的變數預設會取用最終值，故若要讀取初始的值，就加上 `<` ，如 `%<u`。|


## 心得

`ErrorLogFormat` 的「連同前後的非空格字串都一起刪掉」的特性，很適合把紀錄弄成類 JSON 的格式，例如：
```
ErrorLogFormat '{time:"%{uc}t", client:"%a", message:"%M"}'
```

這個字串格式在 `%a` 不存在時，就根本不會輸出 `client` 屬性。
（注意冒號前後均無空格；逗號前無空格、後有空格）


相對地， `LogFormat` 則適合 CSV 格式。如
```
LogFormat '%{uc}t, %a, %r'
```

這在 `%a` 不存在時，仍能順利將紀錄檔轉換為表格呈現。

這個設計差別應該是基於 `LogFormat` 適用的是基於每一個 HTTP 請求－回應機制，所以要記錄的欄位較為一致；
相對地， `ErrorLogFormat` 需要連伺服器啟動、關閉，以及 TCP 連線（而尚未處理 HTTP 請求）期間的問題也能記錄，因此某些欄位在某些時候就是不會存在。


### 小結
我目前的相關設定是：

```
LoadModule logio_module modules/mod_logio.so
LoadModule log_config_module modules/mod_log_config.so

ErrorLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/server-%y%m.log 86400"
# 若各個虛擬主機均有設定自己的 ErrorLog ，則這裡的應該只會有啟動、設定或模組載入、關閉的紀錄，因此照月份分就好了。

ErrorLogFormat '{time:"%{uc}t", level:"%l", mod:"%m", err:"%E", ssl:{proto:"%{SSL_PROTOCOL}e", cipher:"%{SSL_CIPHER}e"}, req:"%L", serv:"%V", client:"%{c}a", xForwardedFor:"%{X-Forwarded-For}i", forwarded:"%{Forwarded}i", referer:"%{Referer}i", uri:"%{REQUEST_URI}e", message:"%M"}'

# 有紀錄 %V
LogFormat "%{%y%m%d(%w)%H%M%S}t.%{usec_frac}t+%>D %L %>s%X %b/%O %{Forwarded}i[%{X-Forwarded-For}i,%a] %I %{SSL_PROTOCOL}x %H/%m:%V%U%q" my_log_format_full

# 不紀錄 %V
LogFormat "%{%y%m%d(%w)%H%M%S}t.%{usec_frac}t+%>D %L %>s%X %b/%O %{Forwarded}i[%{X-Forwarded-For}i,%a] %I %{SSL_PROTOCOL}x %H/%m %U%q" my_log_format

GlobalLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/global-%y%m%d.log 86400" my_log_format_full
CustomLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/default-%y%m%d.log 86400" my_log_format_full

<VirtualHost *:443>
	# 預設的，不應該落入這，故記錄一下 %V
	ServerName localhost:443
	ErrorLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/default-error-%y%m.log 86400"
	CustomLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/default-access-%y%m%d.log 86400" my_log_format_full
</VirtualHost>

<VirtualHost *:443>
	# 確定的虛擬主機，不用紀錄 %V
	ServerName my_site_1.idv:443
	ErrorLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/my_site_1-error-%y%m.log 86400"
	CustomLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/my_site_1-access-%y%m%d.log 86400" my_log_format
</VirtualHost>
```


## 測試環境

* Windows 11 Education 24H2
* Apache 2.4.63 (from Apache Lounge)

## 參考資料
* https://httpd.apache.org/docs/current/mod/core.html#errorlogformat
* https://httpd.apache.org/docs/current/mod/mod_log_config.html#customlog
* https://httpd.apache.org/docs/current/mod/mod_ssl.html#envvars
