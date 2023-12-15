---
title: 讓 Apache 將紀錄依日期存到不同檔案
tags: [Apache]
---

# TL;DR

```
ErrorLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/error%y%m.log 86400"
CustomLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/access%y%m.log 86400" common
```

# 需求

Apache 會自動記錄啟動、錯誤、連線的事件，不過預設是持續添加至 `logs/error.log` 和 `logs/access.log` ，特別是後者在長時間運行的伺服器上，檔案會變得很大。

若是能依日期來儲存事件就好了。

# rotatelogs

Apache 官方自己就有針對這個需求，在 Apache HTTP Server 的套件裡提供這個小程式。配合適當的設定，即可以在不重啟伺服器程式的情形下，切換要寫入的紀錄檔。

> Apache httpd is capable of writing error and access log files through a pipe to another process, rather than directly to a file.
> ...
> One important use of piped logs is to allow log rotation without having to restart the server.
> ... the same technique can be used for the error log.

--- https://httpd.apache.org/docs/2.4/logs.html#piped

也就是原本在設定檔（`conf/httpd.conf` ）中指定「要把這筆紀錄寫到哪個檔案」，
改成設定「要把這筆紀錄傳給哪個程式」，而這個程式本篇即以內建的 `bin/rotatelogs.exe`  為例。
（其他系統可能是不同路徑）


## 設定 ErrorLog

原本的紀錄檔指定方式是
```
ErrorLog "logs/error.log"
```

改成
```
ErrorLog "|程式的絕對路徑 給程式的參數"
```

實例如
```
ErrorLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/error-%Y-%m-%d.log 86400"
```

幾個要注意的點：
- 須以 `|` 半形符號開頭。
- 程式路徑須為絕對路徑，且包含完整檔名（於 Windows ，即包含副檔名 `.exe` ）。
- 後面的參數是給紀錄的程式（`rotatelogs`）用的，而不是給 Apache 用的，因此也要在雙引號內。

針對 `rotatelogs` 的設定
- `-l` 表示採用當地時間（視伺服器的作業系統設定），而不採 GMT 時間。
- `86400` 是一天的秒數，但切換的時點總是正午夜，而非程式啟動後的 86400 秒後。
  > For example, 
  > if the rotation time is 3600, the log file will be rotated at the beginning of every hour; 
  > if the rotation time is 86400, the log file will be rotated every night at midnight.
- 要寫入的檔案，可以用相對路徑。相對於 Apache 的 `conf/httpd.conf` 裡設定的 `ServerRoot` 。
- 檔名內用的參數以 `%` 符號開頭，可用參數同 `strftime` 。常見的為：
	- `%Y` ：四位數年份
	- `%y` ：二位數年份
	- `%m` ：二位數月份（會補零）
	- `%d` ：二位數日期（會補零）


## 設定 CustomLog 

`CustomLog` 的格式是
```
CustomLog <要寫入的檔案或程式> <一筆紀錄的格式>
```

比 `ErrorLog` 多了「格式」的指定。
不過本文我們只處理「要寫入的檔案或程式」那個部分，其變更方式同 `ErrorLog` 。

也就是把預設的
```
CustomLog "logs/access.log" common
```
改成
```
CustomLog "|${SRVROOT}/bin/rotatelogs.exe -l logs/access-%Y-%m-%d.log 86400" common
```
即是一解。



# 參考
- https://httpd.apache.org/docs/2.4/logs.html#piped
- https://httpd.apache.org/docs/2.4/programs/rotatelogs.html