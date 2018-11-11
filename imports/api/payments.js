import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

export const Payments = new Mongo.Collection('payments');

const paymentCreate = new ValidatedMethod({
  name: 'payment.create',
  validate: new SimpleSchema({
    listName: { type: String },
  }).validator(),
  run({ listName }) {
    // console.log('object');
  }
});

if (Meteor.isServer) {
  Meteor.publish('payments', function paymentsPublication() {
    return Payments.find({
      'userId': this.userId,
    });
  });

  const LISTS_METHODS = _.map([
    paymentCreate,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
