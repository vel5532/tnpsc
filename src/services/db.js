// simple in-memory database

const db = {
  users: [],
  leaderboard: [],
};

// functions

export const getLeaderboard = () => {
  return db.leaderboard;
};

export const getAllUsers = () => {
  return db.users;
};

export const resetLeaderboard = () => {
  db.leaderboard = [];
};

// default export (optional)
export default db;