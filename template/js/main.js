var Main = (function($) {

  var screen_width = 0,
      breakpoint_small = false,
      breakpoint_medium = false,
      breakpoint_large = false,
      breakpoint_array = [480,1000,1200],
      headerOffset,
      $document,
      $main = $('#site-container'),
      loadingTimer;

  function _init() {
    // touch-friendly fast clicks
    FastClick.attach(document.body);

    // Cache some common DOM queries
    $document = $(document);
    $('body').addClass('loaded');

    // Set screen size vars
    _resize();

    // Init functions
    _scrollToHash();
    _injectSvgSprite();
    _initAjaxPages();
    _initAside();
    _initMediaPlayer();
    _initNav();
    _initResources();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        _hideResources();
      }
    });

    // Smoothscroll links
    $('a.smoothscroll').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      _scrollBody($(href));
    });

  } // end init()

  function _scrollBody(element, duration, delay) {
    element.velocity("scroll", {
      duration: duration,
      delay: delay,
      offset: -headerOffset
    }, "easeOutSine");
  }

  function _scrollToHash() {
    // Scroll down to hash afer page load
    $(window).load(function() {
      if (window.location.hash) {
        _assignActivePageHash();
        _scrollBody($(window.location.hash), 0, 0);
      }
    });
  }

  function _assignActivePageHash() {
    if (window.location.hash) {
      $('.site-nav a[href$="'+window.location.hash+'"]').parent('li').siblings('li').addClass('un-hover');
    } else {
      $('.site-nav .sub-nav li.un-hover').removeClass('un-hover');
    }
  }

  function _injectSvgSprite() {
    boomsvgloader.load('/template/svgs/build/svgs-defs.svg');
  }

  function _initAjaxPages() {

    function loadContent() {
        $.ajax({
            url: pageUrl + '?type=ajax',
            cache: true,
            beforeSend: function(){
              $('body').attr('data-bodyClass', newBodyClass);
              timeout = setTimeout(function(){
                  _showLoading();
              }, 200);
              $('body').removeClass('is-entering').addClass('is-exiting');
              if ($this.is('.next')) {
                $('.sceneElement').removeClass('moveRight').addClass('moveLeft');
              }
              if ($this.is('.prev')) {
                $('.sceneElement').removeClass('moveLeft').addClass('moveRight');
              }
            }, 
            success: function (data) {
              clearTimeout(timeout);
              $main.html(data);
              setTimeout(function(){
                $main.removeClass('loading');
                _hideLoading();
              },500);
              $('body').removeClass('is-exiting').addClass('is-entering');
              if ($this.is('.next')) {
                $('.sceneElement').removeClass('moveLeft').addClass('moveRight');
              }
              if ($this.is('.prev')) {
                $('.sceneElement').removeClass('moveRight').addClass('moveLeft');
              }
            },
            complete: function(){


              // Set scroll to hash if needed
                if (pageHash) {
                  document.location.hash = pageHash;
                  setTimeout(function() {
                    _scrollBody($(pageHash), 250, 0);
                  },800);
                } else {
                  _scrollBody($('body'), 250, 0);
                }
                _assignActivePageHash();

                setTimeout(function() {
                  _initMediaPlayer();
                }, 100);
            }
        });
        if (pageUrl != window.location) {
            window.history.pushState({ path: pageUrl }, '', pageUrl);
        }
    }
    function backForwardButtons() {
        $(window).on('popstate', function () {
            $.ajax({
                url: location.pathname + '?type=ajax',
                success: function (data) {
                    var newBodyClass = location.pathname.substr(location.pathname.lastIndexOf('/') + 1).split('#')[0];
                    if (newBodyClass === '') { newBodyClass = 'index';}
                    $('body').attr('data-bodyClass', newBodyClass);
                    $main.html(data);
                    if (document.location.hash) {
                      _scrollToHash();
                    } else {
                      _scrollBody($('body'), 250, 0);
                    }
                } 
            });
        });
    }
    $("body").on('click', '.ajax', function (e) {
        $('body').removeClass('noscroll');
        pageUrl = $(this).attr('href');
        newBodyClass = pageUrl.substr(pageUrl.lastIndexOf('/') + 1).split('#')[0];
        if (newBodyClass === '') { newBodyClass = 'index';}

        if (this.hash !== '') {
          pageUrl = pageUrl.split('#')[0];
          pageHash = this.hash;
        } else {
          pageHash = false;
        }

        $this = $(this);

        var currentPage = document.location.pathname.split('/')[1];

        if (newBodyClass === currentPage) {
          _scrollBody($(pageHash), 250, 0);
        } else {
          console.log(currentPage);
          $main.addClass('loading');
          if(currentPage === '') {
            loadContent();
          } else {
            setTimeout(loadContent,500);
          }
        }

        e.preventDefault();
    });
    backForwardButtons();

  }

  function _initAside() {
    $document.on('click', '.aside-trigger', function() {
      var instance = $(this).attr('data-aside'),
          targetInstance = $('.aside-container[data-aside="' + instance + '"]'),
          asideWrap = $(this).closest('.aside-wrap');
      if ($(this).is('.audio-trigger')) {
        $('.aside-wrap.audio-active').not(asideWrap).removeClass('audio-active');
        $(this).closest('.aside-wrap').toggleClass('audio-active');
      }
      if ($(window).width() < 1000) {
        $('.aside-container.active').not(targetInstance).slideToggle();
        targetInstance.slideToggle();
        _scrollBody(targetInstance,250,0);
      }
      $('.aside-container.active').not(targetInstance).removeClass('active').toggleClass('inactive');
      targetInstance.toggleClass('inactive').toggleClass('active');
    });
  }

  function _initMediaPlayer() {
    $('audio').mediaelementplayer({
      startVolume: 1,
      features: ['playpause','progress','current'],
      success:  function (mediaElement, domObject) {
        mediaElement.addEventListener("ended", function(e){ 
          var $thisMediaElement = (mediaElement.id) ? $("#"+mediaElement.id) : $(mediaElement);
          $thisMediaElement.closest('.aside-container').removeClass('active').addClass('inactive');
        });
      }
    });

    $('audio').addClass('hidden');
    setTimeout(function(){
      $('audio').removeClass('hidden');
    }, 500);

    $('video').mediaelementplayer({
      startVolume: 1,
      features: ['playpause','progress','current', 'volume'], 
      success:  function (mediaElement, domObject) { 
        var $thisMediaElement = (mediaElement.id) ? $("#"+mediaElement.id) : $(mediaElement);

        $thisMediaElement.closest('.video-section').append('<div class="loading-spinner"></div>');

        mediaElement.addEventListener('progress', function(e) {
          $thisMediaElement.closest('.video-section').addClass('loaded');
          $('.video-section .loading-spinner').remove();
        }, false);
        mediaElement.addEventListener("playing", function(){ 
          $thisMediaElement.closest('.video-section').addClass('played');
          setTimeout(function() {
            $('.video-section.played').removeClass('played');
          }, 5000);
        });
        mediaElement.addEventListener("ended", function(e){ 
            // Revert to the poster image when ended
            $thisMediaElement.parents(".mejs-inner").find(".mejs-poster").show();
            $thisMediaElement.closest(".mejs-container").removeClass('played');
        });
      },
    });
  }

  function _initNav() {
    var $siteNav = $('.site-nav');

    $document.on('click', '.chapter-parent', function(e) {
      e.preventDefault();
      var $parentLi = $(this).closest('li'),
          $subNav = $(this).next('.sub-nav');

      $('.nav-list li').not($parentLi).removeClass('-active');

      if ($parentLi.is('.-active')) {
        _closeNav();
      } else {
        $('body').addClass('nav-active');
        $siteNav.addClass('sub-nav-active');
        $parentLi.addClass('-active');
      }
    });

    // When click on a chapter child link
    $document.on('click', '.site-nav .sub-nav a, .home-link', function() {
      _closeNav();
    });

    // Give not-hovered class to not-hovered lis
    $('.site-nav .sub-nav a').on('mouseenter', function(e) {
      $(this).closest('li').siblings('li').addClass('un-hover');
    }).on('mouseleave', function(e) {
      $(this).closest('li').siblings('li').removeClass('un-hover');
    });
  }

  function _closeNav() {
    $('.site-nav').removeClass('sub-nav-active');
    $('body').removeClass('nav-active');
    $('.nav-list li.-active').removeClass('-active');
  }
  
  function _initResources() {
    $document.on('click', '.resource-toggle', function() {
      var resourceTarget = '#' + $(this).data('target'),
          targetTitle = $(resourceTarget).find('h3').text();
      $('.resources.-active').not($(resourceTarget)).removeClass('-active');
      $('.resources-nav button.-active').removeClass('-active');
      $('.resources-title .target-title').html(' ' + targetTitle);
      $('.resources-nav button[data-target="'+$(this).data('target')+'"]').addClass('-active');
      $('.resources-container').addClass('-active');
      $(resourceTarget).addClass('-active');
    });

    // Show/hide releative resource categories
    $document.on('click', '.resources-categories h4', function() {
      var resourceTarget = '#' + $(this).data('target');
      $('.resources-categories h4.-active, .resources-list li.-active').removeClass('-active');
      $(this).addClass('-active');
      $('.resources-list li' + resourceTarget).addClass('-active');
    });

    // Close the mother
    $document.on('click', '.resources-nav button.-active, .hide-resources', function() {
      _hideResources();
    });
  }

  function _hideResources() {
    $('.resources-container, .resources.-active, .resources-nav button.-active').removeClass('-active');
  }

  // Loading spinner
  function _showLoading() {
    _showOverlay();
    $('body').append('<div class="loading-spinner"></div>');
  }
  function _hideLoading() {
    $('div.loading-spinner').remove();
    _hideOverlay();
  }

  // Global overlay
  function _showOverlay() {
    if (!$('.global-overlay').length) {
      $('body').addClass('overlay-open');
      $('<div class="global-overlay"></div>').appendTo($main);
      setTimeout(function() {
        $('.global-overlay').addClass('-active');
      }, 50);
    }
  }

  function _hideOverlay() {
    $('body').removeClass('overlay-open');
    $('.global-overlay').removeClass('-active');
    setTimeout(function() {
      $('.global-overlay').remove();
    }, 250);
  }

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  // Called in quick succession as window is resized
  function _resize() {
    screenWidth = document.documentElement.clientWidth;
    breakpoint_small = (screenWidth > breakpoint_array[0]);
    breakpoint_medium = (screenWidth > breakpoint_array[1]);
    breakpoint_large = (screenWidth > breakpoint_array[2]);

    // set header offset
    if (breakpoint_medium === true) {
      headerOffset = $('.site-header').outerHeight();
    } else {
      headerOffset = 0;
    }
  }

  // Public functions
  return {
    init: _init,
    resize: _resize,
    scrollBody: function(section, duration, delay) {
      _scrollBody(section, duration, delay);
    }
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(Main.init);

// Zig-zag the mothership
jQuery(window).resize(Main.resize);