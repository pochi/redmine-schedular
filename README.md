### Redmine Scheduler

RedmineでGoogleCalendar風のUIを利用して、予約管理を行うプラグインです。
数量が決まっている予約項目（会議室や限られたライセンスなど）を管理することができます。

### Requirements

|Element    |   Version|
|--------|------|
|Ruby |   2.0 or higher|
|Redmine |  2.3 or higher|

### Install

```
git clone https://github.com/pochi/redmine-schedular.git
bundle exec rake db:migrate_plugins
bundle exec rails s
```

### 初期設定

管理者画面のプラグイン一覧からScheduler Pluginの設定ボタンを押します。
以下の項目が設定可能です。

|設定項目    |   概要|
|--------|------|
|予約期間 |   一回あたりに予約できる最大予約日数です|
|グループリスト |  予約時に選択するチーム名一覧のリストをカスタマイズします|

![管理者管理画面](https://dl.dropboxusercontent.com/u/1760801/redmine_scheduler/admin_manage.png)

### プロジェクトごとの設定

プロジェクトの管理画面からプラグインのモジュール選択すると、プロジェクトの管理画面で
予約対象物を選択することができます。
色は一度選択すると現状変更できないようになっています。

![プロジェクト管理画面](https://dl.dropboxusercontent.com/u/1760801/redmine_scheduler/project_manage.png)

### 画面を開く

プロジェクトの"リソース予約"を選択すると別タブで画面が開きます。
ここからは大体Google Calendarと同じような動きをします。

![予約画面](https://dl.dropboxusercontent.com/u/1760801/redmine_scheduler/reserve.png)

この画面では基本機能として以下をもっています。

* Google Calendar風の操作によるUIで予約
* ライセンスリストをクリックすることで表示/非表示の切り替え

以下のバリデーョン機能を持っています。

* 予約期間以上設定できない
* プロジェクト管理で設定したライセンス数以上は予約できない

### [TODO]Prefixについて

もしURLをNginxなどのプロキシを使って変更する場合、現状JSファイルを変更しなければいけません。
一覧をはっておきますが、メンテナンスできるかは自信がありません。

|ファイル名    |  行数|
|--------|------|
|pochi_calendar.js |  64|
|pochi_calendar.js |  166|
|pochi_calendar.js |  272|
|pochi_calendar.js |  437|
|pochi_calendar.js |  452|

