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




  // Match to Bootstraps data-toggle for the modal
  // and attach an onclick event handler
  $('a[data-toggle="modal"]').on('click', function(e) {

    //var href = $(this).attr('href');

    // Get the target modal (container)
    //var target_modal = $(this).data('target');
    var target_modal = $(e.currentTarget).data('target');
    // Get the address for partial modal content
    var remote_content = e.currentTarget.href;
    //var remote_content = href;

    //console.log(remote_content);

    // Address the target modal in the DOM
    var modal = $(target_modal);

    //console.log(modal.html());

    // Address the target modal area to populate with remote content
    var modalContent = $(target_modal + ' .modal-content');

    // Empty the DOM after closing the modal; seems neccessary
    // modal.on('hide.bs.modal', function () {
    //   //$(target_modal + ' .modal-content').html('');
    //   $(target_modal + ' .modal-content').empty();
    // })

    // On show to the modal, load remote content and show modal at last
    modal.on('show.bs.modal', function () {
      $(target_modal + ' .modal-content').load(remote_content);
    })
    .modal();

    modal.on('hide.bs.modal', function () {
      //console.log(modalContent.html());

      //console.log(modalContent);

      //modelContent.empty();
      $(target_modal).removeData('bs.modal');
      $(target_modal + ' .modal-content').html('');

      //$(target_modal + ' .modal-content').empty();
      //var debug = $(target_modal + ' .modal-content').remove();
      //var debug = $(target_modal + ' .modal-content').empty();
      //console.log($(debug).html());
    });



    // Prevent default behaviour
    return false;
    //e.preventDefault;
  });




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

  // Bootstrap

  // Bug, funktioniert nicht mit bootstrap affix ( => order des aufrufs)

  // Scrollreveal
  // var revealOptions = {
  //   scale: 0.75
  // }
  //
  // window.sr = ScrollReveal();
  // sr.reveal('.section-frame', revealOptions, { container: '#test'});

});
