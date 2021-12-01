var scriptProp =  PropertiesService.getScriptProperties().getProperties();
const TRELLO_API_URL = 'https://api.trello.com/';
const TRELLO_KEY = 'xxxx';
const TRELLO_TOKEN = 'xxxx';
const TRELLO_USER_ID = 'xxxx'
const TRELLO_CHOUJO_BOARD_ID = 'xxxx'
const TRELLO_CHOUNAN_BOARD_ID = 'xxxx'
const TRELLO_CHOUJO_TODO_LIST_ID = 'xxxx'
const TRELLO_CHOUJO_DONE_LIST_ID = 'xxxx'
const TRELLO_CHOUNAN_TODO_LIST_ID = 'xxxx'
const TRELLO_CHOUNAN_DONE_LIST_ID = 'xxxx'
const TRELLO_CHOUJO_LABEL_GREEN_ID = 'xxxx'
const TRELLO_CHOUJO_LABEL_YELLOW_ID = 'xxxx'
const TRELLO_CHOUJO_LABEL_ORANGE_ID = 'xxxx'
const TRELLO_CHOUNAN_LABEL_GREEN_ID = 'xxxx'
const TRELLO_CHOUNAN_LABEL_YELLOW_ID = 'xxxx'
const TRELLO_CHOUNAN_LABEL_ORANGE_ID = 'xxxx'
const TRELLO_CHOUJO_TASK_MESSAGE_ID = 'xxxx'
const TRELLO_CHOUNAN_TASK_MESSAGE_ID = 'xxxx'

/**
 * 長女用の初期化メソッド
 * @returns 
 */
function resetTrelloChoujoTasksToday(){
  //毎日タスクの作成
  createCard(TRELLO_CHOUJO_TODO_LIST_ID, "宿題", TRELLO_CHOUJO_LABEL_YELLOW_ID)
  createCard(TRELLO_CHOUJO_TODO_LIST_ID, "公文", TRELLO_CHOUJO_LABEL_YELLOW_ID)
  createCard(TRELLO_CHOUJO_TODO_LIST_ID, "明日の準備", TRELLO_CHOUJO_LABEL_YELLOW_ID)

  //メッセージ表示の初期化
  stats = getGraphStats(PIXELA_CHOUJO_GRAPH_NAME)
  createAttachmentAsCover(TRELLO_CHOUJO_TASK_MESSAGE_ID,PIXELA_CHOUJO_GRAPH_NAME)
  updateCountOfMessageCard(TRELLO_CHOUJO_TASK_MESSAGE_ID, stats.totalQuantity, 0)

  //完了タスクのアーカイブ
  archiveAllCardsOnList(TRELLO_CHOUJO_DONE_LIST_ID)
}

/**
 * 長男用の初期化メソッド
 * @returns 
 */
function resetTrelloChounanTasksToday(){
  //毎日タスクの作成
  createCard(TRELLO_CHOUNAN_TODO_LIST_ID, "宿題", TRELLO_CHOUNAN_LABEL_YELLOW_ID)
  createCard(TRELLO_CHOUNAN_TODO_LIST_ID, "公文", TRELLO_CHOUNAN_LABEL_YELLOW_ID)
  createCard(TRELLO_CHOUNAN_TODO_LIST_ID, "明日の準備", TRELLO_CHOUNAN_LABEL_YELLOW_ID)

  //メッセージ表示の初期化
  createAttachmentAsCover(TRELLO_CHOUNAN_TASK_MESSAGE_ID,PIXELA_CHOUNAN_GRAPH_NAME)
  updateCountOfMessageCard(TRELLO_CHOUNAN_TASK_MESSAGE_ID,  stats.totalQuantity, 0)

  //完了タスクのアーカイブ
  archiveAllCardsOnList(TRELLO_CHOUNAN_DONE_LIST_ID)
}

/**
 * ボード一覧と名前を表示（ID調査用）
 * @returns 
 */
function showBoards() {
  Logger.log('ボード一覧');
  let boards = getBoards()
  for (let i = 0; i < boards.length; i++){
    Logger.log(boards[i].id);
    Logger.log(boards[i].name);
  }
}

/**
 * ボード一覧の取得
 * @returns JSON
 */
function getBoards() {
  Logger.log("==== Get Board Ids ====")
  let params = {
    'method': 'GET',
    'headers': {'ContentType': 'application/json'},
  };
  let url = TRELLO_API_URL + '1/members/' + TRELLO_USER_ID + '/boards'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;
  
  let result = UrlFetchApp.fetch(url, params).getContentText();
  return JSON.parse(result);
}

/**
 * 指定idを持つボード情報の取得
 * @param id 
 * @returns 
 */
function getBoard(id){
  let params = {
    'method': 'GET',
    'headers': {'ContentType': 'application/json'},
    'muteHttpExceptions' : true
  };
  let url = TRELLO_API_URL + '1/boards/' + id
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;
  let result = UrlFetchApp.fetch(url, params).getContentText();
  Logger.log(result)
}

