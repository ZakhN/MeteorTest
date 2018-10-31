import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';
// import stripe from "stripe";

export const Payments = new Mongo.Collection('payments');

/**
 * stripe.charge
 * @const make charge.
 */
const stripeCharge = new ValidatedMethod({
  name: 'stripe.charge',
  validate: new SimpleSchema({
    token: { type: Object, blackbox: true }
  }).validator(),
  async run({ token }) {
    if (!this.userId) throw new Meteor.Error('Access denied');
  
    if (Meteor.isServer) {
      const stripe = require("stripe")("sk_test_9X9pmPpxO0kViYpU2vPsAK8w");

      let status = await stripe.charges.create({
        amount: 200,
        currency: "usd",
        description: "An example charge",
        source: token
      });

      const charge = {
        userId: Meteor.userId(),
        status,
      };

      console.log('charge---------->', charge );

      Payments.insert(charge);

      return status;
    }
  }
});

if (Meteor.isServer) {

  Meteor.publish('payments', function paymentsPublication() {
    return Payments.find({ 
      'userId': this.userId,
    });
  });

  const LISTS_METHODS = _.map([
    stripeCharge,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },
    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
