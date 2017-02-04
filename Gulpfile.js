/**
 * Require plugins and assign them to variables
 */

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

/**
 * Load non `gulp-*` prefixed plugins
 */

var bs             = require('browser-sync').create();
var opn            = require('opn');
var mainBowerFiles = require('main-bower-files');
var merge          = require('merge-stream');
var runSequence    = require('run-sequence');
var del            = require('del');
var pngquant       = require('imagemin-pngquant');

// We need to require this explicitely, because we must
// init a new class instance with this variable
var cacheBuster    = require('gulp-cachebust');

//  Init cachebust
var cachebust = new cacheBuster();


/**
 * Prepare gulp-plumber option
 * @see http://blog.ibangspacebar.com/handling-errors-with-gulp-watch-and-gulp-plumber/
 */

var onError = function(err) {
  console.log(err);
  this.emit('end');
}



/**
 * Functions
 *
 * Miscellaneous functions to support tasks
 */

/**
 * Generates random number
 * @return {string} random number
 */

function randomHash() {
    return Math.random()*0xfff|0;
}




/**
 * Some state variables
 *
 * Used in task conditions to avoid the
 * redundancy to write (nearly) identical tasks
 * for dev build and production build. Because
 * of this condition we only have one build task
 * (s. comments for task `build` also).
 */

var isProduction = false;

if(plugins.util.env.production === true) {
  isProduction = true;
}




/**
 * Base vars and paths
 */

var app          = 'app/';
var source       = 'source/';
var bootstrapDir = './bower_components/bootstrap-sass/';

var paths = {
  app:       {
    root:    app,
    assets:  app + 'assets/',
    css:     app + 'assets/css/',
    libs:    app + 'assets/libs/',
    fonts:   app + 'assets/fonts/',
    img:     app + 'assets/img/'
  },
  src:       {
    root:    source,
    favicon: source + 'favicon/',
    sass:    source + 'sass/',
    libs:    source + 'libs/',
    img:     source + 'img/',
    tpls:    source + 'templates/'
  },
  bootstrap: {
    dir: bootstrapDir
  }
}




/**
 * Connect to localhost to serve html files
 * and start syncing
 *
 * 1. Adapt path to fit the environment
 */

gulp.task('browser-sync', function() {
  bs.init({
    server: {
      baseDir: app /* 1 */
    }
  });
});




/**
 * Clean app assets folder
 */

gulp.task('clean:app', function(ca) {
    return del([paths.app.assets + '{css,libs,img,fonts,docs}/**/*', paths.app.root + '*.html'], ca)
});




/**
 * Lint base javascript file
 *
 * Uses `./.eslintrc` file for configuration rules and such.
 */

gulp.task('lint:js', function() {
  return gulp.src(paths.src.libs + 'base.js')
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});




/**
 * Lint source scss source files
 *
 * Uses `./.stylelintrc` file for configuration rules and such.
 */

gulp.task('lint:scss', function() {
  return gulp.src([paths.src.sass + 'core/**/*.scss', '!' + paths.src.sass + 'vendor/*'])
    .pipe(plugins.stylelint({
        failAfterError: false,
        syntax: 'scss',
        reporters: [
          {formatter: 'string', console: true}
        ]
    }));
});




/**
 * Compile sass files, process prefixing, generate sourcemaps,
 * bust cache and minify it (depending on task state (dev/production))
 * and shove it to destination folder at least.
 *
 * 1. Condition wether to execute a plugin or passthru
 */

gulp.task('compile:sass', function() {
  return gulp.src(paths.src.sass + '**/*.scss')
    .pipe(plugins.plumber({errorHandler: onError}))
    .pipe(plugins.sass({outputStyle: 'expanded', includePaths: [paths.bootstrap.dir +  'assets/stylesheets']}))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.autoprefixer({ browsers: ['last 2 version'] }))
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(isProduction ? plugins.csso() : plugins.util.noop()) /* 1 */
    .pipe(plugins.size())
    .pipe(gulp.dest(paths.app.css))
    .pipe(isProduction ? plugins.util.noop() : bs.stream({match: '**/*.css'}));
});





/**
 * Get the templates source files, bust cache (depending on task
 * state (dev/production)) and shove it to the destination folder.
 * Bust cache means, that the implied references to files we like to
 * cache (e.g. css/js) will get updated (if those target files were modified)
 * within the template files.
 *
 * NOTE: NEVER modify `*.html` files within the first layer of the `app/`
 * folder (e.g. `index.html`, `framework.html`). Instead solely edit the source
 * files (e.g. `source/templates/index.nunjucks`, `source/templates/framwork.nunjucks`).
 *
 * 1. Condition wether to execute a plugin or pipe passthru
 */


/**
 * [manageEnvironment description]
 * @param  {[type]} environment [description]
 * @return {[type]}             [description]
 */
var expandEnv = function(environment) {
  environment.addGlobal('randomHash', randomHash);
}




