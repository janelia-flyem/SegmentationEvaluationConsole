module.exports = function(grunt) {

    // load npm modules at runtime -- cleans up configu file
    require('jit-grunt')(grunt);
  
    // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
        server: {
            options: {
              port: 3000,
              base: 'build'
            }
        }
    },
    less: {
        build: {
            options: {
                paths: ['node_modules/bootstrap/less']
            },
            files: { 'build/css/main.css': 'src/less/main.less'}
        },
    },
    cssmin: {
          dist: {
              files: [{
                  expand: true,
                  cwd: 'build/css',
                  src: ['*.css', '!*.min.css'],
                  dest: 'dist/css',
                  ext: '.min.css'
              }]
          }
    },
    browserify: {
      app:          {
        options: {
          transform:  [['babelify', {presets: ['es2015', 'react']}]]
        },
        src:        'src/js/app.js',
        dest:       'build/js/bundle.js'
      },
      specs: {
        options: {
            transform:  [ require('grunt-react').browserify ],
            browserifyOptions: {
                debug: true,
                paths: ["./node_modules"]
            }
        },
        src: ["test/specs/*.js"],
        dest: "test/specs.js"
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        src: 'build/js/bundle.js',
        dest: 'dist/js/bundle.min.js'
      }
    },
    jasmine: {
        tests: {
            src: [],
            options: {
                outfile: "test/_SpecRunner.html",
                specs: "test/specs.js"
            }
        }
    },
    copy: {
        build: {
                files: [
                    {
                        src: 'src/index.html',
                        dest: 'build/index.html'
                    },
                    {
                        src: 'build/css/main.css',
                        dest: 'build/css/main.min.css',
                    },
                    {
                        src: 'build/js/bundle.js',
                        dest: 'build/js/bundle.min.js',
                    },
                    {
                        expand: "true",
                        cwd: 'node_modules/bootstrap/',
                        src: 'fonts/*',
                        dest: 'build/'
                    },
                    {
                        expand: "true",
                        cwd: 'node_modules',
                        src: 'neuroglancer/*',
                        dest: 'build/'
                    }
                ]
        },
        dist: {
                files: [
                    {
                        expand: "true",
                        cwd: 'node_modules/bootstrap/',
                        src: 'fonts/*',
                        dest: 'dist/'
                    },
                    {
                        src: 'src/index.html',
                        dest: 'dist/index.html'
                    },
                    {
                        expand: "true",
                        cwd: 'node_modules',
                        src: 'neuroglancer/*',
                        dest: 'dist/'
                    }
                ]
        },
    },
    jslint: {
        client: {
            src: [
                'src/js/app.js',
                'src/js/components/*.js'
            ],
            directives: {
                node: true,
                browser: true,
                predef: [
                    '$'
                ]
            }
        }
    },
    watch: {
      scripts: {
        files: ['src/application.html', 'src/js/app.js', 'src/js/**/*.js', 'src/less/*.less', 'neuroglancer/*'],
        tasks: ['browserify', 'less', 'copy:build']
      }
    },
    env: {
        dist : {
            NODE_ENV : 'production'
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-env');

  // Default task(s).
  grunt.registerTask('serve', ['connect'])
  grunt.registerTask('default', ['browserify:app', 'less', 'copy:build','connect', 'watch']);
  grunt.registerTask('dist', ['env:dist', 'browserify:app', 'less:build', 'uglify', 'copy:dist', 'cssmin']);
  grunt.registerTask('lint', 'Running lint', ['jslint']);
  grunt.registerTask('test', ["browserify:specs", "jasmine"]);

};
