import type { GameState, NameItem, Round, Team } from "./types";
import { shuffle } from "./shuffle";
import type { NameSource } from "./types";

export function updateNameSource(state: GameState, nameSource: NameSource): GameState {
  return { ...state, settings: { ...state.settings, nameSource } };
}

function roundSeconds(r: Round): number {
  if (r === 1) return 30;
  if (r === 2) return 45;
  return 60;
}

function clampBucket(pool: NameItem[], bucketSize: number): NameItem[] {
  // Deduplicate by label
  const uniq = Array.from(
    new Map(pool.map((n) => [n.label.toLowerCase(), n])).values()
  );

  const size = Math.max(1, Math.min(bucketSize, uniq.length));

  const custom = uniq.filter((n) => n.id.startsWith("custom_"));
  const builtIn = uniq.filter((n) => !n.id.startsWith("custom_"));

  // Case 1: custom alone already fills the bucket
  if (custom.length >= size) {
    return shuffle(custom).slice(0, size);
  }

  // Case 2: take all custom, fill rest randomly from built-in
  const remainingSlots = size - custom.length;
  const fill = shuffle(builtIn).slice(0, remainingSlots);

  // IMPORTANT: shuffle again so customs are not first
  return shuffle([...custom, ...fill]);
}

function nextTeamIndex(state: GameState): number {
  return (state.activeTeamIndex + 1) % state.teams.length;
}

function skipsPerTurn(round: Round): number {
  if (round === 1) return 9999; // unlimited
  if (round === 2) return 1;    // once per turn
  return 0;                     // no skips
}

export function createInitialState(): GameState {
  const teamA: Team = { id: "t1", name: "Team A", playerIds: [], scoreByRound: { 1: 0, 2: 0, 3: 0 } };
  const teamB: Team = { id: "t2", name: "Team B", playerIds: [], scoreByRound: { 1: 0, 2: 0, 3: 0 } };

  return {
    phase: "setup",
    round: 1,
    teams: [teamA, teamB],
    activeTeamIndex: 0,
    currentPlayerIndex: 0,


    totalPlayers: 6,
    players: [],
    jokerPlayerId: undefined,

    bucket: [],
    skipsLeftThisTurn: 0,
    remaining: [],
    current: undefined,
    turnSecondsTotal: 30,
    turnSecondsLeft: 30,
    settings: { bucketSize: 50, allowSkip: true, nameSource: "both" },
  };
}


import type { Player } from "./types"; // add at top

export function updateTotalPlayers(state: GameState, totalPlayers: number): GameState {
  const clamped = Math.max(2, Math.min(20, Math.floor(totalPlayers || 2)));
  return { ...state, totalPlayers: clamped };
}

export function startPlayerEntry(state: GameState): GameState {
  const players = Array.from({ length: state.totalPlayers }, (_, i) => ({
    id: `p${i + 1}`,
    name: "",
    celebritiesText: "",
  }));

  return {
    ...state,
    phase: "playerEntry",
    currentPlayerIndex: 0,
    players,
    jokerPlayerId: undefined,
    teams: state.teams.map((t) => ({ ...t, playerIds: [] })),
  };
}


export function updatePlayerName(state: GameState, index: number, name: string): GameState {
  const players = state.players.map((p, i) => (i === index ? { ...p, name } : p));
  return { ...state, players };
}

export function assignPlayersRandomly(state: GameState): GameState {
  // require names (basic check)
  const trimmed = state.players.map((p) => ({ ...p, name: p.name.trim() }));
  const hasEmpty = trimmed.some((p) => !p.name);
  if (hasEmpty) return { ...state, players: trimmed };

  const shuffled = shuffle(trimmed.map((p) => p.id));

  let jokerPlayerId: string | undefined = undefined;
  let ids = shuffled;

  if (ids.length % 2 === 1) {
    jokerPlayerId = ids[0];   // first becomes joker (random due to shuffle)
    ids = ids.slice(1);
  }

  const half = ids.length / 2;
  const teamAIds = ids.slice(0, half);
  const teamBIds = ids.slice(half);

  const teams = state.teams.map((t, idx) => {
    if (idx === 0) return { ...t, playerIds: teamAIds };
    if (idx === 1) return { ...t, playerIds: teamBIds };
    return t;
  });

  return { ...state, players: trimmed, teams, jokerPlayerId };
}


export function updateTeamName(state: GameState, teamIndex: number, name: string): GameState {
  const teams = state.teams.map((t, i) => (i === teamIndex ? { ...t, name } : t));
  return { ...state, teams };
}

export function updateBucketSize(state: GameState, bucketSize: number): GameState {
  return { ...state, settings: { ...state.settings, bucketSize } };
}

export function toggleSkip(state: GameState): GameState {
  return { ...state, settings: { ...state.settings, allowSkip: !state.settings.allowSkip } };
}

export function startGame(state: GameState, fullNamePool: NameItem[]): GameState {
  const bucket = clampBucket(fullNamePool, state.settings.bucketSize);
  const round: Round = 1;
  const remaining = shuffle(bucket);
  const turnSecondsTotal = roundSeconds(round);

  return {
    ...state,
    phase: "coinToss",
    round,
    bucket,
    remaining,
    current: undefined,
    activeTeamIndex: 0,
    turnSecondsTotal,
    turnSecondsLeft: turnSecondsTotal,
    skipsLeftThisTurn: 0,
  };
}


