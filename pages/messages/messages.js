const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indexTab:["综合","热度","时间","价格"],
    totalPage: 1,
    page: 1,
    serverUrl: "",
    surveyList: [],
    searchContent: "",
    sort:0,
    selected:"selected",
    normal:"normal",
  },
  showSurveyInfo:function(e){
    var that = this;
    var surveyList = this.data.surveyList;
    console.log(e);
    console.log(e.currentTarget.dataset);
    var arrindex = e.currentTarget.dataset.arrindex;
    var surveyInfo = JSON.stringify(surveyList[arrindex]);
    console.log(surveyInfo);

    wx.redirectTo({
      url: '../show/show?surveyInfo=' + surveyInfo,
    })
  },
  onShow: function () {
    var that = this;
    var searchContent = app.search;
    var isSaveRecord = app.isSaveRecord;
    console.log("isSaveRecord:" + isSaveRecord);
    console.log("searchContent:" + searchContent);
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }
    that.setData({
      searchContent: searchContent
    });
    app.search = null;
    app.isSaveRecord = null;
    wx.showLoading({
      title: '请等待',
    })
    var page = that.data.page;
    that.getAllSurveyList(page, isSaveRecord);
  },
  getAllSurveyList: function (page, isSaveRecord) {
    var that = this;
    var serverUrl = app.serverUrl;
    var searchContent = that.data.searchContent;
    var sort = that.data.sort;
    wx.request({
      url: serverUrl + '/survey/showAll?page=' + page + '&sort=' + sort +'&isSaveRecord=' + isSaveRecord,
      method: 'POST',
      data: {
        title: searchContent
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data);
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        var status = res.data.status;
        if (page === 1) {
          that.setData({
            surveyList: []
          });
        }
        console.log(res.data.data.rows);
        var surveyList = res.data.data.rows;
        console.log("surveyList " + surveyList);

        var newSurveyList = that.data.surveyList;

        that.setData({
          surveyList: newSurveyList.concat(surveyList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
        console.log(that.data.surveyList);
      }
    })
  },
  changeindex:function(e){
    var that = this;
    console.log(e);
    var arrindex = e.target.dataset.arrindex;
    // console.log(arrindex);
    that.setData({
      sort: arrindex
    })
    that.getAllSurveyList(1,0);
    // var indexTab = that.data.indexTab;
    // app.sort = that.data.sort;
    // wx.switchTab({
    //   url: '../messages/messages',
    // })
    console.log("has jump");

  },
  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo'
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getAllSurveyList(1, 0);

  },
  onReachBottom: function () {
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
    that.getAllSurveyList(page, 0);
  },
})
