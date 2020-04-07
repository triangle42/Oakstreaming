var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var jasmineBrowser = require('gulp-jasmine-browser');
var rename = require("gulp-rename");
var pump = require('pump');
var nodemon = require("gulp-nodemon");
var gulpMultiProcess = require("gulp-multi-process");
// var babelify = require("babelify");

// Add custom browserify options here.
var customOpts = {
  entries: ['./example-application.js'],
  extensions: [".js", ".json", ".es6", ".es", ".jsx"],
  debug: true
};
var customOpts2 = {
  entries: ['./jasmine-testsuites-help.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var opts2 = assign({}, watchify.args, customOpts2);
var b = watchify(browserify(opts));
var b2 = watchify(browserify(opts2));

gulp.task('browserify', function (cb) { bundle(); cb(); });
gulp.task('browserify2', function (cb) { bundle2(); cb(); });
gulp.task('browserify3', function (cb) { browserifySecondApplication(); cb(); });

b.on('update', bundle); // On any dep update, run the bundler.
b2.on('update', bundle2);
b.on('log', gutil.log); // Output build logs to terminal.
b2.on('log', gutil.log);

function bundle() {
  return b.transform("babelify", { presets: ["es2015"] }) //   babel-preset-es2015
    .bundle()
    .on('error', gutil.log.bind(gutil, 'example-application.js: Browserify Error'))
    .pipe(source('./example-application.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./web/'));
}

function bundle2() {
  return b2.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('./jasmine-testsuites-help.js'))
    .pipe(gulp.dest('./jasmine-testsuites-build/'));
}

function browserifySecondApplication() {
  var b = browserify({
    entries: './secondExampleApplication/source.js',
    debug: true
  });

  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('./secondExampleApplication/source.js'))
    .pipe(rename("index.js"))
    .pipe(gulp.dest('./secondExampleApplication/'));
}

function errorLog(error) {
  console.error.bind(error);
  this.emit('end');
}


gulp.task('uglify_example_app.js', ['browserify'], function (cb) {
  pump([
    gulp.src('./web/example-application.js'),
    uglify(),
    gulp.dest('./web/')
  ],
    cb
  );
});

// Uglifies index.html
gulp.task('minify_example_app.html', function () {
  gulp.src('./example-application.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .on('error', errorLog)
    .pipe(rename("index.html"))
    .pipe(gulp.dest('./web/'));
  console.log("Uglified and renamed example-application.html");
});

gulp.task('web-server', function () {
  nodemon({
    script: 'oakstreaming-web-server.js',
    ext: 'js'
  });
});

gulp.task('torrent-tracker', function () {
  nodemon({
    script: 'oakstreaming-tracker.js',
    ext: 'js'
  });
});

gulp.task('servers', (cb) => {
  return gulpMultiProcess(['web-server', 'torrent-tracker'], cb, true);
});

gulp.task('tests', ['browserify2'], function () {
  return gulp.src(['./jasmine-testsuites-build/jasmine-testsuites-help.js', './jasmine-testsuites.js'])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({ port: 8888 }));
});


gulp.task('watch', [], function () {
  gulp.watch('./example-application.js', ['browserify']);
  gulp.watch('./jasmine-testsuites.js', ['browserify2', 'tests']);
  gulp.watch('./index.html', ['minify_example_app.html']);
});

gulp.task('watch_production', [], function () {
  gulp.watch('./example-application.js', ['browserify']);
  gulp.watch('./index.html', ['minify_example_app.html']);
});

//gulp.task('example2', ['browserify3', 'connect2']);

gulp.task('default', ['browserify', 'browserify2', 'minify_example_app.html', 'servers', 'tests', 'watch']);
gulp.task('production', ['browserify', 'minify_example_app.html', 'servers', 'watch_production']);