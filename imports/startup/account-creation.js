import { Lists } from '../api/lists';

Accounts.onCreateUser( (options, user) => {
  const listId =  Lists.insert({
    name: 'My Tasks',
    ownerId: user._id,
    selected: true,
    createdAt: new Date(),
  });

  let newUser = {
    profile: {
      selectedListId: listId,
    }
  };

  newUser = Object.assign(user, newUser);

  return newUser;
});