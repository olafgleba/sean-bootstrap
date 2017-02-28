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
    FastClick.attach(document.body);

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



  // Formular Validation

  // english
  $("#contact-form-en").validate({
    rules: {
      name: {
        required: true
      },
      email: {
        email: true
      },
      mesg: "required"
    },
    messages: {
      name: {
        required: "Please enter your name"
      },
      email: {
        email: "Please check your e-mail address"
      },
      mesg: {
        required: "Please leave us a message"
      }
    },
    submitHandler: function(form) {
      form = $(form);
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        success: function (response) {
          $('#js-contact-form__response').html(
            "<h3 class='u-text-highlight'>Thank you!</h3><p>Your E-Mail was sent successfully.</p>"
          )
          .fadeIn('fast')
          .delay(3000)
          .fadeOut('fast');

          // reset form elements
          form.each(function(i) {
            $(this).find('input, textarea').val('');
          });
        }
      });
      return false;
    }
  });


  // Deutsch
  $("#contact-form-de").validate({
    rules: {
      name: {
        required: true
      },
      email: {
        email: true
      },
      mesg: "required"
    },
    messages: {
      name: {
        required: "Bitte geben Sie Ihren Namen ein"
      },
      email: {
        email: "Bitte überprüfen Sie Ihre E-Mail Adresse"
      },
      mesg: {
        required: "Bitte schreiben Sie uns ein paar Worte"
      }
    },
    submitHandler: function(form) {
      form = $(form);
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        success: function (response) {
          $('#js-contact-form__response').html(
            "<h3 class='u-text-highlight'>Vielen Dank!</h3><p>Ihre E-Mail wurde erfolgreich versandt.</p>"
          )
          .fadeIn('fast')
          .delay(3000)
          .fadeOut('fast');

          // reset form elements
          form.each(function(i) {
            $(this).find('input, textarea').val('');
          });
        }
      });
      return false;
    }
  });






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






  // Bootstrap modals with remote targets

  // Create jQuery body object
  var $body = $('body'),

  // Use a tags with 'class="is-modal-trigger"' as the triggers
  $modalTriggers = $('a.is-modal-trigger'),

  // Trigger event handler
  openModal = function(evt) {
    var $trigger = $(this),
    modalPath = $trigger.attr('href'),
    $newModal,

    removeModal = function(evt) {
      $newModal.off('hidden.bs.modal');
      $newModal.remove();
    },

    showModal = function(data) {
      $body.append(data);
      $newModal = $('.modal').last();
      $newModal.modal('show');
      $newModal.on('hidden.bs.modal',removeModal);
    };

    $.get(modalPath,showModal);
    evt.preventDefault();
  };

  $modalTriggers.on('click',openModal);





  // Init responsive navigation
  var nav = responsiveNav(".nav-collapse", {
    openPos: 'relative',
    customToggle: '.nav-toggle',
    closeOnNavClick: true
  });





  // Init lightbox
  $(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
  });




  // Init and declare target scrolling + fixed navigation
  $(window).on('load resize scroll', function() {
    var frameNavLang = $('.section-frame--navigation-lang').innerHeight();
    var frameNavMain = $('.section-frame--navigation-main').innerHeight();
    var frameHeader = $('.section-frame--header').innerHeight();
    var h = $(window).height();

    var resHeight = frameNavMain + frameNavLang + frameHeader;
    var resHeight = resHeight;

    $('.section-header').affix({
      offset: {
        top: function() {
          return (this.top = resHeight)
        }
      }
    })


    $(".affix .main-nav__list a").smoothScroll({
        speed: 700,
        easing: 'swing',
        beforeScroll: function(options) {
          if(window.matchMedia("(min-width: 992px)").matches) {
            options.offset = -200;
          } else {
            options.offset = -220;
          }
        }
    });

    $(".affix-top .main-nav__list a").smoothScroll({
        speed: 700,
        easing: 'swing',
        beforeScroll: function(options) {
          if(window.matchMedia("(min-width: 992px)").matches) {
            options.offset = -200;
          } else {
            options.offset = -455;
          }
        }
    });


    $(".header-nav a").smoothScroll({
        speed: 700,
        easing: 'swing',
        beforeScroll: function(options) {
          if(window.matchMedia("(min-width: 992px)").matches) {
            options.offset = -350;
          } else {
            options.offset = -300;
          }
        }
    });


  });


});
