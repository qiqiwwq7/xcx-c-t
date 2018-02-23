const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 判断对象是否为空
 * 通过获取对象属性，如果是{}的空对象，没有取到属性数量，则认为是NULL
 * jiangshunbin 2018-02-08
 */
const isNullObj = obj =>{
  return Object.getOwnPropertyNames(obj).length <= 0;
//   return Object.keys(obj).length <= 0;
} 

module.exports = {
  formatTime: formatTime,
  isNullObj: isNullObj
}
