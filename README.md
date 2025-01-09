# Slack Notification for Google Calendar Events

このプロジェクトは、Googleカレンダーの予定をSlackに通知するGoogle Apps Scriptです。指定したカレンダーのイベントが始まる30分前にSlackチャンネルへ自動で通知を送信します。

## 概要

- **Googleカレンダーのイベント**を取得し、**Slack**に通知します。
- 通知には、タイトル、開始・終了時刻、場所、主催者、参加者、説明文などが含まれます。
- 通知済みのイベントにはタグを付け、再度通知しないように制御します。

## 必要なツール

- **Google Apps Script**（Google Workspace内で利用可能）
- **Slackアプリ**およびSlack APIトークン
- **clasp**（Apps Scriptをローカルから管理するCLIツール、VSCodeなど手に馴染んだエディタで開発したい場合に便利）

## ディレクトリ構成

```
slack-notification/
├── .clasp.json
├── .claspignore
├── .gitignore
├── README.md
├── appsscript.json
├── config.json
└── main.js
```

## ブランチ構成について

本プロジェクトでは、開発用とgithubへの公開用で異なるブランチを使用しています。

*   **公開用ブランチ (`main`):** このブランチはGitHubで公開するためのブランチです。開発用ブランチ内の個人情報や機密情報を含まないように構成されています。
*   **開発用ブランチ (非公開):** 実際の開発作業はこのブランチで行っています。SlackトークンやカレンダーID等の個人情報を含む過去のコミット履歴が存在するこのブランチはGitHubには公開していません。

### 各ファイルの説明

- **`.clasp.json`**：claspの設定ファイルです。Google Apps Scriptプロジェクトとの連携情報を管理します。
- **`.claspignore`**：claspでアップロードしないファイルやディレクトリを指定します。
- **`.gitignore`**：GitHubにアップロードしないファイルを指定します（`config.json`, `.clasp.json`）。
- **`appsscript.json`**：Apps Scriptのプロジェクト設定ファイルです。
- **`config.json`**：SlackトークンやカレンダーIDなどの設定情報を保存します（セキュリティのため、Git管理外）。
- **`main.js`**：Slack通知のメイン処理を行います。

## 環境設定

### 1. Google Apps Script の設定

1. Googleドライブで新しいApps Scriptプロジェクトを作成します。
2. Slack Appのライブラリを追加します。その際、スクリプトID(SlackAppのスクリプトID)「1on93YOYfSmV92R5q59NpKmsyWIQD8qnoLYk-gkQBI92C58SPyA2x1-bq」を入力してください。
2. Google Apps Script APIを有効化します。

### 2. claspの設定

ローカルでApps Scriptを管理するために、claspの設定を行います。(インストールしていない場合は、以下コマンドをそれぞれ実行し、ログインしてからclaspの設定を行なってください。)

```bash
npm install -g @google/clasp
clasp login
```

### 3. Slackアプリの作成とトークン取得

1. Slack APIサイトで新しいアプリを作成します。
2. Slack Botを作成します。
3. **Bot User OAuth Token**（例：`xoxb-...`）を取得します。

### 4. 環境変数の設定

Google Apps Scriptの**スクリプトプロパティ**にSlackトークンとカレンダーIDを設定します。

1. Google Apps Scriptエディタのメニューから **「ファイル」→「プロジェクトの設定」→「スクリプトのプロパティ」** に移動。
2. 以下のキーと値を設定します：

   - **`SLACK_TOKEN`**：取得したSlackトークン
   - **`CALENDAR_ID`**：通知対象のGoogleカレンダーID

## アップロードと実行

### 1. claspを使用してApps Scriptにアップロード

```bash
clasp push
```

### 2. トリガーの設定

Google Apps Scriptエディタで定期的にスクリプトが実行されるようにトリガーを設定します。

1. **「トリガー」**メニューに移動。
2. **`informCalendarToSlack`** 関数を選択し、適切なタイミング（例：毎分ごと）で実行するよう設定します。一度Slack通知したスケジュールは「通知済」のタグ付けを行っているため、毎分おきにGASが実行されても、重複して通知されることはありません。

## 使用方法

1. Googleカレンダーにイベントを作成する際、通知したいイベントのタイトルに **`__`**（アンダースコア2つ）を含めます。
2. イベント開始30分前になると、Slackに通知が送られます。

### 例：Slackに送信されるメッセージ

```
【予定のお知らせ】  
タイトル: 就職ガイダンス  
開始時刻: 14:00  
終了時刻: 15:00  
場所: オンライン  
主催者: organizer@example.com  
参加者: user1@example.com, user2@example.com  

説明:  
就活成功のための自己分析を行います。
また、自己PRの具体的な作成方法について学習します。
```

## セキュリティに関する注意

- **`config.json`**, **`.clasp.json`**, **`appsscript.json.json`** には個人情報が含まれているため、**`.gitignore`** でGitHubにアップロードされないように設定しています。
- **Slackトークン**や**カレンダーID**は、直書きしないことをおすすめします。
