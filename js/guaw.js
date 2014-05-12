;(function($, window, document, undefined) {

  var createWidget = function(element, options) {

    var container = $(element);

    var settings = $.extend({
      username: 'octocat',
      timeout: 60000,
      debug: false
    }, options);

    // HTML templates (i.e. views)
    var html = {
      formatDate: function(string) {
        var d = new Date(string);
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        return month + '-' + day + '-' + year;
      },
      boilerplate: function() {
        return '<div class="guaw">' +
                 '<div class="guaw-head"></div>'+
                 '<ul class="guaw-body"></ul>' +
                 '<div class="guaw-foot">Powered by GUAW</div>' +
               '</div>';
      },
      profile: function(obj) {
        return '<img src="'+obj.avatar_url+'">' +
               '<h4>'+obj.name+'<br><small>'+obj.login+'</small></h4>';
      },
      CommitCommentEvent: function(obj) {
        return '<li id="'+obj.id+'" class="commit-comment list-group-item">'+
               'Commented on commit <a href="'+obj.payload.comment.html_url+'">'+
               obj.payload.comment.commit_id.substring(0,7)+'</a> ' +
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      CreateEvent: function(obj) {
        // repository
        if (obj.payload.ref_type === 'repository') {
          return '<li id="'+obj.id+'" class="create list-group-item">' +
                 'Created '+obj.payload.ref_type+' '+
                 '<a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
                 '<small>'+this.formatDate(obj.created_at)+'</small>' +
                 '</li>';
        }
        // branch or tag
        if (obj.payload.ref_type === 'branch' || obj.payload.ref_type === 'tag') {
          return '<li id="'+obj.id+'" class="create list-group-item">' +
                 'Created '+obj.payload.ref_type+' '+
                 '<a href="https://github.com/'+obj.repo.name+'/tree/'+obj.payload.ref+'">'+obj.payload.ref+'</a> '+
                 'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
                 '<small>'+this.formatDate(obj.created_at)+'</small>' +
                 '</li>';
        }
      },
      DeleteEvent: function(obj) {
        return '<li id="'+obj.id+'" class="delete list-group-item">'+
               'Deleted '+obj.payload.ref_type+' '+obj.payload.ref+' '+
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      DeploymentEvent: function(obj) {
        // Not visible in timelines
        return '';
      },
      DeploymentStatusEvent: function(obj) {
        // Not visible in timelines
        return '';
      },
      DownloadEvent: function(obj) {
        // No longer created
        return '';
      },
      FollowEvent: function(obj) {
        // Not visible in timelines
        return '';
      },
      ForkEvent: function(obj) {
        return '<li id="'+obj.id+'" class="fork list-group-item">'+
               'Forked <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> '+
               'to <a href="https://github.com/'+obj.payload.forkee.full_name+'">'+obj.payload.forkee.full_name+'</a> '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      ForkApplyEvent: function(obj) {
        // No longer created
        return '';
      },
      GistEvent: function(obj) {
        var action = obj.payload.action.charAt(0).toUpperCase() + obj.payload.action.slice(1);
        return '<li id="'+obj.id+'" class="gist list-group-item">' +
               action+'d gist '+
               '<a href="'+obj.payload.gist.html_url+'">'+obj.payload.gist.id+'</a> '+
               '<small>'+this.formatDate(obj.created_at)+'</small>' +
               '</li>';
      },
      GollumEvent: function(obj) {
        var action = '';
        var data = '';

        for (var i=0; i<obj.payload.pages.length; i++) {
          action = obj.payload.pages[i].action.charAt(0).toUpperCase() + obj.payload.pages[i].action.slice(1);
          data += action +' wiki page <a href="'+obj.payload.pages[i].html_url+'">'+obj.payload.pages[i].title+'</a> ';

          if (i>0 && i<obj.payload.pages.length-1) { data += ', ';     }
          if (i>0 && i>obj.payload.pages.length-2) { data += ', and '; }
        }

        return '<li id="'+obj.id+'" class="gollum list-group-item">'+
               data +
               ' at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      IssueCommentEvent: function(obj) {
        var type = (obj.payload.issue.pull_request ) ? 'pull request' : 'issue';
        return '<li id="'+obj.id+'" class="issue-comment list-group-item">'+
               'Commented on '+type+' <a href="'+obj.payload.comment.html_url+'">#'+obj.payload.issue.number+'</a> ' +
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      IssuesEvent: function(obj) {
        var action = obj.payload.action.charAt(0).toUpperCase() + obj.payload.action.slice(1);
        return '<li id="'+obj.id+'" class="issues list-group-item">'+
               action+' issue '+
               '<a href="'+obj.payload.issue.html_url+'">#'+obj.payload.issue.number+'</a> '+
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      MemberEvent: function(obj) {
        return '<li id="'+obj.id+'" class="list-group-item">'+
               obj.type+' '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      PageBuildEvent: function(obj) {
        return '<li id="'+obj.id+'" class="list-group-item">'+
               obj.type+' '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      PublicEvent: function(obj) {
        return '<li id="'+obj.id+'" class="public list-group-item">'+
               'Open sourced repository <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      PullRequestEvent: function(obj) {
        var action = obj.payload.action.charAt(0).toUpperCase() + obj.payload.action.slice(1);
        return '<li id="'+obj.id+'" class="pull-request list-group-item">'+
               action+' pull request <a href="https://github.com/'+obj.repo.name+'/pull/'+obj.payload.number+'">#'+obj.payload.number+'</a> '+
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      PullRequestReviewCommentEvent: function(obj) {
        return '<li id="'+obj.id+'" class="list-group-item">'+
               obj.type+' '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      PushEvent: function(obj) {
        var ref = obj.payload.ref.substring(obj.payload.ref.lastIndexOf('/')+1);
        var count = (obj.payload.size === 1) ? '1 commit ' : obj.payload.size+' commits ';
        return '<li id="'+obj.id+'" class="list-group-item">'+
               'Pushed '+count+
               'to <a href="https://github.com/'+obj.repo.name+'/tree/'+ref+'">'+ref+'</a> ' +
               'at <a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      ReleaseEvent: function(obj) {
        return '<li id="'+obj.id+'" class="list-group-item">'+
               obj.type+' '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      StatusEvent: function(obj) {
        // Not visible in timelines
        return '';
      },
      TeamAddEvent: function(obj) {
        return '<li id="'+obj.id+'" class="list-group-item">'+
               obj.type+' '+
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      },
      WatchEvent: function(obj) {
        return '<li id="'+obj.id+'" class="watch list-group-item">'+
               'Starred repository '+
               '<a href="https://github.com/'+obj.repo.name+'">'+obj.repo.name+'</a> ' +
               '<small>'+this.formatDate(obj.created_at)+'</small>'+
               '</li>';
      }
    };

    /**
     * Get user profile and if successful update DOM
     * Returns a promise
     */
    var fetchProfile = function() {
      var promise = $.ajax({
        url: 'https://api.github.com/users/'+settings.username,
        headers: {'Accept': 'application/vnd.github.v3+json'},
        dataType: 'json',
        ifModified: true
      });

      // Success, if new data update DOM
      promise.done(function(data, status, xhr) {
        if (data) {
          var head = container.find('.guaw-head');
          head.html(html.profile(data));
        }
        if (settings.debug) {
          console.log('Fetch Profile', xhr.status, xhr.statusText);
        }
      });

      // Failure, ...
      promise.fail(function(xhr, status, error) {
        if (settings.debug) {
          console.log('Fetch Profile', xhr.status, xhr.statusText);
        }
      });

      return promise;
    };

    /**
     * Get user activity and if successful update DOM
     * Returns a promise
     */
    var fetchActivityPage = function(pageNumber) {
      var promise = $.ajax({
        url: 'https://api.github.com/users/'+settings.username+'/events/public?page='+pageNumber,
        headers: {'Accept': 'application/vnd.github.v3+json'},
        dataType: 'json',
        ifModified: true
      });

      // Success, if new data update DOM
      promise.done(function(data, status, xhr) {
        if (data) {
          var body    = container.find('.guaw-body');
          var content = '';

          for (var i=0; i<data.length; i++) {
            content += html[data[i].type](data[i]);
          }

          if (pageNumber === 1) { body.html(''); }

          body.append(content);
        }
        if (settings.debug) {
          console.log('Fetch Activity Page '+pageNumber, xhr.status, xhr.statusText);
        }
      });

      // Failure, ...
      promise.fail(function(xhr, status, error) {
        if (settings.debug) {
          console.log('Fetch Activity Page '+pageNumber, xhr.status, xhr.statusText);
        }
      });

      return promise;
    };

    /**
     * Poll for new data
     * Uses setTimeout to recursively loop indefinitely
     */
    var poll = function() {

      // Use a promise chain to keep our AJAX ducks in a row

      var chain = fetchProfile();

      chain.then(function() { return fetchActivityPage(1);  });
      chain.then(function() { return fetchActivityPage(2);  });
      chain.then(function() { return fetchActivityPage(3);  });
      chain.then(function() { return fetchActivityPage(4);  });
      chain.then(function() { return fetchActivityPage(5);  });
      chain.then(function() { return fetchActivityPage(6);  });
      chain.then(function() { return fetchActivityPage(7);  });
      chain.then(function() { return fetchActivityPage(8);  });
      chain.then(function() { return fetchActivityPage(9);  });
      chain.then(function() { return fetchActivityPage(10); });

      chain.always(function() { setTimeout(poll, settings.timeout); });
    };

    // Engage!
    container.append(html.boilerplate());
    poll();
  };

  /* Create a jQuery plugin */
  $.fn.guaw = function(options) {
    this.each(function() {
      createWidget(this, options);
    });

    return this;
  };

})(jQuery, window, document);