export function availableThisRound(state: GameState): number {
  return state.remaining.length + (state.current ? 1 : 0);
}

export function startTurn(state: GameState): GameState {
  const turnSecondsTotal = roundSeconds(state.round);

  // If the previous turn ended by time (or pass) and the current card was not guessed,
  // keep it as the first card of the next turn.
  if (state.current) {
    return {
      ...state,
      phase: "playing",
      turnSecondsTotal,
      turnSecondsLeft: turnSecondsTotal,
      skipsLeftThisTurn: skipsPerTurn(state.round),
    };
  }

  const remaining = state.remaining.length + (state.current ? 1 : 0) ? state.remaining : shuffle(state.bucket);
  const [current, ...rest] = remaining;

  return {
    ...state,
    phase: "playing",
    remaining: rest,
    current,
    turnSecondsTotal,
    turnSecondsLeft: turnSecondsTotal,
    skipsLeftThisTurn: skipsPerTurn(state.round),
  };
}


export function tick(state: GameState): GameState {
  if (state.phase !== "playing") return state;

  const next = Math.max(0, state.turnSecondsLeft - 1);
  if (next === 0) {
    return { ...state, phase: "turnEnd", turnSecondsLeft: 0 };
  }
  return { ...state, turnSecondsLeft: next };
}

function drawNextCard(state: GameState): GameState {
  if (state.remaining.length === 0) {
    return { ...state, current: undefined, phase: "roundEnd" };
  }
  const [current, ...rest] = state.remaining;
  return { ...state, current, remaining: rest };
}

export function guessed(state: GameState): GameState {
  if (state.phase !== "playing" || !state.current) return state;

  const round = state.round;
  const teams = state.teams.map((t, idx) => {
    if (idx !== state.activeTeamIndex) return t;
    return { ...t, scoreByRound: { ...t.scoreByRound, [round]: t.scoreByRound[round] + 1 } };
  });

  return drawNextCard({ ...state, teams });
}

export function skip(state: GameState): GameState {
  if (state.phase !== "playing" || !state.current) return state;

  if (state.skipsLeftThisTurn <= 0) return state;
  if (state.remaining.length === 0) return state; // last-card edge case

  const remaining = [...state.remaining, state.current];
  const nextState = { ...state, remaining, skipsLeftThisTurn: state.skipsLeftThisTurn - 1 };
  return drawNextCard(nextState);
}

export function nextTurn(state: GameState): GameState {
  if (state.phase !== "turnEnd") return state;
  return { ...state, phase: "roundIntro", activeTeamIndex: nextTeamIndex(state) };
}

export function nextRound(state: GameState): GameState {
  if (state.phase !== "roundEnd") return state;

  const starterNext = nextTeamIndex(state); // other team should be next

  if (state.round === 3) {
    return { ...state, phase: "gameEnd", activeTeamIndex: starterNext };
  }

  const nextRound: Round = (state.round + 1) as Round;
  const remaining = shuffle(state.bucket);
  const turnSecondsTotal = roundSeconds(nextRound);

  return {
    ...state,
    phase: "roundIntro",
    round: nextRound,
    remaining,
    current: undefined,
    turnSecondsTotal,
    turnSecondsLeft: turnSecondsTotal,
    activeTeamIndex: starterNext,
  };
}

export function resetGame(): GameState {
  return createInitialState();
}

export function chooseStarterTeamIndex(state: GameState): number {
  return Math.floor(Math.random() * state.teams.length);
}

export function setStarterAndGoToRoundIntro(state: GameState, idx: number): GameState {
  // no phase guard, so it can't silently fail
  return { ...state, activeTeamIndex: idx, phase: "roundIntro" };
}

export function totalScore(team: Team): number {
  return team.scoreByRound[1] + team.scoreByRound[2] + team.scoreByRound[3];
}

export function roundRuleText(round: Round): string {
  if (round === 1) return "Round 1: 30s. Use any words except the name.";
  if (round === 2) return "Round 2: 45s. Use only one word.";
  return "Round 3: 60s. No words, only acting.";
}


export function updateCurrentPlayerName(state: GameState, name: string): GameState {
  const i = state.currentPlayerIndex;
  const players = state.players.map((p, idx) => (idx === i ? { ...p, name } : p));
  return { ...state, players };
}

export function updateCurrentPlayerCelebrities(state: GameState, text: string): GameState {
  const i = state.currentPlayerIndex;
  const players = state.players.map((p, idx) => (idx === i ? { ...p, celebritiesText: text } : p));
  return { ...state, players };
}


export function nextPlayer(state: GameState): GameState {
  const i = state.currentPlayerIndex;

  const curr = state.players[i];
  const name = curr?.name?.trim() ?? "";
  if (!name) return state; // you can add UI error later

  const last = i >= state.players.length - 1;
  if (last) return { ...state, phase: "teamAssign" };

  return { ...state, currentPlayerIndex: i + 1 };
}
