// =============================================================================

  // Clone
  // Authored by Josh Beveridge

  // "gulp"
  // "gulp build"

// =============================================================================

"use strict";

// Requirements ================================================================
const gulp = require('gulp');
const { series, parallel, src, dest, watch } = require('gulp');
const gulpData = require('gulp-data');
const sass = require('gulp-sass');
const browsersync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const del = require('del');
const twig = require('gulp-twig');
const htmlmin = require('gulp-htmlmin');
const fs = require('fs');

// Tasks =======================================================================

    // Browser Sync
    function browserSync(done) {
        browsersync.init({
            server: {
                baseDir: 'cache'
            },
        });
        done();
    }

    // BrowserSync Reload
    function browserSyncReload(done) {
        return src('cache/*.html')
        .pipe(browsersync.reload({
            stream: true
        }));
    }

    // Twig
    function template() {
        return src('app/twig/*.twig')
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-navigation.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-components.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-styles.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-changes.json'));
        }))
        .pipe(twig())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest('cache'));
    }

    function templateContent() {
        return src('app/twig/content/**/index.twig')
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-navigation.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-components.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-styles.json'));
        }))
        .pipe(gulpData(function(file) {
            return JSON.parse(fs.readFileSync('./app/data/model-changes.json'));
        }))
        .pipe(twig())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest('cache'));
    }

    // Clone JS
    // This function is used for local development when clone-framework is NOT linked locally.
    // function moveCloneJS() {
    //     return src('node_modules/clone-framework/dist/js/clone.min.js')
    //     .pipe(dest('cache/js/clone'));
    // }

    // This function is used for local development when clone-framework IS linked locally to speed up development.
    function moveCloneJS() {
        return src('node_modules/clone-framework/dist/js/clone.min.js')
        .pipe(dest('cache/js/clone'));
    }

    // Prism CSS
    function movePrismCSS() {
        return src('node_modules/prismjs/themes/prism-okaidia.css')
        .pipe(dest('cache/css/prism'));
    }

    // Prism JS
    function movePrismJSMain() {
        return src('node_modules/prismjs/prism.js')
        .pipe(dest('cache/js/prism'));
    }
    function movePrismJSTwig() {
        return src('node_modules/prismjs/components/prism-twig.min.js')
        .pipe(dest('cache/js/prism'));
    }
    function movePrismJSSCSS() {
        return src('node_modules/prismjs/components/prism-scss.min.js')
        .pipe(dest('cache/js/prism'));
    }
    function movePrismJSMarkup() {
        return src('node_modules/prismjs/components/prism-markup.min.js')
        .pipe(dest('cache/js/prism'));
    }
    function movePrismJSMarkdown() {
        return src('node_modules/prismjs/components/prism-markdown.min.js')
        .pipe(dest('cache/js/prism'));
    }
    function movePrismJSBash() {
        return src('node_modules/prismjs/components/prism-bash.min.js')
        .pipe(dest('cache/js/prism'));
    }

    // JavaScript
    function js() {
        return src('app/js/*.js')
        .pipe(concat('app.js'))
        .pipe(dest('cache/js'));
    }

    // Sass
    function compileCSS() {
        return src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(postcss([autoprefixer()]))
        .pipe(dest('cache/css'));
    }

    // Images
    function cacheImages() {
        return src('app/img/**/*')
        .pipe(dest('cache/img'));
    }

    function moveImages() {
        return src('cache/img/**/*')
        .pipe(dest('docs/img'));
    }

    // Minification
    function distCacheHTML() {
        return src('cache/**/*.html')
        .pipe(dest('docs'));
    }
    function distCacheJS() {
        return src('cache/js/*.js')
        .pipe(uglify())
        .pipe(dest('docs/js'));
    }
    function distCacheCSS() {
        return src('cache/css/*.css')
        .pipe(postcss([cssnano()]))
        .pipe(dest('docs/css'));
    }
    function distCloneJS() {
        return src('cache/js/clone/*.js')
        .pipe(dest('docs/js/clone'));
    }
    function distPrismCSS() {
        return src('cache/css/prism/*.css')
        .pipe(dest('docs/css/prism'));
    }
    function distPrismJS() {
        return src('cache/js/prism/*.js')
        .pipe(dest('docs/js/prism'));
    }
    function distFavicons() {
        return src('app/favicons/*')
        .pipe(dest('docs'));
    }

    // Cache Removal
    function cleanCache() {
        return del('cache/**/*')
    }

    // Docs Removal
    function cleanDocs() {
        return del(['docs/**/*', '!docs/CNAME']);
    }

    // Compile
    const compile = series(cleanCache, template, templateContent, moveCloneJS, movePrismJSMain, movePrismJSTwig, movePrismJSSCSS, movePrismJSMarkup, movePrismJSMarkdown, movePrismJSBash, js, cacheImages, movePrismCSS, compileCSS);

    // Quick Compile
    const quickCompile = series(template, templateContent, moveCloneJS, js, cacheImages, compileCSS);

    // Dist
    const dist = series(distCacheHTML, distCacheJS, distCacheCSS, distCloneJS, distPrismJS, distPrismCSS, moveImages, distFavicons);

    // Watch
    function watchFiles() {
        watch('app/scss/**/*.scss', series(quickCompile, browserSyncReload));
        watch('app/twig/**/*.twig', series(quickCompile, browserSyncReload));
        watch('app/js/*.js', series(quickCompile, browserSyncReload));
        watch('app/data/*.json', series(quickCompile, browserSyncReload));
    }

    // Export
    exports.build = series(cleanDocs, compile, dist);
    exports.watch = series(compile, parallel(browserSync, watchFiles));
    exports.default = series(compile, parallel(browserSync, watchFiles));