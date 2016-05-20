var Main = (function($) {

  var screen_width = 0,
      breakpoint_small = false,
      breakpoint_medium = false,
      breakpoint_large = false,
      breakpoint_array = [480,1000,1200],
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
    _injectSvgSprite();
    _initSmoothSate();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

    // Smoothscroll links
    $('a.smoothscroll').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      _scrollBody($(href));
    });

    // Scroll down to hash afer page load
    $(window).load(function() {
      if (window.location.hash) {
        _scrollBody($(window.location.hash)); 
      }
    });

  } // end init()

  function _scrollBody(element, duration, delay) {
    element.velocity("scroll", {
      duration: duration,
      delay: delay,
      offset: 0
    }, "easeOutSine");
  }

  function _injectSvgSprite() {
    boomsvgloader.load('/template/svgs/build/svgs-defs.svg');
  }

  function _initSmoothSate() {

    function loadContent() {
        $.ajax({
            url: pageUrl + '?type=ajax',
            cache: true,
            beforeSend: function(){
              $('body').attr('data-bodyClass', newBodyClass);
              timeout = setTimeout(function(){
                  _showLoading();
              }, 200);
              $('.page-container').removeClass('is-entering').addClass('is-exiting');
              if ($this.is('.next-chapter')) {
                $('.sceneElement').removeClass('moveRight').addClass('moveLeft');
              }
              if ($this.is('.prev-chapter')) {
                $('.sceneElement').removeClass('moveLeft').addClass('moveRight');
              }
            }, 
            success: function (data) {
              clearTimeout(timeout);
              _hideLoading();
              $main.html(data);
              $('.sceneElement').removeClass('is-exiting').addClass('is-entering');
              if ($this.is('.next-chapter')) {
                $('.sceneElement').removeClass('moveLeft').addClass('moveRight');
              }
              if ($this.is('.prev-chapter')) {
                $('.sceneElement').removeClass('moveRight').addClass('moveLeft');
              }
            },
            complete: function(){
              $('body, html').animate({
                  scrollTop: 0,
              });
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
                    $main.html(data);
                } 
            });
        });
    }
    $("body").on('click', '.ajax', function (e) {
        $('body').removeClass('noscroll');
        pageUrl = $(this).attr('href');
        newBodyClass = pageUrl.substr(pageUrl.lastIndexOf('/') + 1);
        if (newBodyClass === '') { newBodyClass = 'index';}
        $this = $(this);
        loadContent();
        e.preventDefault();
    });
    backForwardButtons();

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
      $('<div class="global-overlay"></div>').appendTo($('body'));
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
