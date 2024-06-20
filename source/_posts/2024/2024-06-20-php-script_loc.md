---
title: PHP $_SERVER 的 SCRIPT_NAME 和 PHP_SELF
tags: [PHP, 程式]
---

PHP 的 `$_SERVER` 全域變數裡面有許多伺服器資料，也包含了瀏覽器請求的相關資訊，當中有幾個彼此間容易被混淆。

以下以伺服器有 `/about.php` 供瀏覽，而瀏覽器查詢 `/about.php/"hack?foo=bar` 為例，各變數分別會是：

|鍵|值|
|--|--|
|SCRIPT_FILENAME|`X:/abs/path/on/server/about.php`|
|REQUEST_URI|`/about.php/%22hack?foo=bar`|
|**SCRIPT_NAME**|`/about.php`|
|PATH_INFO|`/"hack?foo=bar`|
|**PHP_SELF**|`/about.php/"hack?foo=bar`|

---

另一情形，若 `.htaccess` 設定了
```
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ error.php?status=404 [QSA,L]
```

而瀏覽器查詢了不存在的 `/abc?foo=bar` ，那麼相關變數會是：

|鍵|值|
|--|--|
|SCRIPT_FILENAME|`X:/abs/path/on/server/error.php`|
|**REDIRECT_URL**|`/abc`|
|REDIRECT_QUERY_STRING|`status=404&foo=bar`|
|REQUEST_URI|`/abc?foo=bar`|
|SCRIPT_NAME|`/error.php`|
|PHP_SELF|`/error.php`|
