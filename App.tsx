import React, { useMemo, useState } from "react";
import type { GameState } from "./src/engine/types";
import { builtInNames } from "./src/engine/names";
import { createInitialState } from "./src/engine/game";

import { SetupScreen } from "./src/screens/SetupScreen";
import { PlayerEntryScreen } from "./src/screens/PlayerEntryScreen";
import { TeamAssignScreen } from "./src/screens/TeamAssignScreen";
import { CoinTossScreen } from "./src/screens/CoinTossScreen";

import { RoundIntroScreen } from "./src/screens/RoundIntroScreen";
import { PlayScreen } from "./src/screens/PlayScreen";
import { TurnEndScreen } from "./src/screens/TurnEndScreen";
import { RoundEndScreen } from "./src/screens/RoundEndScreen";
import { GameEndScreen } from "./src/screens/GameEndScreen";

export default function App() {
  const namePool = useMemo(() => builtInNames(), []);
  const [state, setState] = useState<GameState>(() => createInitialState());

  if (state.phase === "setup") return <SetupScreen state={state} setState={setState} namePool={namePool} />;
  if (state.phase === "playerEntry") return <PlayerEntryScreen state={state} setState={setState} />;
  if (state.phase === "teamAssign") return <TeamAssignScreen state={state} setState={setState} namePool={namePool} />;
  if (state.phase === "coinToss") return <CoinTossScreen state={state} setState={setState} />;

  if (state.phase === "roundIntro") return <RoundIntroScreen state={state} setState={setState} />;
  if (state.phase === "playing") return <PlayScreen state={state} setState={setState} />;
  if (state.phase === "turnEnd") return <TurnEndScreen state={state} setState={setState} />;
  if (state.phase === "roundEnd") return <RoundEndScreen state={state} setState={setState} />;
  return <GameEndScreen state={state} setState={setState} />;
}
