const gulp = require('gulp')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default
const mocha = require('gulp-mocha')
const clean = require('gulp-clean')
const browserify = require('browserify')
const requireIndex = require('gulp-require-index')
const run = require('run-sequence')
const autoCommit = require('spark-auto-commit')
const source = require('vinyl-source-stream')

gulp.task('buildIndex', function () {
  return gulp.src(['./lib/**/*.js', '!./lib/libs.js', '!./lib/parallelio.js'])
    .pipe(requireIndex({ name: 'libs.js' }))
    .pipe(gulp.dest('./lib'))
})

gulp.task('concat', function () {
  var b = browserify({
    entries: ['./lib/parallelio.js'],
    debug: true,
    standalone: 'Parallelio'
  })
  return b.bundle()
    .pipe(source('parallelio.js'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('compress', gulp.series('concat', function () {
  return gulp.src('./dist/parallelio.js')
    .pipe(uglify({ keep_classnames: true }))
    .pipe(rename('parallelio.min.js'))
    .pipe(gulp.dest('./dist/'))
}))

gulp.task('update', function () {
  return autoCommit.afterModuleUpdate(function (cb) {
    return run('test', cb)
  })
})

gulp.task('clean', function () {
  return gulp.src(['./dist'], { read: false, allowEmpty: true })
    .pipe(clean())
})

var build
gulp.task('build', build = gulp.series('clean', 'buildIndex', 'compress', function (done) {
  console.log('Build Complete')
  done()
}))

gulp.task('watch', function () {
  return gulp.watch(['./lib/**/*.js', '!./lib/libs.js', '!./lib/parallelio.js'], gulp.series('buildIndex', 'compress'))
})

gulp.task('dev', gulp.series('build', 'watch'))

gulp.task('test', gulp.series('build', function () {
  return gulp.src('./test/tests.js')
    .pipe(mocha({ require: ['source-map-support/register'] }))
}))

gulp.task('test-debug', gulp.series('build', function () {
  return gulp.src('./test/tests.js')
    .pipe(mocha({ 'inspect-brk': true, require: ['source-map-support/register'] }))
}))

gulp.task('default', build)
