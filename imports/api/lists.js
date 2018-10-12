import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

export const Lists = new Mongo.Collection('lists');

/**
 * lists.remove
 * @const delete a list
 */
const listRemove = new ValidatedMethod({
  name: 'lists.remove',
  validate: new SimpleSchema({
     listId: { type: String },
  }).validator(),
  run({ listId }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne(listId);
    if (!list) throw new Meteor.Error('List do not exist');
  
    if (this.userId !== list.ownerId) throw new Meteor.Error('Access denied');

    const isListRemoved = Lists.remove(listId);

    if (isListRemoved) {
      if (listId === Meteor.user().profile.selectedListId) {
        Meteor.users.update(this.userId, { $unset:  { 'profile.selectedListId': 1 } });
      }
    }
  }
});

/**
 * lists.update
 * @const update a list
 */
const listUpdate = new ValidatedMethod({
  name: 'lists.update',
  validate: new SimpleSchema({
     listId: { type: String },
     name: { type: String },
  }).validator(),
  run({ listId, name }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne({_id: listId});
    if (!list) throw new Meteor.Error('List do not exist');

    if (this.userId !== list.ownerId) throw new Meteor.Error('Access denied');

    Lists.update(listId, { $set: { name }});
  }
});

/**
 * lists.select
 * @const select a list
 */
const listSelect= new ValidatedMethod({
  name: 'lists.select',
  validate: new SimpleSchema({
     listId: { type: String },
  }).validator(),
  run({ listId }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne({_id: listId});
    if (!list) throw new Meteor.Error('List do not exist');

    if (this.userId !== list.ownerId) throw new Meteor.Error('Access denied');
    
    Meteor.users.update(this.userId, { $set:  { 'profile.selectedListId': listId } });
    Lists.update({_id: { $ne: listId } }, { $set: { selected: false } }, { multi: true });
    Lists.update( listId, { $set: { selected: true } });
  }
});

/**
 * lists.create
 * @const create a list
 */
const listCreate = new ValidatedMethod({
  name: 'lists.create',
  validate: new SimpleSchema({
     listName: { type: String },
  }).validator(),
  run({ listName }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.insert({
      name: listName,
      ownerId: this.userId,
      createdAt: new Date(),
    });

    return list;
  }
});

if (Meteor.isServer) {
  Meteor.publish('lists', function listsPublication() {
    return Lists.find({ ownerId: this.userId });
  });

  Meteor.publish('list', function listsPublication(_id) {
    return Lists.find({
      _id,
      ownerId: this.userId,
    });
  });

  const LISTS_METHODS = _.map([
    listCreate,
    listRemove,
    listUpdate,
    listSelect,
  ], 'name');

  DDPRateLimiter.addRule({
    name(name) {
      return _.includes(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; }
  }, 5, 1000);
}
