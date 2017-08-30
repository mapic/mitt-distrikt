module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/output.css': [
            'public/stylesheets/mapbox-gl.css',
            'public/stylesheets/normalize.css',
            'public/stylesheets/style.css',
            'public/stylesheets/mobile.css',
            'public/stylesheets/jquery.dynatable.css'
          ]
        }
      }
    },

    concat: {
      basic_and_extras: {
        files: {
          'public/concat.js': [
            'public/javascripts/lib/bowser.js',
            'public/javascripts/lib/cookies.js',
            'public/javascripts/lib/exif.js',
            'public/javascripts/lib/hammer.js',
            'public/javascripts/lib/hammer-time.js',
            'public/javascripts/lib/instafeed.js',
            'public/javascripts/lib/jquery-3.2.1.slim.js',
            'public/javascripts/lib/jquery.dynatable.js',
            'public/javascripts/lib/js.cookie.js',
            'public/javascripts/lib/lodash.js',
            'public/javascripts/lib/mapbox-sdk.js',
            'public/javascripts/lib/mapbox-gl.js',
            'public/javascripts/lib/mobile-detect.js',
            'public/javascripts/class.js',
            'public/javascripts/locale.js',
            'public/javascripts/api.js',
            'public/javascripts/admin-page.js',
            'public/javascripts/front-page.js',
            'public/javascripts/info-content.js',
            'public/javascripts/map-content.js',
            'public/javascripts/media-content.js',
          ]
        },
      },
    },
    uglify: {
      options: {
        mangle : false
      },
      my_target: {
        files: {
          'public/output.min.js': 'public/concat.js'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);

};

