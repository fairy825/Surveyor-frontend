const app = getApp()

Page({
  data: {
    imageUrl : "/assets/avatar.png",
    nickName:'',
    point:0,
  },

  onShow () {
    var that = this;
    var user = app.getGlobalUserInfo();
    wx.showLoading({
      title: '请等待',
    })
    var serverUrl = app.serverUrl;

    wx.request({
      url: serverUrl + '/user/query?userId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        headerUserId: user.id,
        headerUserToken: user.userToken
      },
      success(res) {
        console.log(res.data);
        wx.hideLoading();
        var status = res.data.status;
        if (status == 200) {
          var userInfo = res.data.data;
          that.setData({
            nickName: userInfo.nickname,
            point: userInfo.point
          })
        } else{

          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.reLaunch({
                  url: '../login/login',
                })
              }, 2000);
            }
          })
        }
      }

    })
  },
  logout: function (params) {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data);
        if (res.data.status == 200) {
          wx.removeStorageSync("userInfo");
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  }
})
