var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');


var paths = {
    scripts: [
        './app/bower_components/jquery/dist/jquery.js',
        './app/bower_components/underscore/underscore.js',
        './app/bower_components/backbone/backbone.js',
        './app/bower_components/backbone.localStorage/backbone.localStorage.js',
        './app/bower_components/three.js/three.js',
        './app/components/TrackballControls.js',
        './app/app.js'
    ],
    styles: [
        './app/bower_components/bootstrap/dist/css/bootstrap.css',
        './app/assets/styles/app.css',
    ],
    images: './app/assets/img/*',
    fonts: './app/bower_components/bootstrap/dist/fonts/*',
};

var dest = {
    scripts: './public/',
    styles: './public/assets/css/',
    images: './public/assets/img/',
    fonts: './public/assets/fonts/'
};

gulp.task('scripts', function() {
    var dev = process.env.DEV || false;
    console.log(dev);
    if (dev) {
        return gulp.src(paths.scripts)
            .pipe(sourcemaps.init())
            .pipe(concat('app.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dest.scripts));
    };

    return gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(dest.scripts));
});

gulp.task('styles', function() {
    return gulp.src(paths.styles)
        .pipe(sourcemaps.init())
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest.styles));
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(dest.images));
});

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(dest.fonts));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.fonts, ['fonts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'styles', 'images', 'fonts']);