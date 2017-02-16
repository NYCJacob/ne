var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// browser-sync does not seem to load in load-plugins function
// these plugins do not seem to register with load-plugins
var	browserSync	=	require('browser-sync');
var htmlreplace = require('gulp-html-replace');
var concatCss = require('gulp-concat-css');

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('browserSync', function()	{
    browserSync({
        server:	{
            baseDir: 'src'
        }
    })
});


gulp.task('watch', ['browserSync', 'sass'],	function(){
    gulp.watch('src/sass/*.scss',	['sass']);
    //	Other	watchers
    //	Reloads	the	browser	when	a	JS	file	is	saved
    gulp.watch('src/scripts/**/*.js',	browserSync.reload);
});

function	errorHandler(err)	{
    //	Logs	out	error	in	the	command	line
    console.log(err.toString());
    //	Ends	the	current	pipe,	so	Gulp	watch	doesn't	break
    this.emit('end');
}

function	customPlumber(errTitle)	{
    return	plugins.plumber({
        errorHandler:	plugins.notify.onError({
            //	Customizing	error	title
            title:	errTitle	||	"Error	running	Gulp",
            message:	"Error:	<%=	error.message	%>"
        })
    });
}


gulp.task('jslint', function () {
   return gulp.src('src/scripts/*.js')
       .pipe(plugins.jshint())
       .pipe(plugins.jshint.reporter('jshint-stylish'))
});


gulp.task('minJS', function () {
    // returns a Node.js stream, but no handling of error messages
    return gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('lint:sass',	function()	{
    return	gulp.src('src/sass/*.scss')
        .pipe(plugins.sassLint({
            //	Pointing	to	config	file '.scss-lint.yml'
            configFile: '.sassLint.yml'
        }));
});


gulp.task('sass',	function()	{
    return	gulp.src('src/sass/*.scss')
    // pass custom title to gulp-plumber error handler function
        .pipe(customPlumber('Error Running	Sass'))
        //	Initialize	sourcemap
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        //	Runs	produced	CSS	through	autoprefixer
        .pipe(plugins.autoprefixer())
        //	Writing	sourcemaps
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('src/css'))
        //	Tells	Browser	Sync	to	reload	files	task	is	done
        // browserSync not loaded by load-plugins
        .pipe(browserSync.reload({
            stream:	true
        }))
});

gulp.task('concatCss', function () {
    return gulp.src('src/css/*.css')
        .pipe(concatCss("css/styles.css"))
        .pipe(gulp.dest('dist'));
});


gulp.task('images',	function()	{
    return	gulp.src('src/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(plugins.newer('dist/images'))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest('dist/img'))
});

gulp.task('minHTML', function() {
    return gulp.src('src/*.html')
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('replace', function () {
    return gulp.src('src/*.html')
        .pipe(htmlreplace({
            'css' : 'css/styles.css',
            'js': ['scripts/app.js', 'scripts/vendor/vendor.js']
        }))
        .pipe(gulp.dest('dist'))
});


gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('concant:js', function() {
    return gulp.src('./src/scripts/*.js')
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest('./dist/scripts'));
});

gulp.task('concant:vendor', function() {
    return gulp.src('./src/scripts/vendor/**/*.js')
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest('./dist/scripts/vendor'));
});
