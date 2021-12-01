/**
 メイン処理
 Trello上で何かしらの変更が発生した時に毎回実行され、特定の条件下で実行する
*/
function doPost(e){
  var contents = JSON.parse(e.postData.contents);

  logSpreadsheet(contents)
  var actionType = contents.action.type;
  var destinationList = contents.action.data.listAfter;
  
  // カードが目的のリストに移動された場合のみ通知し、それ以外の場合は終了
  if(actionType !== 'updateCard' || !destinationList) { return; }
  
  var cardName = contents.action.data.card.name;
  var cardId = contents.action.data.card.id;
  //var labelIds = contents.action.data.card.idLabels;
  var boardId = contents.action.data.board.id;
  var listName = destinationList.name;
  var shortLink = 'https://trello.com/c/' + contents.action.data.card.shortLink;
  today_str = getTodayStr()
  logSpreadsheet(cardName + cardId + listName)

  if (listName != "おわったこと") {
    return
  }

  card = getCardById(cardId)
  labelIds = card.idLabels

  if (boardId == TRELLO_CHOUJO_BOARD_ID){
    ret = getGraph(PIXELA_CHOUJO_GRAPH_NAME, getTodayStr())
    pt = 0
    if (labelIds.includes(TRELLO_CHOUJO_LABEL_GREEN_ID)){
      pt = 1
      idLabel = TRELLO_CHOUJO_LABEL_GREEN_ID
    }else if (labelIds.includes(TRELLO_CHOUJO_LABEL_YELLOW_ID)){
      pt = 3
      idLabel = TRELLO_CHOUJO_LABEL_YELLOW_ID
    }else if(labelIds.includes(TRELLO_CHOUJO_LABEL_ORANGE_ID)){
      pt = 5
      idLabel = TRELLO_CHOUJO_LABEL_ORANGE_ID
    }
    score = Number(ret.quantity) + pt
    clearLabelOfCard(cardId)
    createAttachmentAsCover(TRELLO_CHOUJO_TASK_MESSAGE_ID,PIXELA_CHOUJO_GRAPH_NAME)
    putGraph(PIXELA_CHOUJO_GRAPH_NAME, getTodayStr(),score.toString())
    stats = getGraphStats(PIXELA_CHOUJO_GRAPH_NAME)
    updateCountOfMessageCard(TRELLO_CHOUJO_TASK_MESSAGE_ID, stats.totalQuantity, stats.todaysQuantity)

  }
  
  if (boardId == TRELLO_CHOUNAN_BOARD_ID){
    ret = getGraph(PIXELA_CHOUNAN_GRAPH_NAME, getTodayStr())
    if (labelIds.includes(TRELLO_CHOUNAN_LABEL_GREEN_ID)){
      pt = 1
      idLabel = TRELLO_CHOUNAN_LABEL_GREEN_ID
    }else if (labelIds.includes(TRELLO_CHOUNAN_LABEL_YELLOW_ID)){
      pt = 3
      idLabel = TRELLO_CHOUNAN_LABEL_YELLOW_ID
    }else if(labelIds.includes(TRELLO_CHOUNAN_LABEL_ORANGE_ID)){
      pt = 5
      idLabel = TRELLO_CHOUNAN_LABEL_ORANGE_ID
    }
    score = Number(ret.quantity) + pt
    clearLabelOfCard(cardId)
    createAttachmentAsCover(TRELLO_CHOUNAN_TASK_MESSAGE_ID,PIXELA_CHOUNAN_GRAPH_NAME)
    putGraph(PIXELA_CHOUNAN_GRAPH_NAME, getTodayStr(),score.toString())
    stats = getGraphStats(PIXELA_CHOUNAN_GRAPH_NAME)
    updateCountOfMessageCard(TRELLO_CHOUNAN_TASK_MESSAGE_ID, stats.totalQuantity, stats.todaysQuantity)

  }
  
  //notifyToSlack(message)
  logSpreadsheet(message)
}

/**
 * 毎日、Trello、Pixelaの初期化をするメソッド 朝0~1時に呼ぶ
 */
function initializeParDay(){
  resetPixelaToday()
  resetTrelloChoujoTasksToday()
  resetTrelloChounanTasksToday()
}

/**
 * yyyyMMdd形式の今日の日付を返す
 * @returns 'yyyyMMdd'
 */
function getTodayStr(){
  var date = new Date();
  var today_str = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyyMMdd')
  //Logger.log(today_str)
  return today_str
}

/**
 * ロガーとして利用する。'log'というシートにログを記述する
 * @param memo 
 * @returns 
 */
function logSpreadsheet(memo){
    // 現在開いているスプレッドシートを取得
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 現在開いているシートを取得
  var sheet = spreadsheet.getSheetByName("log")
  

  let lastRow = sheet.getLastRow();
  // 指定したセルの値を変更する
  Logger.log(lastRow+1, memo)
  sheet.getRange(lastRow+1,1).setValue(memo);
}