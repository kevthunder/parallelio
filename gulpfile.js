require('source-map-support').install();

var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify-es').default;
var mocha = require('gulp-mocha');
var clean = require('gulp-clean');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var requireIndex = require('gulp-require-index');
var run = require('run-sequence');
var autoCommit = require('spark-auto-commit');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('coffee', function() {
  return gulp.src(['./src/**/*.coffee'])
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}))
    .pipe(sourcemaps.write('./maps', {sourceRoot: '../src'}))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('buildIndex', function () {
  return gulp.src(['./lib/**/*.js','!./lib/libs.js','!./lib/parallelio.js'])
    .pipe(requireIndex({name:'libs.js'}))
    .pipe(gulp.dest('./lib'));
});

gulp.task('concat', function() {
  var b = browserify({
    entries: ['./lib/parallelio.js'],
    debug: true,
    standalone: 'Parallelio'
  })
  return b.bundle()
    .pipe(source('parallelio.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('compress', gulp.series('concat', function () {
  return gulp.src('./dist/parallelio.js')
    .pipe(uglify({keep_classnames:true}))
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'));
}));

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/**/*.coffee')
    .pipe(sourcemaps.init())
    .pipe(coffee())
    .pipe(sourcemaps.write('./maps', {sourceRoot: './src'}))
    .pipe(gulp.dest('./test/'));
});

gulp.task('update', function() {
  return autoCommit.afterModuleUpdate(function(cb){
    return run('test',cb);
  });
});

gulp.task('clean', function() {
  return gulp.src(['./lib','./dist'], {read: false, allowEmpty:true})
  .pipe(clean());
});

var build;
gulp.task('build', build = gulp.series('clean', 'coffee', 'buildIndex', 'compress', function (done) {
    console.log('Build Complete');
    done();
}));

gulp.task('watch', function() {
  return gulp.watch(['./src/**/*.coffee'], gulp.series('coffee', 'buildIndex', 'compress'));
});

gulp.task('dev', gulp.series('build', 'watch'));

gulp.task('cleanTests', function() {
  return gulp.src(['./test/**/*.js'], {read: false, allowEmpty:true})
  .pipe(clean());
});

gulp.task('test', gulp.series('cleanTests', 'build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha({require:['source-map-support/register']}));
}));

gulp.task('test-debug', gulp.series('build','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha({"inspect-brk":true, require:['source-map-support/register']}));
}));

gulp.task('default', build);