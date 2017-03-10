#! /usr/bin/env node

require('dotenv').config();
var zipFolder = require('zip-folder');
const sendmail = require('sendmail')();
const del = require('del');

zipFolder('./json', 'times.zip', function(err) {
    if(err) {
        console.log('oh no!', err);
    } else {


      sendmail({
          from: process.env.EMAIL,
          to: process.env.EMAIL,
          subject: 'Tennis Times',
          html: 'Tennis Times',
          attachments: [
            {
              filename: 'times.zip',
              path: 'times.zip'
            }
          ]
        }, function(err, reply) {
          console.log(err && err.stack);
          console.dir(reply);

          del(['json/*.json']).then(paths => {
              console.log('Deleted files:\n', paths.join('\n'));
          });
      });
    }
});
