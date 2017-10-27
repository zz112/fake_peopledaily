// const formatTime = date => {
//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const todayDateArray = () => {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;//getMonth()返回0-11,与实际对应的话需要+1
  var day = today.getDate();
  //小于10的，前面加0
  return [year, month, day].map(formatNumber);
}
module.exports = {
  todayDateArray: todayDateArray
}
