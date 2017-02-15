/**
 * Comment below is eslint related and overwrites
 * default values of the definitions in `.eslintrc`
 * to supress warnings on undefined variables and such
 * in dev mode.
 *
 * Accordingly the values should be set to `true`
 * on code cleanup as they are useful for spotting leaks
 * and mistyped variables.
 */

/*eslint-disable no-undef */


var App = (function() {

  'use strict';

  // Private variables and methods
  // var _privateMethod = function() {};

  // Public variables and methods
  // var publicMethod = function() {};

  var init = function() {

    // FastClick initialisation
    //FastClick.attach(document.body);

    // Avoid FOIT on web font loading, s. https://github.com/bramstein/fontfaceobserver
    // var font = new FontFaceObserver('proxima-nova-1');
    // font.load().then(function() {
    //   document.documentElement.className += ' fonts-loaded';
    // }, function() {
    //   console.log('Font is not available after waiting 3 seconds');
    // });

    // svg4everybody initialisation
    svg4everybody();

  };

  // Public API
  return {

    init: init

  };

})();




/**
 * If DOM is ready...
 */

$(function() {

  'use strict';

  App.init();

  // Simple Hide/Show, toggles text also (by data attribute `data-swap-text/icon`)
  $('.js-text-icon-toggle').on('click', function(event) {
      event.preventDefault();

      var el = $(this);
      var orig = el.find('span').eq(1).text();
      var origIcon = el.find('span').eq(0).attr('class');

      el.find('span').eq(1).text(el.data("swap-text"));
      el.find('span').eq(0).attr('class', el.data("swap-icon"));

      el.data("swap-text", orig);
      el.data("swap-icon", origIcon);
  });




  // Match to Bootstraps data-toggle for the modal
  // and attach an onclick event handler
  $('a[data-toggle="modal"]').on('click', function(e) {

    // Get the target modal (container)
    var target_modal = $(e.currentTarget).data('target');
    // Get the address for partial modal content
    var remote_content = e.currentTarget.href;

    // Address the target modal in the DOM
    var modal = $(target_modal);
    // Address the target modal area to populate with remote content
    var modalContent = $(target_modal + ' .modal-content');

    // On show to the modal, load remote content and show modal at last
    modal.on('show.bs.modal', function () {
      modalContent.load(remote_content);
    })
    .modal();

    // Empty the DOM after closing the modal; seems neccessary
    modal.on('hide.bs.modal', function () {
      $(target_modal + ' .modal-content').html('');
    })

    // Prevent default behaviour
    return false;
  });



  // Init smooth scrolling
  $(".main-nav a, .header-nav a").smoothScroll({
      speed: 700,
      beforeScroll: function(options) {
        if(window.matchMedia("(min-width: 992px)").matches) {
            options.offset = -200;
        } else {
            options.offset = -220;
        }
      }
  });


  // Init responsive navigation
  var nav = responsiveNav(".nav-collapse", {
    openPos: 'relative',
    customToggle: '.nav-toggle'
  });


  // Init lightbox
  $(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
  });




  $(window).on('load resize scroll', function() {
    var frameNavLang = $('.section-frame--navigation-lang').height();
    var frameNavMain = $('.section-frame--navigation-main').height();
    var h = $(window).height();

    var resHeight = h - frameNavMain - frameNavLang;

    //$('.section-frame--header').css({minHeight: resHeight});

    //$('#carousel-header').css({minHeight: resHeight});

    console.log('window: '+h);
    console.log('nav lang: '+frameNavLang);
    console.log('nav-main: ' +frameNavMain);
    console.log(resHeight);

    // $('.section-header').affix({
    //   offset: {
    //     top: function() {
    //       return (this.top = resHeight)
    //     },
    //     bottom: function () {
    //       //return (this.bottom = $('.footer').outerHeight(true))
    //     }
    //   }
    // })


    // var top = $(window).scrollTop();
    //
    // if(top >= 0) {
    //   $('.main-nav__list').css({display: 'none'})
    // }




  });

  // Bootstrap





  //
  // $('.header').affix({
  //   offset: {
  //     top: 200
  //   }
  // });

  //$('[data-toggle="tooltip"]').tooltip();
  //$('.dropdown').dropdown();

  //$('.collapse', '.event-timetable').collapse();

  //$('.carousel').carousel()

  // Bug, funktioniert nicht mit bootstrap affix ( => order des aufrufs)

  // Scrollreveal
  // var revealOptions = {
  //   scale: 0.75
  // }
  //
  // window.sr = ScrollReveal();
  // sr.reveal('.section-frame', revealOptions, { container: '#test'});


});




//$(window).on('load', function() {
  //var h = $(window).height();
  //$('.section-frame--navigation').css({minHeight: h});

  // if(iOS){
  //   fixMobileSafariViewport('frame-head');
  // }
  //
  // if(iOS || android){
  //   fixBackgroundAttachmentForMobiles('.frame-head');
  // }

  // if(iOS && $('.frame-head').css('min-height') == '100vh'){
  //   $('.frame-head').css('min-height', window.innerHeight * 1);
  // }


  // var top = $(window).scrollTop();
  //
  // var elemFooter = $('.is-animated-footer');
  // var elemButton = $('.is-animated-button');
  // var elemTopBar = $('.is-animated-topbar');
  // var elemAside  = $('.is-animated-aside');
  //
  // (top >= h) ? elemFooter.addClass('is-visible-footer') : elemFooter.removeClass('is-visible-footer');
  //
  // (top == 0) ? elemButton.addClass('is-visible-button') : elemButton.removeClass('is-visible-button');
  //
  // (top >= h) ? elemTopBar.addClass('is-visible-topbar') : elemTopBar.removeClass('is-visible-topbar');
  //
  // (top >= h) ? elemAside.addClass('is-visible-aside') : elemAside.removeClass('is-visible-aside');

//});
