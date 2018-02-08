/**
 * 公用数据
 * 逐步取代commondata.js
 * 示例公用js，摸索公有方法、公有数据的写法和调用
 * @author jiangshunbin 2018-02-07
 */

// const app = getApp();  //非页面js无法通过getApp()获取对象。。。

// function sayHello(name) {
//     console.log(`Hello ${name} !`);
// }

// function sayGoodbye(name) {
//     console.log(`Goodbye ${name} !`)
// }

// module.exports.sayHello = sayHello
//        exports.sayGoodbye = sayGoodbye

module.exports = {
    // sayHello: sayHello,
    // sayGoodbye: sayGoodbye,
    systemInfo: null,
    userInfo: null
}

/**
 * const globalData = require('/utils/global_data.js');
 * 
 * globalData.sayGoodbye('abc');
 * globalData.sayHello('lisi');
 * globalData.testData = 'aaaa';
 * console.log(globalData.testData)
 * 
 */