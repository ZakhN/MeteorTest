import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import _ from 'lodash';
import SimpleSchema from 'simpl-schema';

export const Lists = new Mongo.Collection('lists');

import { Tasks } from './tasks';

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

    if (!list.members.find(({ userId, role }) => userId === this.userId && role === 'admin')) {
      if (!this.isSimulation) {
        throw new Meteor.Error('Access denied');
      }
    } 
   
    const isListRemoved = Lists.remove(listId);

    if (isListRemoved) {
        Meteor.users.update({ selectedListId: list._id }, { $unset:  { 'selectedListId': 1 } });
        Tasks.remove({ listId: listId });
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

    if (!list.members.find(({ userId, role }) => userId === this.userId && role === 'admin')) {
      if (!this.isSimulation) {
        throw new Meteor.Error('Access denied');
      }
    } 

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

    // console.log(!list);

    if (!list) throw new Meteor.Error('List do not exist');

    if (!list.members.find(({ userId, role }) => userId === this.userId && role === 'admin')) {
      if (!this.isSimulation) {
        throw new Meteor.Error('Access denied');
      }
    } 

    Meteor.users.update(this.userId, { $set:  { 'selectedListId': listId } });
    Lists.update({_id: { $ne: listId } }, { $set: { selected: false } }, { multi: true });
    Lists.update( listId, { $set: { selected: true } });
  }
});

/**
 * lists.users.add
 * @const add a user to a list
 */
const addListUser= new ValidatedMethod({
  name: 'lists.users.add',
  validate: new SimpleSchema({
     listId: { type: String },
     userId: { type: String },
     role: { type: String, allowedValues: ['admin', 'viewer'] },
  }).validator(),
  run({ listId, userId, role }) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne(listId);
    if (!list) throw new Meteor.Error('List do not exist');

    if (!list.members.find(({ userId, role }) => userId === this.userId && role === 'admin')) {
      if (!this.isSimulation) {
        throw new Meteor.Error('Access denied');
      }
    } 
    // if ((list.members.find(l => ((l.userId === this.userId) && (l.role === 'admin')))).userId ? false : true ) throw new Meteor.Error('You have not that list');
    
    Lists.update(listId, { $addToSet:  { members: { role, userId } } });
  }
});

/**
 * lists.users.remove
 * @const remove a user from a list
 */
const removeListUser= new ValidatedMethod({
  name: 'lists.users.remove',
  validate: new SimpleSchema({
     listId: { type: String },
     userId: { type: String },
  }).validator(),
  run({ listId, userId}) {
    if (!this.userId) throw new Meteor.Error('Access denied');

    const list = Lists.findOne(listId);
    if (!list) throw new Meteor.Error('List do not exist');

    Lists.update(listId, { $pull: { 'members.userId': userId }});

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

    const list = {
      name: listName,
      ownerId: this.userId,
      ownername: Meteor.user().username,
      createdAt: new Date(),
      members: [
        {
          userId: this.userId,
          userName: Meteor.user().username,
          role: 'admin',
        }
      ]
    };
    
    if (!Meteor.user().selectedListId ) {
      list.selected = true;

      insertedListId = Lists.insert(list);

      Meteor.users.update({ _id: Meteor.user()._id }, { $set: { selectedListId: insertedListId } });
    }
   
    return insertedListId;
  }
});

if (Meteor.isServer) {

  Meteor.publish('lists', function listsPublication() {
    return Lists.find({ 
      'members.userId': this.userId,
    });
  });

  Meteor.publish('user', function() {
    return Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        selectedListId: 1,
      },
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
