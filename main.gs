var token = '<PUT_YOUT_TOKEN_HERE>';
var alarm_res = 10;                   // 秒，Response超時通知
var alarm_sched_alive = 8 * 60 * 60;  // 秒，定時回報排程正常
var service_list = [
  'https://rc.pdis.nat.gov.tw',
  'https://gitlab.pdis.dev',
  'https://sayit.pdis.nat.gov.tw',
  'https://pdis.tw',
  'https://pdis.nat.gov.tw',
  'https://ey.pdis.nat.gov.tw',
  'https://polis.gov.tw',
  'https://polis.pdis.nat.gov.tw',
  'https://booked.pdis.nat.gov.tw',
  'https://aucal.pdis.nat.gov.tw/getReserve',
  'https://raychat.pdis.nat.gov.tw'
];
var divider = '\n===================';

function checkService() {
  var last_time = PropertiesService.getScriptProperties().getProperty('timestamp');
  var current_time = new Date().getTime();

  var result = '';
  var result_suffix = '';
  var notify = false;
  service_list.forEach(function (url) {
    try {
      var start = new Date().getTime();
      var res = UrlFetchApp.fetch(url).getResponseCode();
      var end = new Date().getTime();
      var consume = (end - start) / 1000;
      if (res == 200) {
        if (consume > alarm_res) {
          notify = true;
          result_suffix += '🐢 ';
        }
        result_suffix += '\n' + consume + 's ' + url;
      }
      else {
        result += divider + '\n' + url + ' 壞了🙁\nHTTP狀態碼:' + res;
        notify = true;
      }
    }
    catch (e) {
      result += divider + '\n' + url + ' 壞了🙁\n' + e;
      notify = true;
    }
  });
  result += divider + result_suffix;
  result = result.replace(/https:\/\//g, "");
  console.log(result);
  if (Number(current_time) - Number(last_time) > alarm_sched_alive * 1000) {
    PropertiesService.getScriptProperties().setProperty('timestamp', current_time.toString());
    notify = true;
    sendNotify({
      message: "我是排程，我還活著，我每八小時會告訴大家我好好的🙂",
      imageFullsize: "https://i.imgur.com/ktTSzmQ.jpg",
      imageThumbnail: "https://i.imgur.com/ktTSzmQ.jpg"
    });
  }
  if (notify) {
    sendNotify({
      message: result
    });
  }
}

function sendNotify(content) {
  var option = {
    method: 'post',
    headers: { Authorization: 'Bearer ' + token },
    payload: content
  };
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', option);
}