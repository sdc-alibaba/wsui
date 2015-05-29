module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var fs = require('fs');
  var path = require('path');
  var BsLessdocParser = require('./grunt/bs-lessdoc-parser.js');
  var getLessVarsData = function () {
    var filePath = path.join(__dirname, 'less/variables.less');
    var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
    var parser = new BsLessdocParser(fileContent);
    return { sections: parser.parseFile() };
  };
  var configBridge = grunt.file.readJSON('./grunt/configBridge.json', { encoding: 'utf8' });

  Object.keys(configBridge.paths).forEach(function (key) {
    configBridge.paths[key].forEach(function (val, i, arr) {
      arr[i] = path.join('./docs/assets', val);
    });
  });

  var jsList = [
    'js/template.js',
    'js/transition.js',
    'js/alert.js',
    'js/button.js',
    'js/carousel.js',
    'js/collapse.js',
    'js/dropdown.js',
    'js/modal.js',
    'js/tooltip.js',
    // SUI不需要bootstrap里的popover
    // 'js/popover.js',
    'js/scrollspy.js',
    'js/tab.js',
    'js/autocomplete.js',
    'js/affix.js',
    'js/pagination.js',
    'js/datepicker.js',
    'js/validate.js',
    'js/datepicker.js',
    'js/intro.js',
    'js/toast.js',
    'js/tag.js',
    'js/pic-uploader.js',
    'js/tagsinput.js'
  ];

  var buildTo = grunt.option('buildTo');

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    dist: buildTo || 'dist',
    // jqueryVersionCheck: configBridge.config.jqueryVersionCheck.join('\n'),

    // Task configuration.
    clean: {
      dist: '<%= dist %>',
      docs: 'docs/dist'
    },

    prefix: {
      options: {
        // 均有默认配置
        keyClass : ['alert', 'badge', 'breadcrumb', 'btn', 'btn-group', 'btn-toolbar', 'dropdown', 'dropdown-menu', 'dropup', 'select', 'icon', 'carousel', 'close', 'form',  'tag', 'label', 'container', 'container-fluid', 'row', 'row-fluid', 'modal', 'navbar', 'nav', 'pagination', 'progress', 'steps', 'steps-round', 'table', 'tooltip', 'lead', 'page-header', 'well', 'input-group', 'list-group', 'jumbotron', 'media', 'panel', 'thumbnail'],
        prefix: 'sui-'
      },
      css: {
        expand: true,
        cwd: './',
        src: ['<%=dist%>/css/**/*.css'],
        dest: './',
        ext: '-prefixed.css'
      }
    },

    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      core: {
        src: ['js/*.js', '!js/template.js']
      },
      test: {
        options: {
          jshintrc: 'js/tests/unit/.jshintrc'
        },
        src: 'js/tests/unit/*.js'
      },
      assets: {
        src: ['docs/assets/js/src/*.js', 'docs/assets/js/*.js', '!docs/assets/js/*.min.js']
      }
    },

    jscs: {
      options: {
        config: 'js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      core: {
        src: '<%= jshint.core.src %>'
      },
      test: {
        src: '<%= jshint.test.src %>'
      },
      assets: {
        options: {
          requireCamelCaseOrUpperCaseIdentifiers: null
        },
        src: '<%= jshint.assets.src %>'
      }
    },

    concat: {
      options: {
      },
      sui: {
        src: ['js/classmap.js'].concat(jsList),
        dest: '<%=dist%>/js/<%= pkg.name %>.js'
      },
      suiPrefixed: {
        src: ['js/classmap-sui.js'].concat(jsList),
        dest: '<%=dist%>/js/<%= pkg.name %>-prefixed.js'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      core: {
        src: '<%= concat.sui.dest %>',
        dest: '<%=dist%>/js/<%= pkg.name %>.min.js'
      },
      corePrefixed: {
        src: '<%= concat.suiPrefixed.dest %>',
        dest: '<%=dist%>/js/<%= pkg.name %>-prefixed.min.js'
      },
      customize: {
        src: configBridge.paths.customizerJs,
        dest: 'docs/assets/js/customize.min.js'
      },
      docsJs: {
        src: configBridge.paths.docsJs,
        dest: 'docs/assets/js/docs.min.js'
      }
    },

    qunit: {
      options: {
        inject: 'js/tests/unit/phantom.js'
      },
      files: 'js/tests/index.html'
    },

    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: '<%=dist%>/css/<%= pkg.name %>.css.map'
        },
        src: 'less/sui.less',
        dest: '<%=dist%>/css/<%= pkg.name %>.css'
      },
      compileTheme: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>-theme.css.map',
          sourceMapFilename: '<%=dist%>/css/<%= pkg.name %>-theme.css.map'
        },
        src: 'less/theme.less',
        dest: '<%=dist%>/css/<%= pkg.name %>-theme.css'
      }
    },

