---
title: OAuth 2.0 ，以 PHP 登入 Google 為例
tags: [程式, PHP, OAuth, Google]
---

# 參考資料
* [[筆記] 認識 OAuth 2.0：一次了解各角色、各類型流程的差異 | by Mike Huang | 麥克的半路出家筆記 | Medium](https://medium.com/c42da83a6015)
* [串接 Google OAuth 2.0 實現第三方登入 | GrowingDNA 成長基因](https://growingdna.com/google-oauth-2-0-for-3rd-party-login/)
* [為網路應用程式應用程式使用 OAuth 2.0  |  Authorization  |  Google Developers](https://developers.google.com/identity/protocols/oauth2/web-server)
* [OpenID Connect  |  Authentication  |  Google Developers](https://developers.google.com/identity/openid-connect/openid-connect)


# 流程

1. User 跟 Auth 說：我想要允許 Site 使用我的資料。
2. Auth 回應 User ：請把這個 `code` 轉交給 Site ，以讓 Site 等會向我證明他要的是您的資料。
3. User 跟 Site 說：這是 Auth 給我的 `code` 。
4. Site 跟 Auth 說：我收到這個 `code` ，請驗證。
5. Auth 回應 Site ：請用這個 `token` 向 Resource 要資料。
6. Site 跟 Resource 說：我有這個 `token` ，我要操作 User 的資料。
7. Resource 回應 Site 。

說明：
* 最後面的 6 跟 7 可重複進行，直到 `token` 過期。
* Auth 和 Resource 是一夥的，就本文而言即是 Google 的整個系統。他們之間有自己的溝通方式。
* `code` 與 `token` 都是亂數字串，都是用於驗證身分，但由於 `code` 是經由 User 轉交的，又常是透過 HTTP Get ，因此有被使用者環境（如 Wifi 分享器）探知的風險。
  故設計上 `code` 只能用一次； `token` 才是反覆用來存取資料的。
* 實際上第 1 步驟常是 User 點選 Site 網頁上的連結，而第 3 步驟常是 Auth 在回應中請瀏覽器轉址。
  使用者的感受比較像是「Google 來問我，是否願意把資料給 Site 」，而不太會覺得是「我主動請 Google 提供資料給 Site 」，即使後者才是實情。


# PHP 實作：讓使用者用 Google 登入

本文「不使用」 [Google 提供的 PHP 程式庫](https://github.com/googleapis/google-api-php-client) ，而全由原生 PHP 函數操作。

## 0. 準備

### 在 Google Cloud Console 建立專案

1. 登入 Google 並連向 https://console.cloud.google.com/ 。
2. 建立專案，進入「API 和 服務」。
3. 點選「 OAuth 同意畫面」進行設定。
	1. 第一步驟中，網域可以不用填。
	2. 在第二步驟的「範圍」 (scope) 中，新增下列三個：
		1. .../auth/userinfo.email
		2. .../auth/userinfo.profile
		3. openid
	3. 第三步驟，將自己新增為「測試使用者」。
4. 點選「憑證」
	1. 點選「建立憑證」→「OAuth 用戶端 ID 」。
	2. 「應用程式類型」選擇「網頁應用程式」。
	3. 在「已授權的重新導向 URI」，加入預計處理登入的頁面網址。
	   （如 `http://localhost/login.php` ，頁面可能還不存在，本文後面才會寫。）
	4. 存好「用戶端編號」(`client_id`) 和「用戶端密碼」(`client_secret`)。
	   （吐槽：帳號比密碼還長…）



### HTTP post request 函數

PHP 原生函數要發送 HTTP request 不像 JavaScript 有 `fetch` 那麼方便，以本文需求來說可以這樣：

```php
function http_post(
    string $url,
    array $content
) : string|false {
    $package = [
        'method' => 'POST',
        'header' => ['Content-Type: application/x-www-form-urlencoded'],
        'content' => http_build_query($content)
    ];
    $context = stream_context_create(['http' => $package]);
    return file_get_contents($url, false, $context);
}
```

注意即使是要進行 `https` 連線，倒數第二行的鍵值仍然必須是 `http` 。

（與本文無關，但：若是需要回覆的檔頭，可用 `fopen()` 和 `stream_get_meta_data()` ；若是要傳送檔案，則需使用 cURL 。）

接下來其實就是依照 [Google 的文件](https://developers.google.com/identity/protocols/oauth2/web-server)  進行：


## 1. 生成連結，供使用者前往

即 OAuth 2.0 流程的步驟1 ：User 跟 Auth 說「我想要允許 Site 使用我的資料。」

實作上是讓 User 連向 `https://accounts.google.com/o/oauth2/v2/auth` ，並以 GET 方式附上一些參數。如：

```php
$_SESSION['csrf_token'] = base64_encode(random_bytes(24)); // 32個亂數字元

$query = http_build_query([
	'access_type' => 'offline', // 表示希望使用者離線時，網站仍能向 Google 要資料
	'client_id' => GOOGLE_ID, // 在 Google 建立專案後拿到的「用戶端編號」
	'redirect_uri' => 'https://example.com/login.php', // 稍後要將使用者轉址到哪
	'response_type' => 'code', // 其實 OAuth 有不同認證方式，本文只提一種。
	'scope' => 'openid profile email', // 以空格分隔的範圍清單
	'state' => $_SESSION['csrf_token'] // 詳後述
]);

$url = 'https://accounts.google.com/o/oauth2/v2/auth?' . $query;

printf('<a href="%s">使用 Google 帳號登入</a>', $url);
// 或是： header('Location: '. $url);
```

`redirect_uri` 需與在 Google 專案中設定的「已授權的重新導向 URI」相同。

`scope` 不能超出專案中的「範圍」設定。除了一般開放資料之外， Google 建議採用[漸進式授權](https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth)，亦即，使用者有要用到某功能時，才去請求對應的授權。

`state` 雖然是可選，但有兩種常見應用：
1. 記錄使用者原本在哪個頁面，方便驗證過後再轉址回去。這樣使用者體驗會比較好。
2. 防止 #CSRF （跨站請求偽造， cross-site request forgery），詳參[維基百科](https://zh.wikipedia.org/zh-tw/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)。
   上述程式碼是將暫存的資料寫在 Session 裡，應該也有其他實作方式。


## 2. 接收使用者傳來的 code 等資料

使用者於 Google 那邊點選同意後，即會被 Google 轉址到 `redirect_uri` ，並在網址後加上 `code` 等資料，如 `https://example.com/login.php?code=xxxxxxxx&state=yyyyyy` 。
於此情形，即是在 `login.php` 中要處理 `$_GET` 。

```php
if($_GET['csrf_token'] !== $_SESSION['csrf_token'])
	exit('未通過 STP 測試，可能是 CSRF 。');

// 用 $_GET['code'] 進行下一步
```

在這裡可能要避免 CSRF ，我的作法如上。


## 3. 用 code 向 Google 要 token

這裡即需要 HTTP Post request 。用前述宣告的 `http_post()` 實作如下：
```php
$res_body = http_post('https://oauth2.googleapis.com/token', [
    'grant_type' => 'authorization_code',
    'client_id' => GOOGLE_ID,
    'client_secret' => GOOGLE_SECRET,
    'code' => $_GET['code'],
    'redirect_uri' => 'https://example.com/login.php' // 不知為何需要…
]);

if(!$res_body) exit('未能收到存取權杖。');
$result = json_decode($res_body);

$access_token = $result->access_token;
```

回來的資料是 JSON ，故用 `json_decode()` 即可轉成物件。
之後即可用 `$access_token` 向 Google 存取使用者的資料。
至此已成功驗證使用者有 Google 帳號，若沒有其他需求則可以到此就好。


## 4. 在取得 token 時也可取得的其他資料

上方程式碼中， `$result` 中除了 access token 之外，也有其他資料。整個 `$res_body` 是像：
```json
{
  "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
  "expires_in": 3920,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
  "refresh_token": "1//xEoDL4iW3cxlI7yDbSRFYNG01kVKM2C-259HOF2aQbI",
  "id_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

`expires_in`: token 還有幾秒有效。
`scope`: 實際授權範圍，以空格分隔，順序不一定。


### `refresh_token`

只在步驟1時將 `access_type` 設為 `offline` 時出現，網站可據此直接向 Google 取得新的 `access_token` ，即使使用者已不在線上。方法類同步驟3 ，如下：

```php
$res_body = http_post('https://oauth2.googleapis.com/token', [
    'grant_type' => 'refresh_token', // 這裡不同
    'client_id' => GOOGLE_ID,
    'client_secret' => GOOGLE_SECRET,
    'refresh_token' => $refresh_token // 這裡不同
]);
if(!$res_body) exit('未能收到存取權杖。');
$result = json_decode($res_body);
$access_token = $result->access_token;
```

除了標示不同的兩處外， Google 的例示中這裡也不用 `redirect_uri` 。
（吐槽：為什麼 `refresh_token` 比 `access_token` 還短啊…）

我的測試經驗是：用 `refresh_token` 拿到的資料裡，也有 `id_token` ，但是解出來的資料「不一定」有姓名（given_name, family_name, name ）的資訊。


### `id_token`

只在步驟1時將 `scope` 設為包含 `openid` 時出現（當然在專案設定中也要有）。
依照 OpenID 協定，這是一個 JWT 字串 (JSON Web Token)，也就是經過加密簽署的 base64url 編碼 JSON 物件。可以貼到 https://jwt.io/ 解碼，也可以用下列程式碼取得內容：

```php
// 延續步驟 3
$result = json_decode($res_body);
$payload = explode('.', $result->id_token)[1];
$user = json_decode(base64url_decode($payload));
```

上例中 `base64url_decode()` 是另外寫的函數，參閱[PHP 處理 Base64 URL 的編碼、解碼方式 – Tsung's Blog (longwin.com.tw)](https://blog.longwin.com.tw/2018/12/php-base64-url-encode-decode-2018/)，或 [PHP 官網留言](https://www.php.net/manual/zh/function.base64-encode.php#103849)。
另注意 [RFC 4648]([RFC 4648: The Base16, Base32, and Base64 Data Encodings (rfc-editor.org)](https://www.rfc-editor.org/rfc/rfc4648)) 其實有規範說 `base64url` 不應該被簡稱為 `base64` 。

`id_token` 包含資料可參閱 [Google 的文件](https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload)，可利用的有：
* `sub`: 使用者真正的 Google ID ，說是 ASCII ，但目前看來都是數字字元。（語源是 subject ）
* `email`: 若步驟1的 `scope` 中有 `email` ，這裡才會有。從這裡擷取的話，就不用多跟 Google 做一次連線。Google 表示「不適合做為主鍵。」
* exp: 整數， token 將過期的實際時間，為 Unix 時間戳（1970 起經過的秒數）。注意與上方的 `expires_in` 是指「殘餘秒數」的意義不同。

亦即，其實不需要真的用到 `access_token` ，就已經可以取得使用者的最基本的資料。

