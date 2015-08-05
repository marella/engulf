# engulf
**Write gulp tasks using a simple config**

[![npm version](https://badge.fury.io/js/engulf.svg)](http://badge.fury.io/js/engulf)

## What is engulf?
engulf is a small <a target="_blank" href="https://www.npmjs.com/package/engulf">node module</a> that will help you write <a target="_blank" href="https://github.com/gulpjs/gulp#gulp">gulp</a> tasks using a simple config.

## Install
```
npm install engulf
```

## Sample `gulpfile.js` using engulf

This file will give you a taste of what engulf does. This does the same thing that the <a target="_blank" href="https://github.com/gulpjs/gulp#sample-gulpfilejs">sample gulpfile.js</a> of gulp does.

```js
var config = {
  paths: {
    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
    images: 'client/img/**/*'
  },
  tasks: {
    clean: {
      fn: function(cb, tools, gulp) {
        tools.del(['build'], cb);
      }
    },
    scripts: {
      deps: ['clean'],
      src: 'scripts',
      dest: 'build/js',
      run: ['sourcemaps.init', 'coffee', 'uglify', {concat: 'all.min.js'}, 'sourcemaps.write', 'dest']
    },
    images: {
      deps: ['clean'],
      src: 'images',
      dest: 'build/img',
      run: [ { imagemin: {optimizationLevel: 5} }, 'dest']
    },
    watch: {
      scripts: 'scripts',
      images: 'images'
    },
    default: ['watch', 'scripts', 'images']
  },
  tools: {
    del: 'del'
  }
}

var engulf = require('engulf');
engulf.importTools();
engulf.run(config);
```

### Want to write some tasks without config?
```js
var gulp = engulf.gulp;
var tools = engulf.tools;
gulp.task('clean', function(cb) {
  tools.del(['build'], cb);
});
```

## Documentation

### `engulf.run(config)`
This does the following:
- `engulf.load(config)`
- `engulf.requireTools()`
- `engulf.registerTasks()`

### `engulf.load(config)`
Merges supplied `config` object with `engulf.config`

### `engulf.importTools()`
Fetches all `gulp-` plugins from `devDependencies` of `package.json` file and adds it to `engulf.config.tools`. Plugin names are converted to camelCase style.

Example: plugin `gulp-minify-css` will be loaded as `minifyCss` which can be used in `run` array and can also be accessed using `engulf.tools.minifyCss`

### `engulf.requireTools()`
Loads all tools present in `engulf.config.tools` into `engulf.tools` using `require()`

### `engulf.registerTasks(tasks)`
Registers list of tasks specified by `tasks` array that are present in `engulf.config.tasks` using `gulp.task()`. If `tasks` is omitted then all tasks in `engulf.config.tasks` will be registered.

More documentation coming soon...