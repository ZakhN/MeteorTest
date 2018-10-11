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

    const list = Lists.findOne({_id: listId});

    if (this.userId !== list.owner) throw new Meteor.Error('Access denied');

    const userListId =  Meteor.user().profile.selectedListId;

    if (listId === userListId) {
      Meteor.users.update(this.userId, { $set:  { 'profile.selectedListId': '' } });
    }
    Lists.remove(listId);
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

    if (this.userId !== list.owner) throw new Meteor.Error('Access denied');

    Lists.update( listId, { $set: { 'name': name } });
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
    //  userId: { type: String },
  }).validator(),
  run({ listId }) {

    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne({_id: listId});

    if (this.userId !== list.owner) throw new Meteor.Error('Access denied');
    
    Meteor.users.update(this.userId, { $set:  { 'profile.selectedListId': listId } });

    Lists.update({_id: { $ne: listId } }, { $set: { selected: false } }, { multi: true });

    Lists.update( listId, { $set: { 'selected': true } });
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
      owner: this.userId,
    });

    return list;
  }
});

if (Meteor.isServer) {
  Meteor.publish('lists', function listsPublication() {
    return Lists.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });

  Meteor.publish('list', function listsPublication(_id) {
    return Lists.find({
      _id,
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
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
