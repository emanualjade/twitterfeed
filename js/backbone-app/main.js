(function(){

  window.App = {
    Models: {},
    Collections: {},
    Views: {}
  }

  App.Models.Tweet = Backbone.Model.extend();

  App.Collections.Tweets = Backbone.Collection.extend({
    model: App.Models.Tweet,
    
    url: 'fetchtweets.php',
    
    parse: function(data){
      var tweets = [];
      tweets = $.map(data.statuses, function(tweet){
        var media_url;
        if (tweet.entities['media']) { 
          media_url = tweet.entities['media'][0].media_url 
        }
        return {
          author: tweet.user.screen_name,
          tweet: tweet.text,
          thumb: tweet.user.profile_image_url,
          url: 'http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
          media: media_url
        }
      });
      return tweets;
    }
  });

  App.Views.Tweets = Backbone.View.extend({
    tagName: 'ol',

    initialize: function(){
      this.collection.on('add', this.addOne, this);
    },
    render: function(){
      this.$el.html('');
      this.collection.each(this.addOne, this);
      return this;
    },
    addOne: function(tweet){
      var tweetView = new App.Views.Tweet({ model: tweet });
      this.$el.append(tweetView.render().el);
    }
  });


  App.Views.Tweet = Backbone.View.extend({
    tagName: 'li',

    template: Handlebars.compile( $('#tweets-template').html() ),

    initialize: function(){
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },

    events: {
      'click': 'toggleMedia'
    },
    
    toggleMedia: function(e){
      var expandText = $(e.currentTarget).find('.expand').text();

      if(expandText == 'View photo'){
        $(e.currentTarget).find('.expand').text('Hide photo');
      }else{
        $(e.currentTarget).find('.expand').text('View photo');
      }
      $(e.currentTarget).find('.media').slideToggle();
    },

    render: function(){
      console.log(this.model.toJSON())
      template = this.template(this.model.toJSON());
      this.$el.html( template );
      return this;
    }
  });

  App.Views.SearchTweets = Backbone.View.extend({
    el: '#q',
    
    events: {
      'keyup': 'submit'
    },

    submit: function(e){
      self = this;
      e.preventDefault();
      var searchQuery = $(e.currentTarget).val();
      
      clearTimeout( self.timer )
      self.timer = ( e.currentTarget.value.length >= 3 ) && setTimeout(function(){
          
        self.collection.fetch({
          data: { q: searchQuery, count: 5, api: 'search_tweets' },
          processData: true,
          reset: true,
          success: function(collection){
            tweetsView.render(collection);
          }
        });

      }, 400);

    }
  });

  window.tweetsCollection = new App.Collections.Tweets();
  var addTweetView = new App.Views.SearchTweets({ collection: tweetsCollection });
  var tweetsView = new App.Views.Tweets({ collection: tweetsCollection });
  tweetsCollection.fetch({
    data: { q: 'cool pictu', count: 5, api: 'search_tweets' },
    processData: true,
    reset: true,
    success: function(collection){
      tweetsView.render(collection);
    }
  });

  $('.tweets').html( tweetsView.render().el );

})();