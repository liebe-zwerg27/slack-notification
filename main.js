function informCalendarToSlack() {
  // SlackAPIのトークンを設定する
  let slackToken = PropertiesService.getScriptProperties().getProperty('SLACK_TOKEN');
  let slackApp = SlackApp.create(slackToken);
  // メッセージを投稿するチャンネルを定義する
  let channelId = 'calendar-notification';
  // Googleカレンダーを取得する
  let calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
  let myCalendar = CalendarApp.getCalendarById(calendarId)
  // Googleカレンダーの予定取得する日を設定する
  let calDate = new Date();
  // Googleカレンダーのイベントを取得する
  let myEvent = myCalendar.getEventsForDay(calDate);
  const tagNotifired = 'notifired';
  // Slackに通知するテンプレートを定義する
  const messageTemplate = `
  *【予定のお知らせ】*  
  *タイトル*: ${'${title}'} 
  *${'${timeLabel}'}*: ${'${startTime}'}  
  *${'${endTimeLabel}'}*: ${'${endTime}'}    
  *場所*: ${'${location}'}  
  *主催者*: ${'${organizer}'}  
  *参加者*: ${'${attendees}'}  
  
  *説明*: 
  ${'${description}'}  
  `;

  // Slackに通知するGoogleカレンダーの予定メッセージを作成する
  for(let i = 0; i < myEvent.length; i++){
    if (myEvent[i].getTitle().includes("__") && !myEvent[i].getTag(tagNotifired)){
      // 予定の開始時間を取得する
      let startTime = myEvent[i].getStartTime();
      // 予定の開始時間から30分引いた時刻を取得する
      let minutesBefore = (startTime.getTime() - 30 * 60 * 1000);
      // 現在時刻を取得する
      let now = new Date();  
    
      // 「現在時刻が、予定の開始時間から30分引いた時間を超過していたら、Slackに通知する」 かつ、「開始時間を過ぎた場合は通知しない」
      if (minutesBefore < now && now < startTime){
        // タイトル、終了時刻、場所、主催者、参加者、説明文を取得する
        let title = myEvent[i].getTitle().replace("__", "");
        let endTime = myEvent[i].getEndTime();
        let location = myEvent[i].getLocation() || "場所の指定はありません。";
        let organizer = myEvent[i].getCreators() || "主催者情報はありません。";
        let attendees = myEvent[i].getGuestList().map(guest => guest.getEmail()).join(', ') || "参加者情報はありません。";
        let description = myEvent[i].getDescription().replace(/<br>/g, '\n').replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '') || "説明はありません。";

        // 時刻を24時間表記に整形する関数
        function formatTime(date) {
          return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        }

        // 日付と時刻をフォーマットする関数
        function formatDateTime(date) {
          return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${formatTime(date)}`;
        }

        // 開始日と終了日が同じかどうか判定する
        let isSameDay = startTime.toDateString() === endTime.toDateString();

        // 表示する時刻・日時とラベルを決定する
        let startTimeDisplay = isSameDay ? formatTime(startTime) : formatDateTime(startTime);
        let endTimeDisplay = isSameDay ? formatTime(endTime) : formatDateTime(endTime);
        let timeLabel = isSameDay ? '開始時刻' : '開始日時';
        let endTimeLabel = isSameDay ? '終了時刻' : '終了日時';

        // Slackに流す本文の生成する
        // テンプレートにデータを埋め込む
        let message = messageTemplate
          .replace('${title}', title)
          .replace('${timeLabel}', timeLabel)
          .replace('${startTime}', startTimeDisplay)
          .replace('${endTimeLabel}', endTimeLabel)
          .replace('${endTime}', endTimeDisplay)
          .replace('${location}', location)
          .replace('${organizer}', organizer)
          .replace('${attendees}', attendees)
          .replace('${description}', description);

        // SlackAppオブジェクトのpostMessageメソッドでボット投稿を行う
        slackApp.postMessage(channelId, message);
        
        // 通知が完了した予定にタグ付けして再度通知されないようにする
        myEvent[i].setTag(tagNotifired, 'true');    
      }
    }
  }
}

