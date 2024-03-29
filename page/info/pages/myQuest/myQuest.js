const app = getApp()
var sliderWidth = 96;

Page({
  data: {
    tabs: ["全部", "进行中", "未发布", "已完成"],
    page: 1,
    totalPage: 1,
    serverUrl: "",
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    surveyList: [],
    choice: 0,
    selected: "selected",
    normal: "normal",
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    var page = that.data.page;
    that.getMySurveyList(page);
  },
  getMySurveyList: function(page, status) {
    var that = this;
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    var url = serverUrl + '/survey/getSurveyByUser?userId=' + userInfo.id + '&page=' + page;
    if (status != undefined && status != '' && status != null)
      url = serverUrl + '/survey/getSurveyByUserAndStatus?userId=' + userInfo.id + '&page=' + page + '&status=' + status;
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        headerUserId: userInfo.id,
        headerUserToken: userInfo.userToken
      },
      success(res) {
        console.log(res.data);
        if (res.data.status!=200){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.reLaunch({
                  url: '/page/tabBar/login/login',
                })
              }, 2000);
            }
          })
        }
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        if (page == 1) {
          that.setData({
            surveyList: []
          });
        }
        var surveyList = res.data.data.rows;
        var newSurveyList = that.data.surveyList;
        that.setData({
          surveyList: newSurveyList.concat(surveyList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
      }
    })
  },

  tabClick: function(e) {
    var that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    var activeIndex = that.data.activeIndex;
    if (activeIndex == 0) that.getMySurveyList(1);
    else that.getMySurveyList(1, activeIndex);
  },
  stopAndStart: function(surveyId, status) {
    var that = this;
    var serverUrl = that.data.serverUrl;
    var user = app.getGlobalUserInfo();

    wx.request({
      url: serverUrl + '/survey/stopAndStart',
      data: {
        id: surveyId,
        status: 3 - status
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        headerUserId: user.id,
        headerUserToken: user.userToken
      },
      success(res) {
        console.log(res.data);
        var status = res.data.status;
        if (status == 200) {
          wx.navigateTo({
            url: '../myQuest/myQuest',
          })
        } else {

          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
            success: function () {
              setTimeout(function () {
                wx.reLaunch({
                  url: '/page/tabBar/login/login',
                })
              }, 2000);
            }
          })
        }
      }
    })
  },
  actionSheetTap(e) {
    var that = this;
    var surveyId = e.currentTarget.id;
    var serverUrl = that.data.serverUrl;
    var arrindex = e.currentTarget.dataset.arrindex;
    var surveyInfo = that.data.surveyList[arrindex];
    var status = surveyInfo.status;
    var itemList;
    if (status == 1) {
      itemList = ['编辑', '暂停', '分享', '结果', '删除'];
    } else if (status == 2) {
      itemList = ['编辑', '开始', '分享', '结果', '删除'];
    }

    wx.showActionSheet({
      itemList: itemList,
      success(e) {
        switch (e.tapIndex) {
          case 0:
            if (status == 1) {
              wx.showToast({
                title: '请先暂停问卷',
                icon: 'none'
              })
            } else {
              wx.navigateTo({
                url: '../../../create/pages/edit/edit?surveyId=' + surveyId,
              })
            }
            break;
          case 1:
            var title;
            if (status == 1) title = '确认暂停？';
            else if (status == 2) title = '确认开始？'
            wx.showModal({
              title: title,
              success(res) {
                if (res.confirm) {
                  that.stopAndStart(surveyId, status);

                } else if (res.cancel) {}
              }
            })

            break;
          case 2:
            that.stopAndStart(surveyId, 2);
            wx.navigateTo({
              url: '../../../create/pages/release/release?surveyId=' + surveyId,
            })

            break;
          case 3:
            wx.navigateTo({
              url: '../../../analysis/pages/result/result?surveyId=' + surveyId,
            })
            break;
          case 4:
            if (status == 1) {
              wx.showToast({
                title: '请先暂停问卷',
                icon: 'none'
              })
            } else {
              var user = app.getGlobalUserInfo();
              wx.showModal({
                title: '确认删除？',
                success(res) {
                  if (res.confirm) {

                    wx.request({
                      url: serverUrl + '/survey/delete?id=' + surveyId,
                      method: 'POST',
                      header: {
                        'content-type': 'application/json', // 默认值
                        headerUserId: user.id,
                        headerUserToken: user.userToken
                      },
                      success(res) {
                        var status = res.data.status;
                        if (status == 200) {
                          wx.redirectTo({
                            url: '../myQuest/myQuest',
                          })
                        } else {

                          wx.showToast({
                            title: res.data.msg,
                            icon: 'none',
                            duration: 1000,
                            success: function () {
                              setTimeout(function () {
                                wx.reLaunch({
                                  url: '/page/tabBar/login/login',
                                })
                              }, 2000);
                            }
                          })
                        }
                      }
                    })
                  } else if (res.cancel) {}
                }
              })
            }
        }
      }
    })
  },
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getMySurveyList(1);
  },

  onReachBottom: function() {
    var that = this;
    wx.showLoading({
      title: '请等待',
    })
    var currentPage = that.data.page;
    var totalPage = that.data.totalPage;
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已经没有问卷啦',
        icon: 'none',
        duration: 3000
      })
      return;
    }
    var page = currentPage + 1;
    var activeIndex = that.data.activeIndex;
    if (activeIndex == 0) that.getMySurveyList(page);
    else that.getMySurveyList(page, activeIndex);
  },

});