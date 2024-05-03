---
title: 在 Windows 11 工作列系統匣中刪除重複的 PowerToys 圖示
tags: [程式, Windows, PowerToys]
---

每次 PowerToys 更新時，新版本均會被判定為新的程式，進而套用預設的「是否於系統匣中隱藏」設定。
若進入 `設定` ＞ `個人化` ＞ `工作列` ＞ `其他系統匣圖示` 嘗試調整，會發現有多個 PowerToys 圖示。推測是因為更新後並未刪除舊的。

找到[這篇](https://superuser.com/questions/1332399/where-is-the-icon-tray-notification-area-registry-stored)提到系統匣圖示是在這個機碼進行維護：

```
HKEY_CURRENT_USER\Control Panel\NotifyIconSettings
```

用 `regedit` 進入「登錄編輯程式」找到該機碼後，逐一確認子機碼中誰的 `InitialTooltip` 是 PowerToys ，並且留意不要刪到最新的。
把舊的都刪完後，`設定` 那邊的系統匣圖示清單就清爽多了。
