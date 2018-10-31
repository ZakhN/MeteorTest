import { Lists } from '../api/lists';

Accounts.onCreateUser( (options, user) => {
  const list = {
    name: 'My Tasks',
    ownerId: user._id,
    selected: true,
    createdAt: new Date(),
    members: [
      {
        role: 'admin',
        userId: user._id,
      }
    ]
  };

  if (!user.username) user.username = user.services.google.name;
  
  list.ownername = user.username;

  const listId = Lists.insert(list);

  let newUser = {
    selectedListId: listId,
    tasksAllow: 10,
    listsAllow: 3,
  };

  newUser = Object.assign(user, newUser);
 
  return newUser;
});