import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

import { Payments } from './payments'; 

/**
 * stripe.charge
 * @const make charge.
 */
const stripeCharge = new ValidatedMethod({
  name: 'stripe.charge',
  validate: new SimpleSchema({
    token: { type: Object, blackbox: true },
    reason: { type: String },
    items: { type: Object, blackbox: true },
  }).validator(),
  async run({ token, reason, items }) {
    if (!this.userId) throw new Meteor.Error('Access denied');
    
    if (Meteor.isServer) {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

      const statusObj = {
        amount: 0,
        currency: "usd",
        description: "Charge",
        source: token.id,
      };

      if (reason === 'taskBuy') statusObj.amount = statusObj.amount + 100;
      if (reason === 'listBuy') statusObj.amount = statusObj.amount + 100;
      if (items.sendToCalendar) statusObj.amount = statusObj.amount + 50;
      if (items.filesUpload === 2) statusObj.amount = statusObj.amount + 150;
      if (items.filesUplad === 1) statusObj.amount = statusObj.amount + 75;

      let charge = await stripe.charges.create(statusObj);
      console.log(items);
      const payment = {
        userId: Meteor.userId(),
        charge,
        createdAt: new Date(),
        reason: reason,
        status: statusObj,
        additionalOptions: [
          items.sendToCalendar ? 'send to calendar'  : null,
          items.filesUpload ? 'filesUploud' : null,
        ]
      };

      // if (items) {
      //   if (items.sendToCalendar){
      //     payment.additionalOptions['send to calendar'];
      //   }
      //   if (items.filesUploud) {
      //     payment.additionalOptions['filesUploud:', items.filesUploud];
      //   }
      // }
      
      console.log('+++++++++++++++++');
      // console.log('payment', payment);

      if (charge && reason === 'taskBuy'){
        Meteor.users.update(Meteor.userId(), { $inc: { 'tasksAllow': +1 } });
        payment.reason = reason;
        Payments.insert(payment);
      }

      if (charge && reason === 'listBuy'){
        Meteor.users.update(Meteor.userId(), { $inc: { 'listsAllow': +1 } });
        payment.reason = reason;
        Payments.insert(payment);
      }

      return payment;
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
