;(function($, window, document, undefined) {

  'use strict';

  var defaults = {
    username: 'octocat',
    timeout: 300,
    debug: false
  };

  var templates = {
    // The widget skeleton
    boilerplate: function() {
      return '<div class="guaw">'+
               '<div class="guaw-head"></div>'+
               '<ul class="guaw-body"></ul>'+
               '<div class="guaw-foot">'+
                 '<a href="http://thebinarypenguin.github.io/guaw/">Powered by GUAW</a>'+
               '</div>'+
             '</div>';
    },
    // The user info header
    profile: function(obj) {
      var avatar = obj.avatar_url,
          name   = obj.name,
          login  = obj.login;

      if (name) {
        return '<a href="https://github.com/'+login+'"><img src="'+avatar+'"></a>'+
               '<h4><a href="https://github.com/'+login+'">'+name+'</a></h4>'+
               '<small><a href="https://github.com/'+login+'">'+login+'</a></small>'+
               '<div class="clearfix"></div>';
      } else {
        return '<a href="https://github.com/'+login+'"><img src="'+avatar+'"></a>'+
               '<h4><a href="https://github.com/'+login+'">'+login+'</a></h4>'+
               '<div class="clearfix"></div>';
      }
    },
    // Event: Fires when the user comments on a commit
    CommitCommentEvent: function(obj) {
      var id         = obj.id,
          date       = helpers.date(obj.created_at),
          repoName   = obj.repo.name,
          commentURL = obj.payload.comment.html_url,
          commitID   = obj.payload.comment.commit_id.substring(0,7);

      return '<li id="'+id+'" class="commit-comment list-group-item">'+
               'Commented on commit <a href="'+commentURL+'">'+commitID+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates a repository, branch, or tag
    CreateEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          refType  = obj.payload.ref_type,
          ref      = obj.payload.ref;

      if (refType === 'repository') {
        return '<li id="'+id+'" class="create list-group-item">'+
                 'Created '+refType+' <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
                 '<small>'+helpers.date(obj.created_at)+'</small>'+
               '</li>';
      }

      if (refType === 'branch' || refType === 'tag') {
        return '<li id="'+id+'" class="create list-group-item">'+
                 'Created '+refType+' <a href="https://github.com/'+repoName+'/tree/'+ref+'">'+ref+'</a> '+
                 'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
                 '<small>'+date+'</small>'+
               '</li>';
      }
    },
    // Event: Fires when the user deletes a branch or tag
    DeleteEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          refType  = obj.payload.ref_type,
          ref      = obj.payload.ref;

      return '<li id="'+id+'" class="delete list-group-item">'+
               'Deleted '+refType+' '+ref+' '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates a new download
    DownloadEvent: function(obj) {
      var id           = obj.id,
          date         = helpers.date(obj.created_at),
          repoName     = obj.repo.name,
          downloadName = obj.payload.download.name,
          downloadURL  = obj.payload.download.html_url;

      return '<li id="'+id+'" class="download list-group-item">'+
               'Created download <a href="'+downloadURL+'">'+downloadName+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user follows another user
    FollowEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          userName = obj.payload.target.login,
          userURL  = obj.payload.target.html_url;

      return '<li id="'+id+'" class="follow list-group-item">'+
               'Started following <a href="'+userURL+'">'+userName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user applies a patch in the Fork Queue
    ForkApplyEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name;

      return '<li id="'+id+'" class="fork-apply list-group-item">'+
               'Applied a patch '+
               'to <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user forks a repository
    ForkEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          forkee   = obj.payload.forkee.full_name;

      return '<li id="'+id+'" class="fork list-group-item">'+
               'Forked <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               'to <a href="https://github.com/'+forkee+'">'+forkee+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates or updates a gist
    GistEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          action   = helpers.capitalize(obj.payload.action)+'d',
          gistID   = obj.payload.gist.id,
          gistURL  = obj.payload.gist.html_url;

      return '<li id="'+id+'" class="gist list-group-item">'+
               action+' gist <a href="'+gistURL+'">'+gistID+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when a the user creates or updates a wiki page
    GollumEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name;

      return '<li id="'+id+'" class="gollum list-group-item">'+
               'Edited the wiki '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user comments on an issue
    IssueCommentEvent: function(obj) {
      var id         = obj.id,
          date       = helpers.date(obj.created_at),
          repoName   = obj.repo.name,
          issueType  = helpers.issueType(obj.payload.issue),
          issueID    = obj.payload.issue.number,
          commentURL = null;

      // A Pull Request is a special type of issue.
      // All Pull Requests are Issues, but not all Issues are Pull Requests.

      if (issueType === 'pull request') {
        commentURL = obj.payload.issue.pull_request.html_url+
                     '#issuecomment-'+obj.payload.comment.id;
      } else {
        commentURL = obj.payload.comment.html_url;
      }

      return '<li id="'+id+'" class="issue-comment list-group-item">'+
               'Commented on '+issueType+' <a href="'+commentURL+'">#'+issueID+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates, closes, or reopens an issue
    IssuesEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          action   = helpers.capitalize(obj.payload.action),
          issueID  = obj.payload.issue.number,
          issueURL = obj.payload.issue.html_url;

      return '<li id="'+id+'" class="issues list-group-item">'+
               action+' issue <a href="'+issueURL+'">#'+issueID+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user adds another user to a repository as a collaborator
    MemberEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          userName = obj.payload.member.login,
          userURL  = obj.payload.member.html_url;

      return '<li id="'+id+'" class="member list-group-item">'+
               'Added <a href="'+userURL+'">'+userName+'</a> '+
               'to <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+helpers.date(obj.created_at)+'</small>'+
             '</li>';
    },
    // Event: Fires when the user makes a private repository public
    PublicEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name;

      return '<li id="'+id+'" class="public list-group-item">'+
               'Open sourced repository <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates, closes, reopens, or synchronizes a pull request
    PullRequestEvent: function(obj) {
      var id            = obj.id,
          date          = helpers.date(obj.created_at),
          repoName      = obj.repo.name,
          action        = helpers.capitalize(obj.payload.action),
          pullRequestID = obj.payload.number;

      return '<li id="'+id+'" class="pull-request list-group-item">'+
               action+' pull request <a href="https://github.com/'+repoName+'/pull/'+pullRequestID+'">#'+pullRequestID+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user comments on the unified diff of a pull request
    PullRequestReviewCommentEvent: function(obj) {
      var id            = obj.id,
          date          = helpers.date(obj.created_at),
          repoName      = obj.repo.name,
          commentURL    = obj.payload.comment.html_url,
          pullRequestID = helpers.tail(obj.payload.comment.pull_request_url);

      return '<li id="'+id+'" class="pull-request-review-comment list-group-item">'+
               'Commented on pull request <a href="'+commentURL+'">#'+pullRequestID+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user pushes to a branch
    PushEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name,
          count    = (obj.payload.size === 1) ? '1 commit ' : obj.payload.size+' commits ',
          refTail  = helpers.tail(obj.payload.ref);

      return '<li id="'+id+'" class="push list-group-item">'+
               'Pushed '+count+
               'to <a href="https://github.com/'+repoName+'/tree/'+refTail+'">'+refTail+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user creates a release
    ReleaseEvent: function(obj) {
      var id          = obj.id,
          date        = helpers.date(obj.created_at),
          repoName    = obj.repo.name,
          releaseName = obj.payload.release.name,
          releaseURL  = obj.payload.release.html_url;

      return '<li id="'+id+'" class="release list-group-item">'+
               'Created release <a href="'+releaseURL+'">'+releaseName+'</a> '+
               'at <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    },
    // Event: Fires when the user stars a repository
    WatchEvent: function(obj) {
      var id       = obj.id,
          date     = helpers.date(obj.created_at),
          repoName = obj.repo.name;

      return '<li id="'+id+'" class="watch list-group-item">'+
               'Starred repository <a href="https://github.com/'+repoName+'">'+repoName+'</a> '+
               '<small>'+date+'</small>'+
             '</li>';
    }
  };

  var helpers = {
    // Capitalize the first letter of a string
    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    // Convert date string to more friendly version
    date: function(str) {
      var d = new Date(str);
      return (d.getMonth() + 1) + '-' + (d.getDate()) + '-' + (d.getFullYear());
    },
    // Determine if an issue is a Pull Request or just a regular Issue
    issueType: function(issue) {
      if (issue.pull_request && issue.pull_request.html_url &&
          issue.pull_request.diff_url && issue.pull_request.patch_url) {
        return 'pull request';
      } else {
        return 'issue';
      }
    },
    // Get the last piece of a slash separated string (such as an URL or Git ref)
    tail: function(str) {
      return str.split("/").pop();
    }
  };

  function GUAWPlugin(element, options) {
    this.container   = $(element);
    this.widgetHead  = null;
    this.widgetBody  = null;
    this.settings    = $.extend({}, defaults, options);
    this.realTimeout = this.settings.timeout;

    this.init();
  }

  $.extend(GUAWPlugin.prototype, {
    /**
     * Initialize the widget and start the polling process
     */
    init: function() {
      this.container.append(templates.boilerplate());

      this.widgetHead = this.container.find('.guaw-head');
      this.widgetBody = this.container.find('.guaw-body');

      if (this.settings.debug) {
        console.log('Settings: ', this.settings);
      }

      this.poll();
    },

    /**
     * Poll for new data
     * Uses setTimeout to recursively loop indefinitely
     */
    poll: function() {
      this.fetchProfile()
        .then(function() { return this.fetchActivityPage(1);  })
        .then(function() { return this.fetchActivityPage(2);  })
        .then(function() { return this.fetchActivityPage(3);  })
        .then(function() { return this.fetchActivityPage(4);  })
        .then(function() { return this.fetchActivityPage(5);  })
        .then(function() { return this.fetchActivityPage(6);  })
        .then(function() { return this.fetchActivityPage(7);  })
        .then(function() { return this.fetchActivityPage(8);  })
        .then(function() { return this.fetchActivityPage(9);  })
        .then(function() { return this.fetchActivityPage(10); })
        .always(function() { setTimeout($.proxy(this.poll, this), this.realTimeout*1000); });
    },

    /**
     * Get user profile and if successful update DOM
     * Returns a promise
     */
    fetchProfile: function() {
      var url = 'https://api.github.com/users/'+this.settings.username;

      var promise = $.ajax({
        url: url,
        headers: {'Accept': 'application/vnd.github.v3+json'},
        dataType: 'json',
        ifModified: true,
        context: this
      });

      // Success, if new data update DOM
      promise.done(function(data, status, xhr) {
        if (this.settings.debug) {
          console.log('Fetch '+url+' ('+xhr.status+' '+xhr.statusText+')');
        }

        if (data) {
          if (this.settings.debug) {
            console.log(data);
          }

          this.widgetHead.html(templates.profile(data));
        }
      });

      // Failure, ...
      promise.fail(function(xhr, status, error) {
        if (this.settings.debug) {
          console.log('Fetch '+url+' ('+xhr.status+' '+xhr.statusText+')');
        }
      });

      return promise;
    },

    /**
     * Get user activity and if successful update DOM
     * Returns a promise
     */
    fetchActivityPage: function(pageNumber) {
      var url = 'https://api.github.com/users/'+this.settings.username+'/events/public?page='+pageNumber;

      var promise = $.ajax({
        url: url,
        headers: {'Accept': 'application/vnd.github.v3+json'},
        dataType: 'json',
        ifModified: true,
        context: this
      });

      // Success, if new data update DOM
      promise.done(function(data, status, xhr) {
        this.setRealTimeout(xhr.getResponseHeader('X-Poll-Interval'));

        if (this.settings.debug) {
          console.log('Fetch '+url+' ('+xhr.status+' '+xhr.statusText+')');
        }

        if (data) {
          if (this.settings.debug) {
            console.log(data);
          }

          var content = '';

          for (var i=0; i<data.length; i++) {
            if (templates[data[i].type]) {
              content += templates[data[i].type](data[i]);
            }
          }

          if (pageNumber === 1) { this.widgetBody.html(''); }

          this.widgetBody.append(content);
        }
      });

      // Failure, ...
      promise.fail(function(xhr, status, error) {
        this.setRealTimeout(xhr.getResponseHeader('X-Poll-Interval'));

        if (this.settings.debug) {
          console.log('Fetch '+url+' ('+xhr.status+' '+xhr.statusText+')');
        }
      });

      return promise;
    },

    /**
     * Make sure realTimeout is never less than minTimeout
     * (minTimeout comes from the X-Poll-Interval response header)
     */
    setRealTimeout: function(minTimeout) {
      this.realTimeout = this.settings.timeout;

      if (minTimeout > this.realTimeout) {
        this.realTimeout = minTimeout;
      }
    }
  });

  /* Create a jQuery plugin */
  $.fn.guaw = function(options) {
    this.each(function() {
      if (!$.data(this, "guaw_plugin")) {
        $.data(this, "guaw_plugin", new GUAWPlugin(this, options));
      }
    });

    return this;
  };

})(jQuery, window, document);