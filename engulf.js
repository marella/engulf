/*!
 * engulf v0.1.0 (https://github.com/marella/engulf)
 * Copyright 2015 Ravindra Marella
 * Licensed under MIT (https://github.com/marella/engulf/blob/master/LICENSE)
 */

var $ = require('lodash');
var getobject = require('getobject');
var expander = require('expander');

function error(msg) {
  throw new Error(msg);
}

function firstKey(obj) {
  return $.keys(obj)[0];
}

var gulp = require('gulp');
var tools = {};
var config = {};

function run(cfg, tasks) {
  if ($.isObject(cfg)) {
    load(cfg);
  }
  requireTools();
  registerTasks(tasks);
}

function load(cfg) {
  if (!$.isObject(cfg)) {
    error('Config should be an object');
  }
  cfg = expander.interface(cfg)();
  config = $.merge(config, cfg);
}

function importTools(json) {
  json = $.isUndefined(json) ? process.cwd() + '/package.json' : json;
  if ($.isString(json)) {
    json = require(json);
  }
  if ($.isUndefined(json.devDependencies)) {
    return false;
  }
  if ($.isUndefined(config.tools)) {
    config.tools = {};
  }
  $.forIn(json.devDependencies, function(version, plugin) {
    if ($.startsWith(plugin, 'gulp-')) {
      var name = plugin.substr(4);
      name = $.camelCase(name);
      if ($.isUndefined(config.tools[name])) {
        config.tools[name] = plugin;
      }
    }
  });
}

function requireTools() {
  $.forIn(config.tools, function(plugin, name) {
    tools[name] = require(plugin);
  });
}

function registerTasks(tasks) {
  tasks = $.isArray(tasks) ? tasks : $.keys(config.tasks);
  tasks = $.union(tasks, ['watch', 'default']);
  $.forEach(tasks, function(task) {
    registerTask(task);
  });
}

function registerTask(task) {
  if ($.isUndefined(task)) {
    error('Task not specified');
  }
  if ($.isString(task)) {
    if ($.isUndefined(config.tasks[task])) {
      error('Task ' + task + ' not set');
    }
    task = $.set({}, task, config.tasks[task]);
  }
  register(task);
}

function register(task) {
  var name = firstKey(task);
  task = task[name];
  var deps = $.isUndefined(task.deps) ? [] : task.deps;
  var fn = function() {};
  if ($.isArray(task)) {
    deps = task;
  } else if (!$.isUndefined(task.fn)) {
    fn = task.fn;
  } else if (name === 'watch') {
    fn = function() {
      $.forIn(task, function(target, src) {
        src = $.isUndefined(config.paths[src]) ? src : config.paths[src];
        if (!$.isArray(task[src])) {
          target = [target];
        }
        gulp.watch(src, target);
      });
    };
  } else if (!$.isUndefined(task.src)) {
    fn = function() {
      var src = task.src;
      src = ($.isArray(src) || $.isUndefined(config.paths[src])) ? src : config.paths[src];
      var stream = gulp.src(src);
      if ($.isArray(task.run)) {
        $.forEach(task.run, function(run) {
          var tool = null, options = [];
          if ($.isString(run)) {
            tool = run;
          } else {
            tool = firstKey(run);
            options = run[tool];
            if (!$.isArray(options)) {
              options = [options];
            }
          }
          if (tool === 'dest') {
            var dest = null;
            if (options.length === 1) {
              dest = options[0];
            } else {
              if ($.isUndefined(task.dest)) {
                error('Task dest not set for ' + name);
              }
              dest = task.dest;
            }
            stream = stream.pipe(gulp.dest(dest));
          } else {
            var toolName = tool;
            tool = getobject.get(tools, tool);
            if ($.isUndefined(tool)) {
              console.log($.keys(tools));
              error('Tool ' + toolName + ' not defined');
            }
            stream = stream.pipe(tool.apply(null, options));
          }
        });
      }
      return stream;
    };
  }
  gulp.task(name, deps, function(cb) {
    return fn.call(null, cb, tools, gulp);
  });
}

exports.load = load;
exports.importTools = importTools;
exports.requireTools = requireTools;
exports.registerTask = registerTask;
exports.registerTasks = registerTasks;
exports.run = run;
exports.gulp = gulp;
exports.tools = tools;