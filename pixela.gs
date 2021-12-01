const PIXELA_USER_NAME = "xxxxxx"
const PIXELA_USER_SECRET = "xxxxxxx"
const PIXELA_CHOUNAN_GRAPH_NAME = "xxxx-sora"
const PIXELA_CHOUJO_GRAPH_NAME = "xxxx-ajisai"

/**
 * カウントが0のときに取得できないので毎日初期化してあげる
 */
function resetPixelaToday(){
  postGraph(PIXELA_CHOUJO_GRAPH_NAME, getTodayStr(), "0")
  postGraph(PIXELA_CHOUNAN_GRAPH_NAME, getTodayStr(), "0")
}

/**
 * dateのグラフを指定したquantityで更新する
 * @param graph 
 * @param  date 
 * @param  quantity 
 * @returns 
 */
function postGraph(graph, date, quantity){
  let requestUrl = 'https://pixe.la/v1/users/' + PIXELA_USER_NAME + '/graphs/' + graph
  var options = {
    'method' : 'post',
    'headers': {'X-USER-TOKEN': PIXELA_USER_SECRET},
    'payload' : JSON.stringify({
      'date': date,
      'quantity': quantity,
    }),
    'muteHttpExceptions' : false
  }
  UrlFetchApp.fetch(requestUrl, options);

}
/**
 * 日付がdateのグラフを取得する
 * @param graph 
 * @param  date 
 * @returns 
 */
function getGraph(graph, date){
  let requestUrl = 'https://pixe.la/v1/users/' + PIXELA_USER_NAME + '/graphs/' + graph + '/' + date
  var options = {
    'method' : 'get',
    'headers': {'X-USER-TOKEN': PIXELA_USER_SECRET}
  }
  result = UrlFetchApp.fetch(requestUrl, options).getContentText()
  //Logger.log(result)
  return JSON.parse(result)

}

function testGetStats(){

    stats = getGraphStats(PIXELA_CHOUJO_GRAPH_NAME)
    updateCountOfMessageCard(TRELLO_CHOUJO_TASK_MESSAGE_ID, stats.totalQuantity, stats.todaysQuantity)

}

/**
 * svgでなくpngが欲しいので、herokuを噛ませて画像のURLを作る
 * @param graph 
 * @returns 
 */
function getGraphPng(graph){
  let requestUrl = 'https://xxxxxxxx.herokuapp.com/?pixela-user=' + PIXELA_USER_NAME + '&pixela-graph=' + graph
  result = UrlFetchApp.fetch(requestUrl)
  return result
}


/**
 * 統計情報（合計値、今日の値）を取得する
 * @param graph 
 * @returns 
 */
function getGraphStats(graph){
  let requestUrl = 'https://pixe.la/v1/users/' + PIXELA_USER_NAME + '/graphs/' + graph + '/stats'
  var options = {
    'method' : 'get',
    'headers': {'X-USER-TOKEN': PIXELA_USER_SECRET}
  }
  result = UrlFetchApp.fetch(requestUrl, options).getContentText()
  return JSON.parse(result)
}
