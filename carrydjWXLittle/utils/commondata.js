//全局公共数据
var CommonData = CommonData || (function(){
    var CD = {
        //appFrom: 'weixin',  //const
        deviceType:'', 
        deviceId:'', 
        versionCode: 1,
        appVersion:'1.0',
        loginUserId:'',
        token:'',
        terminalDef: 'carrydjWXLittle'
    }

    return CD;
}());

module.exports = {
    commonData: CommonData
}
