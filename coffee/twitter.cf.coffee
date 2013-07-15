(( $, window, document) -> 

  Twitter = 
    
    init: (config)->
      this.request = 
        q: config.query
        count: 25
        api: 'search_tweets'

      this.template = config.template
      this.container = config.container
      this.domCache()
      this.bindEvents()
      this.fetchResults = this.fetch()
      this.fetchResults.done(this.buildTweetObjects)

    domCache: ->
      this.searchInput = $('#q')

    bindEvents: ->
      self = this;
      this.searchInput.on('keyup', this.search)
      
      $('.tweets').on 'click', 'li', (e)->
        self.toggleMedia(this)

    toggleMedia: (target)->
      expandText = $(target).find('.expand').text()
      if expandText == 'View photo'
        $(target).find('.expand').text('Hide photo')
      else
        $(target).find('.expand').text('View photo')
      $(target).find('.media').slideToggle()

    attachTemplate: ->
      template = Handlebars.compile( Twitter.template )
      Twitter.container.html( template( Twitter.tweets ) )
    
    fetch: ->
      self = this

      return $.ajax(
        url: 'fetchtweets.php'
        type: 'POST'
        dataType: 'json'
        data: self.request
      ).promise()

    search: ->
      self = Twitter
      input = this
      clearTimeout( self.timer )
      self.timer = ( input.value.length >= 3 ) && setTimeout ->
        self.request.q = input.value
        self.fetchResults = self.fetch()
        self.fetchResults.done(self.buildTweetObjects)
      , 400

    buildTweetObjects: (data, textStatus, xhr)->
      self = Twitter
      if data.httpstatus == 200
        
        self.tweets = $.map data.statuses, (tweet)->

          if tweet.entities['media']
            media_url = tweet.entities['media'][0].media_url 

          return {
            author: tweet.user.screen_name
            tweet: self.ify.clean(tweet.text)
            thumb: tweet.user.profile_image_url
            url: 'http://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str
            media: media_url
          }

        self.attachTemplate(self.tweets)     

    ify:  
      link: (tweet)->
        return tweet.replace /\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, (link, m1, m2, m3, m4)->
          http = m2.match(/w/) ? 'http://' : ''
          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4
 
      at: (tweet)->
        return tweet.replace /\B[@＠]([a-zA-Z0-9_]{1,20})/g, (m, username)->
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>'

      list: (tweet)->
        return tweet.replace /\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, (m, userlist)->
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>'
 
      hash: (tweet)->
        return tweet.replace /(^|\s+)#(\w+)/gi, (m, before, hash)->
          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>'
 
      clean: (tweet)->
        return this.hash(this.at(this.list(this.link(tweet))))


  Twitter.init
    template: $('#tweets-template').html()
    container: $('ol.tweets')
    query: 'Justin Beiber'
  
  
)( jQuery, window, document ) 
