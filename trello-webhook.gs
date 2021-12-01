var callbackUrl = "https://script.google.com/macros/s/xxxxx/exec";
var target_bord_ids = [TRELLO_CHOUJO_BOARD_ID, TRELLO_CHOUNAN_BOARD_ID]

/**
 * Webアプリの更新時に実行する関数。以下の手順2で実行するもの
 * 1. デプロイ→「新しいウェブアプリの公開」→限定公開
 * 2. callbackUrlを変更して、clearAndCreateWebhook()を実行する
 * 3. デプロイ→「デプロイを管理」→全員
 */
function clearAndCreateWebhook(){
  webhooks = getWebhook()
  for(i = 0; i < webhooks.length; i++){
    deleteWebhook(webhooks[i].id)
  }

  for(i = 0; i < target_bord_ids.length; i++){
    createWebhook(target_bord_ids[i])
  }
}
/**
 * boardIdにWebhookを追加する
 */
function createWebhook(boardId){
  var requestUrl = 'https://api.trello.com/1/tokens/' + TRELLO_TOKEN + '/webhooks/?key=' + TRELLO_KEY;
  var options = {
    'method' : 'post',
    'headers': {'ContentType': 'application/json'},
    'payload' : {
      'description': 'Webhook of Trello',
      'callbackURL': callbackUrl,
      'idModel': boardId
    },
    'muteHttpExceptions' : true
  }
  Logger.log(UrlFetchApp.fetch(requestUrl, options));
}

/**
 * webhookのリストを取得する
 */
function getWebhooks(){
  var requestUrl = 'https://api.trello.com/1/tokens/' + TRELLO_TOKEN + '/webhooks/?key=' + TRELLO_KEY;

  var options = {
    'method' : 'get',
    'payload' : {
    }
  }
  ret = UrlFetchApp.fetch(requestUrl, options)
  json = JSON.parse(ret)
  return json
}

/**
 * 指定したidのWebhookを削除する
 */
function deleteWebhook(id){
  var requestUrl = 'https://api.trello.com/1/tokens/' + TRELLO_TOKEN + '/webhooks/'+id+'?key=' + TRELLO_KEY;
  Logger.log(requestUrl)

  var options = {
    'method' : 'delete',
    'payload' : {
    }
  }
  ret = UrlFetchApp.fetch(requestUrl, options)
  Logger.log(ret);
}