//   autoprefixer: {
//     options: {
//       browsers: configBridge.config.autoprefixerBrowsers
//     },
//     core: {
//       options: {
//         map: true
//       },
//       src: 'dist/css/<%= pkg.name %>.css'
//     },
//     theme: {
//       options: {
//         map: true
//       },
//       src: 'dist/css/<%= pkg.name %>-theme.css'
//     },
//     docs: {
//       src: 'docs/assets/css/src/docs.css'
//     },
//     examples: {
//       expand: true,
//       cwd: 'docs/examples/',
//       src: ['**/*.css'],
//       dest: 'docs/examples/'
//     }
//   },

    csslint: {
      options: {
        csslintrc: 'less/.csslintrc'
      },
      dist: [
        '<%=dist%>/css/sui.css',
        '<%=dist%>/css/sui-theme.css'
      ],
      examples: [
        'docs/examples/**/*.css'
      ],
      docs: {
        options: {
          ids: false,
          'overqualified-elements': false
        },
        src: 'docs/assets/css/src/docs.css'
      }
    },

    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minifyCore: {
        src: '<%=dist%>/css/<%= pkg.name %>.css',
        dest: '<%=dist%>/css/<%= pkg.name %>.min.css'
      },
      minifyTheme: {
        src: '<%=dist%>/css/<%= pkg.name %>-theme.css',
        dest: '<%=dist%>/css/<%= pkg.name %>-theme.min.css'
      },
      minifyCorePrefixed: {
        src: '<%=dist%>/css/<%= pkg.name %>-prefixed.css',
        dest: '<%=dist%>/css/<%= pkg.name %>-prefixed.min.css'
      },
      minifyThemePrefixed: {
        src: '<%=dist%>/css/<%= pkg.name %>-theme-prefixed.css',
        dest: '<%=dist%>/css/<%= pkg.name %>-theme-prefixed.min.css'
      },
      docs: {
        src: [
          'docs/assets/css/src/docs.css',
          'docs/assets/css/src/pygments-manni.css'
        ],
        dest: 'docs/assets/css/docs.min.css'
      }
    },

    csscomb: {
      options: {
        config: 'less/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: '<%=dist%>/css/',
        src: ['*.css', '!*.min.css'],
        dest: '<%=dist%>/css/'
      },
      examples: {
        expand: true,
        cwd: 'docs/examples/',
        src: '**/*.css',
        dest: 'docs/examples/'
      },
      docs: {
        src: 'docs/assets/css/src/docs.css',
        dest: 'docs/assets/css/src/docs.css'
      }
    },

    copy: {
      fonts: {
        src: 'fonts/*',
        dest: '<%=dist%>/'
      },
      lib: {
        src: ['js/lib/*.js'],
        dest: '<%=dist%>/'
      },
      docs: {
        src: ['<%=dist%>/**/*', 'download/**/*'],
        dest: 'docs/'
      },
      old: {
        src: ['old/*/*'],
        dest: '<%=dist%>/'
      }
    },

    connect: {
      server: {
        options: {
          port: 3000,
          base: '.'
        }
      }
    },

    jekyll: {
      options: {
        config: '_config.yml'
      },
      docs: {},
      github: {
        options: {
          raw: 'github: true'
        }
      }
    },

    jade: {
      options: {
        pretty: true,
        data: getLessVarsData
      },
      customizerVars: {
        src: 'docs/_jade/customizer-variables.jade',
        dest: 'docs/_includes/customizer-variables.html'
      },
      customizerNav: {
        src: 'docs/_jade/customizer-nav.jade',
        dest: 'docs/_includes/nav/customize.html'
      }
    },

    watch: {
      src: {
        files: '<%= jshint.core.src %>',
        tasks: ['newer:jshint:core', 'concat', 'newer:copy:docs']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
      less: {
        files: 'less/**/*.less',
        tasks: ['less', 'newer:copy:docs']
      },
      docs: {
        files: 'docs/assets/css/src/*.css',
        tasks: ['cssmin:docs']
      },
      docsJS: {
        files: 'docs/assets/js/src/*.js',
        tasks: ['uglify:docs']
      }
    },

    'saucelabs-qunit': {
      all: {
        options: {
          build: process.env.TRAVIS_JOB_ID,
          throttled: 10,
          maxRetries: 3,
          maxPollRetries: 4,
          urls: ['http://127.0.0.1:3000/js/tests/index.html'],
          browsers: grunt.file.readYAML('grunt/sauce_browsers.yml')
        }
      }
    },

    compress: {
      main: {
        options: {
          archive: 'sui-<%= pkg.version %>-dist.zip',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: '<%=dist%>/',
            src: ['**'],
            dest: 'sui-<%= pkg.version %>-dist'
          }
        ]
      }
    }

  });


  // These plugins provide necessary tasks.

  if (buildTo) {
    require('load-grunt-tasks')(grunt, { scope: ['dependencies'] });
  } else {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
  }

  // Docs HTML validation task
  // grunt.registerTask('validate-html', ['jekyll:docs', 'validation']);
  // grunt.registerTask('validate-html', ['jekyll:docs']);

  var runSubset = function (subset) {
    return !process.env.TWBS_TEST || process.env.TWBS_TEST === subset;
  };
  var isUndefOrNonZero = function (val) {
    return val === undefined || val !== '0';
  };

  // Test task.
  var testSubtasks = [];
  // Skip core tests if running a different subset of the test suite
  if (runSubset('core') &&
      // Skip core tests if this is a Savage build
      process.env.TRAVIS_REPO_SLUG !== 'twbs-savage/bootstrap') {
    testSubtasks = testSubtasks.concat(['dist-css', 'dist-js', 'csslint:dist', 'test-js']);
  }
  // Only run Sauce Labs tests if there's a Sauce access key
  if (typeof process.env.SAUCE_ACCESS_KEY !== 'undefined' &&
      // Skip Sauce if running a different subset of the test suite
      runSubset('sauce-js-unit') &&
      // Skip Sauce on Travis when [skip sauce] is in the commit message
      isUndefOrNonZero(process.env.TWBS_DO_SAUCE)) {
    testSubtasks.push('connect');
    testSubtasks.push('saucelabs-qunit');
  }
  grunt.registerTask('test', testSubtasks);
  grunt.registerTask('test-js', ['jshint:core', 'jshint:test', 'jshint:grunt', 'jscs:core', 'jscs:test', 'jscs:grunt', 'qunit']);

  // JS distribution task.
  grunt.registerTask('dist-js', ['concat', 'uglify:core', 'uglify:corePrefixed', 'copy:lib']);

  // CSS distribution task.
  grunt.registerTask('less-compile', ['less:compileCore', 'less:compileTheme', 'prefix:css']);
  grunt.registerTask('dist-css', ['less-compile', 'csscomb:dist', 'cssmin:minifyCore', 'cssmin:minifyTheme', 'cssmin:minifyCorePrefixed', 'cssmin:minifyThemePrefixed']);

  // Full distribution task.
  grunt.registerTask('dist', ['clean:dist', 'dist-css', 'copy:fonts', 'copy:old', 'dist-js', 'copy:docs']);

  // Default task.
  if (buildTo) {
    grunt.registerTask('default', ['clean:dist', 'copy:fonts', 'copy:old', 'dist-css', 'dist-js', 'docs']);
  } else {
    grunt.registerTask('default', ['clean:dist', 'copy:fonts', 'copy:old', 'test', 'copy:docs', 'docs']);
  }

  // 自动为产出文件和文档补全sui-前缀
  grunt.loadNpmTasks('prefix-cssclass');

 // Version numbering task.
  // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!

  // task for building customizer
  grunt.registerTask('build-customizer', ['build-customizer-html', 'build-raw-files']);
  grunt.registerTask('build-customizer-html', 'jade');

  // Docs task.
  grunt.registerTask('docs-css', ['csscomb:docs', 'csscomb:examples', 'cssmin:docs']);
  grunt.registerTask('lint-docs-css', ['csslint:docs', 'csslint:examples']);
  // 关闭自定义下载相关的任务执行
  // grunt.registerTask('docs-js', ['uglify:docsJs', 'uglify:customize']);
  grunt.registerTask('docs-js', ['uglify:docsJs']);
  grunt.registerTask('lint-docs-js', ['jshint:assets', 'jscs:assets']);
  // grunt.registerTask('docs', ['docs-css', 'lint-docs-css', 'docs-js', 'lint-docs-js', 'clean:docs', 'copy:docs', 'build-glyphicons-data', 'build-customizer']);
  grunt.registerTask('docs', ['docs-css', 'lint-docs-css', 'docs-js', 'lint-docs-js', 'clean:docs', 'copy:lib', 'copy:docs']);

  grunt.registerTask('prep-release', ['jekyll:github', 'compress']);

};
