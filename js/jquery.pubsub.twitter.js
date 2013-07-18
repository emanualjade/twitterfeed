(function($, window, document, undefined) {

  var o = $( {} );

  $.each({
    on: 'subscribe',
    trigger: 'publish',
    off: 'unsubscribe'
  }, function( key, api ) {
    $[api] = function() {
      o[key].apply( o, arguments );
    }
  });

  var Twitter = {
    
    init: function(config){
      this.request = {
        q: config.query,
        count: 5,
        api: 'search_tweets'
      }
      this.template = config.template;
      this.container = config.container;
      this.domCache();
      this.bindEvents();
      this.subscriptions();
      $.publish( 'twitter/query' );
    },
    
    domCache: function(){
      this.searchInput = $('#q');
    },

    bindEvents: function(){
      self = this;
      self.searchInput.on('keyup', self.search);
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
    subscriptions: function(){
      $.subscribe( 'twitter/query', this.fetch );
      $.subscribe( 'twitter/results', this.attachTemplate );
    },
    attachTemplate: function(){
      var template = Handlebars.compile( Twitter.template );
      Twitter.container.html( template( Twitter.tweets ) );
    },
    
    fetch: function(){
      var self = Twitter;

      $.ajax({
        url: 'fetchtweets.php',
        type: 'POST',
        dataType: 'json',
        data: self.request,
        success: function(data, textStatus, xhr){
          if (data.httpstatus == 200) {
            self.tweets = $.map(data.statuses, function(tweet){
              var media_url;
              if (tweet.entities['media']) { 
                media_url = tweet.entities['media'][0].media_url 
              }
              return {
                author: tweet.user.screen_name,
                tweet: self.ify.clean(tweet.text),
                thumb: tweet.user.profile_image_url,
                url: 'http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                media: media_url
              }
            });

            $.publish( 'twitter/results' );
          }
        }
      })
    },

    search: function(){
      var self = Twitter,
        input = this;
      clearTimeout( self.timer )
      self.timer = ( input.value.length >= 3 ) && setTimeout(function(){
        self.request.q = input.value;
        self.fetch();
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

  }

  Twitter.init({
    template: $('#tweets-template').html(),
    container: $('ol.tweets'),
    query: 'Justin Beiber'
  });

})(jQuery, window, document);