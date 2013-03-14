// Testacular configuration
// Generated on Thu Jul 26 2012 14:35:23 GMT-0700 (PDT)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  MOCHA,
  MOCHA_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,
  'test/main.js',
  // all the sources, tests
  {pattern: 'test/*.js', included: false},
  {pattern: '*.js', included: false},
  {pattern: 'lib/*.js', included: false},
  {pattern: 'lib/chai/*.js', included: false}
];


// list of files to exclude
exclude = [
  'testacular.conf.js',
  'test/test-config.js'
];

preprocessors = {
  '**/advice.js': 'coverage',
  '**/mixin.js': 'coverage'
};


// test results reporter to use
// possible values: dots || progress
reporters = ['dots', 'junit', 'coverage'];
coverageReporter = {
  type : 'cobertura',
  dir : 'coverage/'
};
junitReporter = {
  outputFile: 'test-results.xml'
};


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = ['PhantomJS'];

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
