---
title: 將 Windwos 10 和 11 的 SSH 伺服器殼層設為 PowerShell
tags: [筆記, Windows, OpenSSH, PowerShell]
---

本篇為筆記，較無目標性。

# OpenSSH server on Windows

Windows 10 及其之後，可以用內建功能安裝 OpenSSH 用戶端和伺服器（這是兩個不同的功能）。

Win10 ：設定→左側「應用程式」（→自動進入「應用程式與功能」）→右側中上「選用功能」→上方「新增功能」

Win11 ：設定→左側「應用程式」→右側「選用功能」→右上「新增選用功能」

預設並不會啟動，要再進服務（`services.msc`）啟動，或是用管理者權限在 PowerShell 執行 `Start-Service sshd` 。

要在 PowerShell 設定自動啟用的話，指令為：
```PowerShell
Set-Service -Name sshd -StartupType 'Automatic'
```

不用其他設定，蠻方便的。
登入帳密則與作業系統相同。

## 設定登入後的 shell 程式

連向前述方式安裝的 SSH 伺服器後，預設會使用 `cmd.exe` 作為 shell 。
要設定為其他 shell （例如 PowerShell ）的話，要修改機碼。

方法一：用 PowerShell
```PowerShell
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -PropertyType String -Force
```

方法二：傳統「登錄編輯程式」
1. 執行 `regedit`
2. 找到 `\HKEY_LOCAL_MACHINE\SOFTWARE\OpenSSH`
3. 新增字串值，名稱為 `DefaultShell` ，值為想要的 shell 的執行檔路徑。

上面二法的路徑，均可改為接下來安裝的新版 PowerShell 。


# 新版 PowerShell

這跟傳統的 `cmd.exe` 其實是不同的 shell ，不過仍可執行大部分 `cmd` 的東西（畢竟其實是去 `PATH` 找相應的程式）

除了內建的版本，也可以自己安裝更新的版本。維護於 [GitHub](https://github.com/PowerShell/PowerShell/releases)
[支援期限對照表](https://learn.microsoft.com/en-us/powershell/scripting/install/powershell-support-lifecycle?view=powershell-7.3#powershell-end-of-support-dates)如下（2023-05-06 確認）：

|Version|Release Date|End-of-support|
|--|--|--|
|7.4 (preview)|December 20, 2022|TBD|
|7.3 (Stable)|November 9, 2022|May 8, 2024|
|7.2 (LTS-current)|November 8, 2021|November 8, 2024|

## 抱怨

雖然 PowerShell 7.2 是 LTS 版本，但就算是最新版（7.2.11），開啟時仍會提示「現在有 7.3 板可以安裝喔」。覺得煩。


# 參考

- https://learn.microsoft.com/zh-tw/windows-server/administration/openssh/openssh_install_firstuse
- https://learn.microsoft.com/en-us/powershell/scripting/install/powershell-support-lifecycle
- https://learn.microsoft.com/zh-tw/windows-server/administration/openssh/openssh_server_configuration