/**
 * リストIdの表示（調査用）
 * @returns 
 */
function showLists(boardId){

  let params = {
    'method': 'GET',
    'headers': {'ContentType': 'application/json'},
  };

  let url = TRELLO_API_URL + '1/boards/' + boardId + '/lists'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  let result = UrlFetchApp.fetch(url, params).getContentText();
  json = JSON.parse(result)

  for (i = 0 ; i < json.length ; i++ ){
    Logger.log( json[i].name)
    Logger.log( json[i].id)
  }
  return null;
}

/**
 * ラベルとリストを指定して、タスクカードを作成する
 * @param targetListId 
 * @param  name 
 * @param  labelId 
 * @returns 
 */
function createCard(targetListId, name, labelId){
  //targetListにすでに同名のタスクが存在する場合には生成しない
  cards = getCardsByList(targetListId)
  for (i = 0; i < cards.length; i++){
    if (cards[i].name == name){
      return
    }
  }
  createCardOnList(targetListId, name, labelId)
}

/**
 * 特定のリストに含まれるカードを取得する
 * @param tagetListId 
 * @returns JSON
 */
function getCardsByList(tagetListId){
  let requestUrl = TRELLO_API_URL + '1/lists/'+ tagetListId + '/cards'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  let params = {
    'method': 'GET',
    'headers': {'ContentType': 'application/json'},
  };

  result = UrlFetchApp.fetch(requestUrl, params);

  return JSON.parse(result)
}

/**
 * 指定したリストに指定した名前とラベルIdを付与したタスクカードを作成する
 * @param targetListId 
 * @param  cardName 
 * @param  cardLabelId 
 * @returns 
 */
function createCardOnList(targetListId, cardName, cardLabelId){
  
  let requestUrl = TRELLO_API_URL + '1/cards/'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'post',
    'payload' : {
      'name': cardName,
      'idList': targetListId,
      'idLabels': cardLabelId
    }
  }

  UrlFetchApp.fetch(requestUrl, options);
}

/**
 * Idでカード情報を取得する
 * @param id 
 * @returns 
 */
function getCardById(id) {
  let params = {
    'method': 'GET',
    'headers': {'ContentType': 'application/json'},
  };

  let url = TRELLO_API_URL + '1/cards/' + id 
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;
  let result = UrlFetchApp.fetch(url, params).getContentText();
  return JSON.parse(result)
}

/**
 * 指定されたカードの、指定されたラベルを削除する
 * @param id 
 * @param  idLabel 
 * @returns 
 */
function deleteLabelsOnCard(id, idLabel){
  let requestUrl = TRELLO_API_URL + '1/cards/' + id + '/labels/' + idLabel
        + '?key=' + TRELLO_KEY
        + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'delete',
    'contentType': 'application/json',
    'muteHttpExceptions' : true
  }

  UrlFetchApp.fetch(requestUrl, options)
}

/**
 * 指定されたリストをアーカイブする
 * @param idList 
 * @returns 
 */
function archiveAllCardsOnList(idList){
  let requestUrl = TRELLO_API_URL + '1/lists/'+ idList + '/archiveAllCards'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'post',
  }

  Logger.log(UrlFetchApp.fetch(requestUrl, options));

}

/**
 * ラベルをクリアする
 * @param id 
 * @returns 
 */
function clearLabelOfCard(id){

  let requestUrl = TRELLO_API_URL + '1/cards/'+ id
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'put',
    'payload' : {
      'idLabels': ''
    }
  }

  Logger.log(UrlFetchApp.fetch(requestUrl, options));

}

/**
 * カバー画像を張り替える
 * @param cardId 
 * @param  graph 
 * @returns 
 */
function createAttachmentAsCover(cardId, graph){

  let attachUrl = 'https://xxxxxxx.herokuapp.com/?pixela-user=' + PIXELA_USER_NAME + '&pixela-graph=' + graph
  let requestUrl = TRELLO_API_URL + '1/card/'+ cardId + '/attachments'
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'post',
    'payload' : {
      'url': attachUrl,
      'setCover': true
      },
    'muteHttpExceptions' : true
  }
  UrlFetchApp.fetch(requestUrl, options);
}

/**
 * 今日のptと合計ptをカードタスクタイトルに書き込む
 * @param id 
 * @param  total_cnt 
 * @param  today_cnt 
 * @returns 
 */
function updateCountOfMessageCard(id, total_cnt, today_cnt){
  msg = "今日：" + today_cnt + "pt、合計：" + total_cnt +"pt"
  let requestUrl = TRELLO_API_URL + '1/cards/'+ id
          + '?key=' + TRELLO_KEY
          + '&token=' + TRELLO_TOKEN;

  var options = {
    'method' : 'put',
    'payload' : {
      'name': msg
    }

  }

  UrlFetchApp.fetch(requestUrl, options);
}