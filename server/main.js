import { Meteor } from 'meteor/meteor';

// import { Lists } from '../imports/api/lists';
import '../imports/api/tasks';
import '../imports/api/lists';

 import '../imports/startup/account-creation';

Meteor.startup(() => {
  // code to run on server at startup
});

// Accounts.onCreateUser( (options, user) => {
//   const listId =  Lists.insert({
//     name: 'My Tasks',
//     ownerId: user._id,
//     selected: true,
//     createdAt: new Date(),
//   });

//   let newUser = {
//     profile: {
//       selectedListId: listId,
//     }
//   };

//   newUser = Object.assign(user, newUser);

//   return newUser;
// });