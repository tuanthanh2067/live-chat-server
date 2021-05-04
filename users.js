const users = [];

const addUser = (id, name, room) => {
  user = { id, name, room }; // new a user
  users.push(user);

  return user;
};

const getUser = (id) => {
  let user = users.find((user) => user.id === id);
  return user;
};

const deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUsersOfARoom = (room) => users.filter((user) => user.room === room);

const getTotalClientOfARoomById = (id) => {
  return getUsersOfARoom(id).length;
};

module.exports = {
  addUser,
  getUser,
  deleteUser,
  getUsersOfARoom,
  getTotalClientOfARoomById,
};
