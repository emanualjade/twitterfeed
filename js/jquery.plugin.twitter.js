(function($, window, document, undefined){

  if(typeof Object.create !== 'function'){
    Object.create = function( obj ){
      function F(){};
      F.prototype = obj;
      return new F();
    };
  }

  var Twitter = {
    init: function( options, elem ){
      var self = this;

      self.template = $('#tweets-template').html();
      self.container = $('ol.tweets');
      self.searchInput = $('#q');
      self.container.html('');
      self.elem = elem;
      self.bindEvents();
      self.$elem = $( elem );
      self.url = "fetchtweets.php";


      if( typeof options === 'string' ){
        self.q = options;
        self.options = $.fn.queryTwitter.options;
      } else if (typeof options === 'object') {
        self.q = options.q;
        self.options = $.extend( {}, $.fn.queryTwitter.options, options);
      }else{
        self.q = $.fn.queryTwitter.options.q;
        self.options = $.fn.queryTwitter.options;
      }
      self.request = {
        q: self.q,
        count: self.options.count,
        api: self.options.api
      }

      self.refresh();
    },
    bindEvents: function(){
      var self = this;
      self.searchInput.on('keyup', function(){
        self.search(self, this);
      });
      $('.tweets').on('click', 'li', function(){
        self.toggleMedia(this);
      });
    },
    toggleMedia: function(target){
      var expandText = $(target).find('.expand').text();
      if(expandText == 'View photo'){
        $(target).find('.expand').text('Hide photo');
      }else{
        $(target).find('.expand').text('View photo');
      }
      $(target).find('.media').slideToggle();
    },
    refresh: function(length){
      var self = this;

      self.fetch().done(function( results ){
        self.buildFrag( results );
        self.attachTemplate();

        if(typeof self.options.onComplete === 'function'){
          self.options.onComplete.apply( self.elem, arguments );
        }

      });

    },
    buildFrag: function( results ){
      var self = this;
      
      self.tweets = $.map(results.statuses, function(obj){    
        var media_url;
        if (obj.entities['media']) {
          media_url = obj.entities['media'][0].media_url 
        }

        return {
          tweet_id: obj.id_str,
          author: obj.user.screen_name,
          tweet: self.ify.clean(obj.text),
          media: media_url,
          url: 'http://twitter.com/' + obj.user.screen_name + '/status/' + obj.id_str,
          thumb: obj.user.profile_image_url,
          elemClass: self.elemClass
        };

      });
     
    },
    attachTemplate: function(){
      var self = this;
      
      if( self.tweets.length > 0 ){
        var template = Handlebars.compile( self.template );
        if(self.elemClass === true){
          self.container.prepend( template( self.tweets ) );
          $('.single').slideDown().removeClass('single');  
        }else{
          self.container.html( template( self.tweets ) ); 
        }
      }
    },
    fetch: function(){
      var self = this;
      return $.ajax({
        url: this.url,
        type: 'POST',
        data: self.request,
        dataType: 'json'
      });
    },
    search: function(instance, elem){
      var self = instance,
        input = elem;
      clearTimeout( self.timer )
      self.timer = ( input.value.length >= 3 ) && setTimeout(function(){
        self.request.q = input.value;
        self.refresh();
      }, 400);
    },
    ify:  {
      link: function(tweet) {
        return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
          var http = m2.match(/w/) ? 'http://' : '';
          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
        });
      },
 
      at: function(tweet) {
        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
        });
      },
 
      list: function(tweet) {
        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
        });
      },
 
      hash: function(tweet) {
        return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
        });
      },
 
      clean: function(tweet) {
        return this.hash(this.at(this.list(this.link(tweet))));
      }
    } // ify
  };
  
  $.fn.queryTwitter = function( options ){
    return this.each(function(){
      var twitter = Object.create( Twitter );
      twitter.init(options, this);
      $.data( this, 'queryTwitter', twitter );
    });
  };

  $.fn.queryTwitter.options = {
    q: 'funny picture',
    count: 5,
    api: 'search_tweets',
    onComplete: null
  }

})(jQuery, window, document);


$('.tweets').queryTwitter({
  q: 'Funny Pic',
  count: 10,
  onComplete: function(){

  }
});

// console.log( $.data( $('.tweets')[0], 'queryTwitter' ) );

