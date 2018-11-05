import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

const slingshotUpload = new ValidatedMethod({
  name: 'slingshot.upload',
  validate: new SimpleSchema({
    file: { type: Object, blackbox: true },
  }).validator(),
  async run({ file }) {

    const AWS = require('aws-sdk');
    const Busboy = require('busboy');

    const BUCKET_NAME = '';
    const IAM_USER_KEY = '';
    const IAM_USER_SECRET = '';

    function uploadToS3(file) {
     let s3bucket = new AWS.S3({
       accessKeyId: IAM_USER_KEY,
       secretAccessKey: IAM_USER_SECRET,
       Bucket: BUCKET_NAME,
     });
    }
  }
});

if (Meteor.isServer) {

  const LISTS_METHODS = _.map([
    slingshotUpload,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
