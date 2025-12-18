export type Round = 1 | 2 | 3;
export type Phase =
  | "setup"
  | "playerEntry"     // NEW: one player at a time
  | "teamAssign"      // NEW: show teams + joker
  | "coinToss"
  | "roundIntro"
  | "playing"
  | "turnEnd"
  | "roundEnd"
  | "gameEnd";

export type NameItem = { id: string; label: string };
export type NameSource = "builtIn" | "players" | "both";

export type Team = {
  id: string;
  name: string;
  playerIds: string[]; // NEW
  scoreByRound: Record<Round, number>;
};

export type Settings = {
  bucketSize: number;
  allowSkip: boolean;
};

export type Player = {
  id: string;
  name: string;
  celebritiesText: string; // one per line
};




export type GameState = {
  phase: Phase;
  round: Round;
  teams: Team[];
  activeTeamIndex: number;
  currentPlayerIndex: number; // NEW

  // NEW
  totalPlayers: number;
  players: Player[];
  jokerPlayerId?: string; // if odd number of players

  bucket: NameItem[];
  remaining: NameItem[];
  current?: NameItem;

  turnSecondsTotal: number;
  turnSecondsLeft: number;

  skipsLeftThisTurn: number;

  settings: {
    bucketSize: number;
    allowSkip: boolean;
    nameSource: NameSource; // NEW
  };

};