/**
 * Get the templates source files, bust cache (depending on task
 * state (dev/production)) and shove it to the destination folder.
 * Bust cache means, that the implied references to files we like to
 * cache (e.g. css/js) will get updated (if those target files were modified)
 * within the template files.
 *
 * NOTE: NEVER modify `*.html` files within the first layer of the `app/`
 * folder (e.g. `index.html`, `framework.html`). Instead solely edit the source
 * files (e.g. `source/templates/index.nunjucks`, `source/templates/framwork.nunjucks`).
 *
 * 1. Condition wether to execute a plugin or pipe passthru
 */

gulp.task('process:templates', function() {
  return gulp.src(paths.src.tpls + '*.nunjucks')
    .pipe(plugins.plumber({errorHandler: onError}))
    .pipe(isProduction ? cachebust.references() : plugins.util.noop()) /* 1 */
    .pipe(plugins.nunjucksRender({
      path: paths.src.tpls,
      manageEnv: expandEnv
    }))
    .pipe(gulp.dest(paths.app.root));
});






/**
 * Process images which are used within the SASS
 * source, e.g. background images, logos etc.
 */

gulp.task('process:images', function() {
  return gulp.src([paths.src.img + '*.{png,jpg,jpeg}'])
    .pipe(plugins.newer(paths.app.img))
    .pipe(plugins.imagemin([
        plugins.imagemin.jpegtran({progressive: true}),
        plugins.imagemin.optipng()
      ]
    ))
    .pipe(gulp.dest(paths.app.img));
});




/**
 * Collect icon svg's and build a sprite file. This allows to
 * referencing a external sprite file (good for caching) and
 * use single icons inline within the markup by referencing
 * them with fragment identifiers (e.g. path/to/sprite.svg#facebook)
 * to its ID.
 *
 * Markup example:
 *
 *  <svg class="icon"
 *    aria-labelledby="<title> <desc>"
 *    role="presentation">
 *    <title id="<title>">Facebook</title>
 *    <desc id="<desc>">Description</desc>
 *    <use xlink:href="path/to/icon-sprite.svg#facebook" />
 *  </svg>
 *
 * @see http://24ways.org/2014/an-overview-of-svg-sprite-creation-techniques/
 * @see http://www.sitepoint.com/tips-accessible-svg/
 */

gulp.task('process:icons', function() {
  return gulp.src(paths.src.img + 'icon-sprite/*.svg')
    .pipe(plugins.newer(paths.app.img))
    .pipe(plugins.imagemin([
        plugins.imagemin.svgo({
          plugins: [{removeViewBox: false}]
        })
    ]))
    .pipe(plugins.rename({prefix: 'icon-'}))
    .pipe(plugins.svgstore({ inlineSvg: true }))
    .pipe(gulp.dest(paths.app.img));
});





/**
 * Spawn over all `scss` and `js` files for relevant attributes, bust
 * cache (depending on task state (dev/production)) and build a custom
 * modernizr build. Shove it to app libs vendor folder as we need this
 * within the <head> of the page.
 *
 * 1. Condition wether to execute a plugin or passthru
 */

gulp.task('process:modernizr', function() {
  return gulp.src(paths.src.root + '**/*.{js,scss}')
    .pipe(plugins.modernizr('modernizr-custom.min.js', {
        "options": [
          "setClasses" /* 1 */
        ],
        "excludeTests": [
          "sizes"
        ]
    }))
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop()) /* 1 */
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(gulp.dest(paths.app.libs + 'vendor/'))
});





/**
 * Bust cache, minify our base javascript file (depending on task
 * state (dev/production)) and shove it to the destination folder.
 *
 * 1. Condition wether to execute a plugin or passthru
 */

gulp.task('process:base', function() {
  return gulp.src(paths.src.libs + 'base.js')
    .pipe(plugins.plumber({errorHandler: onError}))
    .pipe(plugins.newer(paths.app.libs))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop()) /* 1 */
    .pipe(gulp.dest(paths.app.libs));
});





/**
 * Bust cache, minify our base javascript file (depending on task
 * state (dev/production)) and shove it to the destination folder.
 *
 * 1. Condition wether to execute a plugin or passthru
 */

gulp.task('process:bootstrap', function() {
  return gulp.src(paths.bootstrap.dir + 'assets/javascripts/bootstrap.js')
    .pipe(plugins.plumber({errorHandler: onError}))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop()) /* 1 */
    .pipe(gulp.dest(paths.app.libs));
});




/**
 * Get a dedicated set of vendor javascript plugins which
 * are available in `bower_components`, get all loose files
 * which might be exist in the source vendor folder and
 * merge both paths. Then define what order we like them to have
 * in our plugin file. Finally concatenate the merged files
 * to a new file, bust cache, minify it (depending on task state
 * (dev/production)) and shove it to the destination folder.
 *
 * 1. Source code order within the plugin file
 * 2. Condition wether to execute minification or pipe passthru
 */

