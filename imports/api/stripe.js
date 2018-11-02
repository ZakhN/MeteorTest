import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

export const Payments = new Mongo.Collection('payments');

/**
 * stripe.charge
 * @const make charge.
 */
const stripeCharge = new ValidatedMethod({
  name: 'stripe.charge',
  validate: new SimpleSchema({
    token: { type: Object, blackbox: true },
    reason: { type: String },
    filesUpload: { type: Number, required: false },
  }).validator(),
  async run({ token, reason, filesUpload }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    // console.log('reason',reason, 'filesUpload', filesUpload);

    if (Meteor.isServer) {
      const stripe = require("stripe")("sk_test_9X9pmPpxO0kViYpU2vPsAK8w");

      const statusObj = {
        amount: 0,
        currency: "usd",
        description: "Charge for your dirty money",
        source: token.id,
      };

      if (reason === 'filesUpload' && filesUpload === 1) statusObj.amount = statusObj.amount + 100;

      if (reason === 'filesUpload' && filesUpload > 1) statusObj.amount = statusObj.amount + 200;

      if (reason === 'taskBuy') statusObj.amount = statusObj.amount + 100;

      if (reason === 'listBuy') statusObj.amount = statusObj.amount + 100;

      if (reason === 'sendCalendar') statusObj.amount = statusObj.amount + 100;

      let status = await stripe.charges.create(statusObj);

      const charge = {
        userId: Meteor.userId(),
        status,
        createdAt: new Date(),
      };


      if(charge && reason === 'filesUpload'){
        Meteor.users.update(Meteor.userId(), {$set: { filesUploadPay: true }});
      }

      if(charge && reason === 'sendCalendar'){
        Meteor.users.update(Meteor.userId(), {$set: { calendarPay: true }});
      }

      if (charge && reason === 'taskBuy'){
        Payments.insert(charge);
        Meteor.users.update(Meteor.userId(), { $inc: { 'tasksAllow': +1 } });
      }

      if (charge && reason === 'listBuy'){
        Payments.insert(charge);
        Meteor.users.update(Meteor.userId(), { $inc: { 'listsAllow': +1 } });
      }

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
