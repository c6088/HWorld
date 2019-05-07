//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        this.globalData.code = res.code
        // 请求 2019/05/07
        wx.getUserInfo({
          success: res => {
            this.globalData.encryptedData = encodeURIComponent(res.encryptedData)
            this.globalData.iv = res.iv
            this.globalData.userInfo = res.userInfo
            // 请求
            var jsonObject = { code: this.globalData.code, encryptedData: this.globalData.encryptedData, iv: this.globalData.iv };
            var url = this.requestURL("/company/loginOrAddCompany", jsonObject);
            wx.request({
              url: url,
              success: res => {
                var jsonStr = res.data.data;
                console.log(jsonStr);
                jsonStr = jsonStr.replace(" ", "");
                if (typeof jsonStr != 'object') {
                  jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
                  var jj = JSON.parse(jsonStr);
                  this.globalData.openid = jj.openid;
                }
              },
              fail: res => {
                console.log('f', res)
              }
            })
          },
          fail: res => {
            console.log(res)
          }
        })
      },
      fail: res => {
        console.log(res)
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.encryptedData = res.encryptedData;
              this.globalData.iv = res.iv;
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
        else {
          wx.reLaunch({
            url: '/pages/authorize/authorize',
          })
        }
      }
      
    })
  },
  globalData: {
    userInfo:null,
    code:null,
    openId:null,
    userName:null,
    iv:null,
    encryptedData:null
  },

  serverURL: function (url) { 
        let serverAddress = "http://192.168.8.92:8080"; 
        if (url == null) return serverAddress; 
        return serverAddress + url; 
  },
  jsonToURL: function (jsonObject) {
    if (jsonObject == null) return "";
    var arr = [];
      for (var i in jsonObject) {
        var s2 = jsonObject[i];
        if (typeof (s2) == "object") {
            s2 = JSON.stringify(s2);
        }
        arr.push(i + "=" + s2);
      }
      return arr.join("&");
   },
   requestURL: function (interfaceUrl, jsonObject) {
       if (jsonObject == null) return this.serverURL(interfaceUrl);
       let str = this.jsonToURL(jsonObject);
       return this.serverURL(interfaceUrl+"?"+str);
  }
})