// fs-extra lets us recursively copy directories and do advance file management
const fs = require('fs-extra');

// so we can read files from the filesystem
// var filesystem = require('fs');     // unused ??

// replace allows us to refactor contents of file
// var replace = require('replace');   // unused ??

// find our files
const find = require('find');

// nodeJs logging capability
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'starrynight'});
log.level('warn');

function writeConfigObj (autoConfigObject) {
  log.debug('autoConfigObject', autoConfigObject);

  // Write Our New Config File
  fs.writeJson(
    '.meteor/nightwatch.json',
    autoConfigObject,
    {spaces: 2},
    function writing (error, result) {
      if (error) { log.error(error); }
      log.info('Writing .meteor/nightwatch.json');
      log.debug('writeJson result was : ' + result);
    }
  );
}

// module.exports = function(secondArgument, thirdArgument, fourthArgument){
module.exports = function generateNightWatchConfig (npmPrefix, options) {
  // use current directory if --root isn't specified
  if (!options.root) {
    options.root = '.';
  }

  if (options) {
    if (options.trace) { log.level(options.trace); }
//    log.error('No, not really an error but you supplied --trace=' + options.trace);
    // Read Our Config File Template
    fs.readJson(
      npmPrefix + '/lib/node_modules/starrynight/configs/nightwatch/autoconfig.json',
      function updateNightWatchJson (err, autoConfigObject) {
        if (err) { log.error(err); }
        if (options.mnml || options.minimal) {
          log.info('------------------------------------------');
          log.info('Removing "custom path"  elements     .... ');
          delete autoConfigObject.custom_commands_path;
          delete autoConfigObject.custom_assertions_path;
          writeConfigObj(autoConfigObject);
        } else {
          log.info('------------------------------------------');
          log.info('Searching files for .test directories.... ');
          // Search The Filesystem
          // looking for .tests directories in the filesystem
          // which don't get picked up by the meteor bundler
          find.eachdir('.tests', options.root, function (testDir) {
           // Update Our New Config Object
            autoConfigObject.custom_commands_path.push(testDir);
            // Test For Subdirecotries
            find.eachdir('actions', testDir, function (actionsDir) {
              // Update Our New Config Object
              autoConfigObject.custom_commands_path.push(actionsDir);
            });
          }).end( writeConfigObj(autoConfigObject) );
        }

        log.info('Updated .meteor/nightwatch.json.');
      }
    );
  }
};


/*
// cheerio provides DOM/jQuery utilities to lets us parse html
var cheerio = require('cheerio');


module.exports = function(secondArgument){
  //log.info( 'Extracting ids from ' + secondArgument);
  filesystem.readFile(secondArgument, {encoding: 'utf-8'}, function(error, data){
    if(data){
      //log.info(data.toString());
      $ = cheerio.load(data.toString())
      var ids = new Array();
      $('[id]').each(function() { //Get elements that have an id=
        ids.push($(this).attr('id')); //add id to array
      });

      var fileText = '';
      fileText += 'exports.command = function() {\n';
      fileText += '  this\n';
      ids.forEach(function(id){
        fileText += '    .verify.elementPresent('#' + id + '')\n';
      });
      fileText += '  return this;\n';
      fileText += '};';

      log.info(fileText);

      //log.info(ids);
    }
    if(error){
      console.error(error);
    }
  });
}*/