gulp.task('concat:plugins', function() {
  return merge(
    gulp.src(mainBowerFiles(), { base: 'bower_components'})
      .pipe(plugins.filter(['**/*.js', '!**/{jquery.min,lazysizes,respimage}.{js,map}']))
    ,
    gulp.src(paths.src.libs + 'vendor/*.js')
    )
    .pipe(plugins.order([ /* 1 */
      '**/fastclick.js',
      '*'
    ]))
    .pipe(plugins.newer(paths.app.libs + 'vendor/plugins.min.js'))
    .pipe(plugins.concat('plugins.min.js'))
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop()) /* 2 */
    .pipe(gulp.dest(paths.app.libs + 'vendor/'));
});




/**
 * Get a dedicated set of vendor javascript plugins (respimages) which
 * are available in `bower_components`, concatenate them to a new file,
 * bust cache, minify it (depending on task state (dev/production))
 * and shove it to the destination folder.
 *
 * 1. Condition wether to execute a plugin or pipe passthru
 */

gulp.task('concat:plugins-respimages', function() {
  return gulp.src(mainBowerFiles({filter: '**/{lazysizes,respimage}.js'}), { base: 'bower_components'})
    .pipe(plugins.newer(paths.app.libs + 'vendor/plugins.images.min.js'))
    .pipe(plugins.concat('plugins.images.min.js'))
    .pipe(isProduction ? cachebust.resources() : plugins.util.noop())
    .pipe(isProduction ? plugins.uglify() : plugins.util.noop()) /* 1 */
    .pipe(gulp.dest(paths.app.libs + 'vendor/'));
});




/**
 * Get minified jquery (with map) and shove it to the destination folder.
 */

gulp.task('copy:jquery', function() {
  return gulp.src(mainBowerFiles({ filter: '**/jquery.min.{js,map}'}), { base: 'bower_components/jquery/dist'})
    .pipe(gulp.dest(paths.app.libs + 'vendor/'));
});




/**
 * Get bootstrap fonts and shove it to the destination folder.
 */

gulp.task('copy:bootstrap-fonts', function() {
  return gulp.src(paths.bootstrap.dir + 'assets/fonts/bootstrap/*')
    .pipe(gulp.dest(paths.app.fonts));
});



/**
 * Watch several files and folder for changes.
 *
 * While scss/css is supposed to be injected without
 * reloading, we want to reload the page(s) whenever
 * there are changes in other files (e.g. javascript,
 * images etc.).
 */

gulp.task('watch', function() {

  gulp.watch(paths.src.sass + '**/*.scss',
    [
      'lint:scss',
      'process:modernizr',
      'compile:sass'
    ]
  );


  gulp.watch(paths.src.libs + 'base.js',
    [
      'lint:js',
      'process:base',
      'concat:plugins'
    ]
  ).on('change', bs.reload);


  gulp.watch(paths.src.img + '*',
    [
      'process:images'
    ]
  ).on('change', bs.reload);


  gulp.watch(paths.src.img + 'icon-sprite/*',
    [
      'process:icons'
    ]
  ).on('change', bs.reload);


  gulp.watch(paths.src.tpls + '*.nunjucks',
    [
      'process:templates'
    ]
  ).on('change', bs.reload);

});







var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).

gulp.task('generate-favicon', function(done) {
  plugins.realFavicon.generateFavicon({
    masterPicture: paths.src.favicon + 'favicon.png',
    dest: paths.app.root,
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'noChange',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#ff2288',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: '#ffffff',
        manifest: {
          name: 'Sean',
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'blackAndWhite',
        threshold: 50,
        themeColor: '#000000'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
  return gulp.src([ paths.src.tpls + 'includes/favicon.nunjucks' ])
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(gulp.dest(paths.src.tpls + 'includes/'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
  var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
    if (err) {
      throw err;
    }
  });
});






/**
 * Build the environment
 *
 * Because we are able to use `env` condition
 * (more info at the top of the Gulpfile) we
 * only have one build task both for development and
 * production. The development fork starts a server,
 * sync files and watch for changes while the production
 * fork mainly minifies several files and data.
 *
 * // Start developing
 * `$ gulp build`
 *
 * // Build production package
 * `$ gulp build --production`
 */

gulp.task('build', function() {

  if (isProduction) {

    runSequence('clean:app', 'process:modernizr',
      [
        'compile:sass',
        'copy:jquery',
        'copy:bootstrap-fonts',
        'process:bootstrap',
        'process:base',
        'concat:plugins',
        'concat:plugins-respimages',
        'process:images',
        'process:icons'
      ],
      'process:templates'
    );

  } else {

    runSequence('clean:app', 'process:modernizr', 'process:templates',
      [
        'lint:scss',
        'compile:sass',
        'copy:jquery',
        'copy:bootstrap-fonts',
        'lint:js',
        'process:bootstrap',
        'process:base',
        'concat:plugins',
        'concat:plugins-respimages',
        'process:images',
        'process:icons',
        'watch'
      ],
      'browser-sync'
    );

  }

});
