/* src/lib/dataStructures.js */

export const Player = {
  name: '',
  isLeader: false,
  isFemale: false,
};

export const Team = {
  id: '',
  leader: null, // Player object
  members: [], // Array of Player objects
};

export const AppState = {
  players: [], // Array of Player objects
  numTeams: 0,
  playersPerTeam: 0,
  leaders: [], // Array of Player objects (subset of players)
  females: [], // Array of Player objects (subset of players)
  sortedTeams: [], // Array of Team objects after sorting
};


