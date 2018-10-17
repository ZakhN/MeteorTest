import { Lists } from '../api/lists';

Accounts.onCreateUser( (options, user) => {
  const listId =  Lists.insert({
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
  });

  let newUser = {
    selectedListId: listId,
  };
  
  if  (!user.username) user.username = user.services.google.name;

  newUser = Object.assign(user, newUser);

  return newUser;
});