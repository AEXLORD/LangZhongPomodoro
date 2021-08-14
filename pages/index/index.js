//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    clockShow:false,
    clockHeight:0,
    time:'30',
    relaxTime:'3',
    mTime:1800000,
    timeStr:'30:00',
    rate:'',
    timer:null,
    cateArr:[
      {
        icon:'work',
        text:'工作'
      },
      {
        icon:'study',
        text:"学习",
      },
      {
        icon:'think',
        text:'思考'
      },
      {
        icon:'write',
        text:'写作'
      },
      {
        icon:'sport',
        text:'运动'
      },
      {
        icon:'read',
        text:"阅读"
      }
    ],
    cateActive:'0',
    currCateText:'工作',
    okShow:false,
    isRelax:false,
    workOrRelax:'1',
    pauseShow:true,
    continueCancleShow:false,
    isVibrate:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    // 750rpx 
    var res = wx.getSystemInfoSync();
    var rate = 750 / res.windowWidth;

              //  ? / res.windowHeight;
    this.setData({
      rate: rate,
      clockHeight: rate* res.windowHeight
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  slideChange: function (e) {
    this.setData({
      time:e.detail.value
      // time:0.1
    })
  },
  slideChange2: function (e) {
    this.setData({
      relaxTime:e.detail.value
      // relaxTime:0.1
    })
  },
  clickCate:function (e) {
    this.setData({
      cateActive:e.currentTarget.dataset.index,
      currCateText:this.data.cateArr[e.currentTarget.dataset.index].text
    })
  },
  start: function () {
    this.setData({
      clockShow:true,
      mTime:this.data.time*60*1000,
      timeStr:parseInt(this.data.time) >= 10 ? this.data.time+':00' : '0'+this.data.time+':00',
      workOrRelax:'1'
    })
    this.drawBg();
    this.drawActive(this.data.workOrRelax);
  },
  drawBg:function () {
    var lineWidth = 6 / this.data.rate; // px
    var ctx =wx.createCanvasContext('progress_bg');
    ctx.setLineWidth(lineWidth);
    ctx.setStrokeStyle('#000000');
    ctx.setLineCap('round');
    ctx.beginPath();
    ctx.arc(400/this.data.rate/2,400/this.data.rate/2,400/this.data.rate/2- 2* lineWidth,0,2*Math.PI,false);
    ctx.stroke();
    ctx.draw();
  },
  drawActive: function (num) {
    var _this = this;
    var timer = setInterval(function (){
      // 1.5 3.5
      // 0 2 
      // 300000 100
      // 3000
      // 2 / 3000
      if(num==1){
        var angle = 1.5 + 2*(_this.data.time*60*1000 - _this.data.mTime)/(_this.data.time*60*1000);
      }else if(num == 2){
        var angle = 1.5 + 2*(_this.data.relaxTime*60*1000 - _this.data.mTime)/(_this.data.relaxTime*60*1000);
      }
      var currentTime = _this.data.mTime - 100
      _this.setData({
          mTime: currentTime
      });
      if(angle < 3.5) {
        if(currentTime % 1000 == 0) {
          var timeStr1 = currentTime / 1000; // s
          var timeStr2 = parseInt(timeStr1 / 60) // m
          var timeStr3 = (timeStr1 - timeStr2 * 60) >= 10 ? (timeStr1 - timeStr2 * 60) : '0' + (timeStr1 - timeStr2 * 60);
          var timeStr2 = timeStr2 >= 10 ? timeStr2:'0'+timeStr2;
          _this.setData({
            timeStr:timeStr2+':'+timeStr3
          })
        }
        var lineWidth = 6 / _this.data.rate; // px
        var ctx = wx.createCanvasContext('progress_active');
        ctx.setLineWidth(lineWidth);
        ctx.setStrokeStyle('#ffffff');
        ctx.setLineCap('round');
        ctx.beginPath();
        ctx.arc(400 / _this.data.rate / 2, 400 / _this.data.rate / 2, 400 / _this.data.rate / 2 - 2 * lineWidth, 1.5 * Math.PI, angle * Math.PI, false);
        ctx.stroke();
        ctx.draw();
      } else {
        if(num == 1){
          var logs = wx.getStorageSync('logs') || [];
          logs.unshift({
            date: util.formatTime(new Date),
            cate: _this.data.cateActive,
            time: _this.data.time
          });
          wx.setStorageSync('logs', logs);
          _this.setData({
            timeStr:'00:00',
            isRelax:true,
            okShow:false,
            pauseShow: false,
            continueCancleShow: false        
          })
          if (_this.data.isVibrate){
            wx.vibrateLong({
              success: (res) => {},
            });
          }else{
            if(_this.data.currCateText == "工作"){
              _this.playMusic(1);
            }else if(_this.data.currCateText == "学习"){
              _this.playMusic(2);
            }else if(_this.data.currCateText == "思考"){
              _this.playMusic(3);
            }else if(_this.data.currCateText == "写作"){
              _this.playMusic(4);
            }else if(_this.data.currCateText == "运动"){
              _this.playMusic(5);
            }else if(_this.data.currCateText == "阅读"){
              _this.playMusic(6);
            }else{
            }            
          }
          clearInterval(timer);
      }else if(num == 2){
        _this.setData({
          timeStr:'00:00',
          isRelax:false,
          okShow:true,
          pauseShow: false,
          continueCancleShow: false        
        })
        if (_this.data.isVibrate){
          wx.vibrateLong({
            success: (res) => {},
          });
        }else{
          _this.playMusic(0);
        }
        clearInterval(timer);
      }
      }
    },100);
    _this.setData({
      timer:timer
    })
  },
  pause: function () {
    clearInterval(this.data.timer);
    this.setData({
      pauseShow: false,
      continueCancleShow: true,
      okShow: false,
      isRelax:false
    })
  },
  continue: function () {
    this.drawActive(this.data.workOrRelax);
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false,
      isRelax:false
    })    
  },
  cancle: function (){
    clearInterval(this.data.timer);
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false,
      clockShow:false,
      isRelax:false      
    })
  },
  ok: function () {
    wx.stopBackgroundAudio();
    clearInterval(this.data.timer);
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false,
      clockShow: false
    })
  },
  relax: function () {
    wx.stopBackgroundAudio();
    clearInterval(this.data.timer);
    this.setData({
      clockShow:true,
      mTime:this.data.relaxTime*60*1000,
      timeStr:parseInt(this.data.relaxTime) >= 10 ? this.data.relaxTime+':00' : '0'+this.data.relaxTime+':00',
      isRelax:false,
      pauseShow:true,
      workOrRelax:'2',
    })
    this.drawBg();
    this.drawActive(this.data.workOrRelax);
  },

  playMusic: function(num){
    if (num == 1){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://1drv.ms/u/s!Ammvk6doD-oLnCfF2-hcAHhFyXKQ?e=23udZM',
              title:'工作之余休息一下',
            });
          }
        }
      })
    }else if(num == 2){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQzRxZmVKSElHNXJFS0xqP2U9cDVkOWVY.mp3',
              title:'学习之余休息一下',
            });
          }
        }
      })
    }else if(num == 3){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQ21NMEI4a0wxUnJVU1k4P2U9QjlhWTBh.mp3',
              title:'思考之余休息一下',
            });
          }
        }
      })
    }else if(num == 4){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQzJJeUpHZXdqUUpXLTNGP2U9Uk51UEQx.mp3',
              title:'写作之余休息一下',
            });
          }
        }
      })
    }else if(num == 5){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQ3VTTmFreDBUM0FFNjdNP2U9dE5UZzRK.mp3',
              title:'运动之余休息一下',
            });
          }
        }
      })
    }else if(num == 6){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQ3c4Z0xNd2h2bi1oTm9iP2U9SGZzczNy.mp3',
              title:'阅读之余休息一下',
            });
          }
        }
      })
    }else if(num == 0){
      wx.getBackgroundAudioPlayerState({
        complete: (result) => {
          if(result.status == '1'){
            wx.stopBackgroundAudio();
          }else{
            wx.playBackgroundAudio({
              dataUrl: 'https://link.jscdn.cn/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvcyFBbW12azZkb0Qtb0xuQ3BubTFOY2prTnkxVFQ0P2U9OEx3aDdZ.mp3',
              title:'休息好了好好加油吧',
            });
          }
        }
      })
    }else{
    }

  },
  checkboxChange : function(e){
    if(e.detail.value == "1"){
      this.setData({
        isVibrate:true,
      })
    }else{
      this.setData({
        isVibrate:false,
      })
    }
  },
  
})
