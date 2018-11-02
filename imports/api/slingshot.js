import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

const uploadFile = new ValidatedMethod({
  name: 'file.upload',
  validate: new SimpleSchema({
    file: { type: Object, blackbox: true },
  }).validator(),
  async run({ file }) {

    const uploader = new Slingshot.Upload("myFileUploads");
    
    uploader.send(file, (error, downloadUrl) => {
      if (error) {
        console.error('Error uploading', /* uploader.xhr.response */ error);
        alert (error);
        reject(err);
      } else {
        task.imageurl = downloadUrl;
      }
    });

    // inputFile[1] && await new Promise((resolve, reject) => {
    //   uploader.send(inputFile[1], (error, downloadUrl) => {
    //     if (error) {
    //       console.error('Error uploading', /* uploader.xhr.response */ error);
    //       alert (error);
    //       reject(err);
    //     } else {
    //       task.imageurl1 = downloadUrl;
    //     } 
    //     resolve();
    //   });
    // });
  }
});

if (Meteor.isServer) {

  const LISTS_METHODS = _.map([
    uploadFile,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
