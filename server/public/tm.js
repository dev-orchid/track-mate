/**
 * TrackMate Pixel - v1.0.0
 * Embed: <script src="https://your-api.com/tm.js" data-company="TM-XXXXX" data-list="LST-XXXXX"></script>
 */
(function(w,d){
  'use strict';
  if(w.TM)return;

  var TM={
    v:'1.0.0',
    cid:null,
    lid:null,
    sid:null,
    url:null,
    q:[],

    init:function(){
      var s=d.currentScript||d.querySelector('script[data-company]');
      if(!s)return console.error('TM: Missing script config');

      this.cid=s.getAttribute('data-company');
      this.lid=s.getAttribute('data-list')||null;
      this.url=s.src.split('/tm.js')[0];

      if(!this.cid){console.error('TM: data-company required');return;}

      this.sid=this._sid();
      this._flush();
      this._auto();
    },

    _sid:function(){
      var k='_tm_sid',s=localStorage.getItem(k);
      if(!s){s='s_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);localStorage.setItem(k,s);}
      return s;
    },

    _send:function(ep,data){
      var x=new XMLHttpRequest();
      x.open('POST',this.url+ep,true);
      x.setRequestHeader('Content-Type','application/json');
      x.send(JSON.stringify(data));
    },

    _flush:function(){
      while(this.q.length){var a=this.q.shift();this[a[0]].apply(this,a[1]);}
    },

    _auto:function(){
      // Auto page view
      this.page();

      // Track on history change (SPA support)
      var self=this;
      var push=history.pushState;
      history.pushState=function(){push.apply(history,arguments);self.page();};
      w.addEventListener('popstate',function(){self.page();});
    },

    page:function(title,url){
      this._send('/api/events',{
        company_id:this.cid,
        sessionId:this.sid,
        list_id:this.lid,
        events:[{
          eventType:'page_view',
          eventData:{address:url||location.href,title:title||d.title},
          timestamp:new Date().toISOString()
        }]
      });
    },

    track:function(event,props){
      this._send('/api/events',{
        company_id:this.cid,
        sessionId:this.sid,
        list_id:this.lid,
        events:[{
          eventType:event,
          eventData:{address:location.href,properties:props||{}},
          timestamp:new Date().toISOString()
        }]
      });
    },

    identify:function(user){
      if(!user||!user.email)return console.error('TM: email required');
      this._send('/api/profile',{
        company_id:this.cid,
        sessionId:this.sid,
        list_id:this.lid,
        name:user.name||'Unknown',
        email:user.email,
        phone:user.phone||null,
        source:'form'
      });
    }
  };

  // Handle queued calls before init
  var _tm=w.tm||[];
  w.tm={push:function(a){TM.q.push(a);}};
  for(var i=0;i<_tm.length;i++)TM.q.push(_tm[i]);

  w.TM=TM;
  TM.init();
})(window,document);
