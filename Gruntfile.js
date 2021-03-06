module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('guaw.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/js/*.js']
      }
    },
    clean: {
      files: ['dist']
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'src/js/jquery.<%= pkg.name %>.js',
        dest: 'dist/js/jquery.<%= pkg.name %>.min.js'
      },
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'src/css/jquery.<%= pkg.name %>.css',
        dest: 'dist/css/jquery.<%= pkg.name %>.min.css'
      },
    },
    bump: {
      options: {
        files: ['guaw.jquery.json'],
        updateConfigs: ['pkg'],
        commitFiles: ['.'],
        push: true,
        pushTo: 'origin'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-bump');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'cssmin']);

  grunt.registerTask('release', 'Release a new version', function(target) {
    if (!target) {
      target = 'patch';
    }
    return grunt.task.run('bump-only:' + target, 'jshint', 'clean', 'uglify', 'cssmin', 'bump-commit');
  });
};
