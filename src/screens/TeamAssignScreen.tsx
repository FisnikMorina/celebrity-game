import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import type { GameState, NameItem } from "../engine/types";
import { assignPlayersRandomly, startGame } from "../engine/game";
import { customNamesFromText, mergeNamePools } from "../engine/names";

export function TeamAssignScreen({
  state,
  setState,
  namePool,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  namePool: NameItem[];
}) {
  const [locked, setLocked] = useState(false);

  const playersById = useMemo(
    () => new Map(state.players.map((p) => [p.id, p.name])),
    [state.players]
  );

  const teamA = state.teams[0];
  const teamB = state.teams[1];

  const teamAPlayers = teamA.playerIds
    .map((id) => playersById.get(id))
    .filter(Boolean) as string[];

  const teamBPlayers = teamB.playerIds
    .map((id) => playersById.get(id))
    .filter(Boolean) as string[];

  const joker = state.jokerPlayerId ? playersById.get(state.jokerPlayerId) : null;

  const assigned = teamAPlayers.length > 0 || teamBPlayers.length > 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>Teams</Text>
        <Text style={s.muted}>Players are assigned randomly.</Text>

        <Pressable
          style={[s.primaryBtn, locked ? s.disabledBtn : null]}
          disabled={locked}
          onPress={() => {
            if (locked) return;
            setLocked(true);
            setState((prev) => assignPlayersRandomly(prev));
          }}
        >
          <Text style={s.primaryBtnText}>{locked ? "Assigned" : "Assign randomly"}</Text>
        </Pressable>

        {assigned && (
          <View style={[s.card, { marginTop: 16 }]}>
            <Text style={s.teamTitle}>{teamA.name}</Text>
            {teamAPlayers.map((n, i) => (
              <Text key={`a_${i}`} style={s.player}>
                {n}
              </Text>
            ))}

            <Text style={[s.teamTitle, { marginTop: 12 }]}>{teamB.name}</Text>
            {teamBPlayers.map((n, i) => (
              <Text key={`b_${i}`} style={s.player}>
                {n}
              </Text>
            ))}

            {joker ? (
              <>
                <Text style={[s.teamTitle, { marginTop: 12 }]}>Joker (helps both teams)</Text>
                <Text style={s.player}>{joker}</Text>
              </>
            ) : null}
          </View>
        )}

        {assigned && (
          <Pressable
            style={[s.primaryBtn, { marginTop: 16 }]}
            onPress={() => {
              const useBuiltIn =
                state.settings.nameSource === "builtIn" || state.settings.nameSource === "both";
              const usePlayers =
                state.settings.nameSource === "players" || state.settings.nameSource === "both";

              const builtIn = useBuiltIn ? namePool : [];

              const allCustomText = usePlayers
                ? state.players.map((p) => p.celebritiesText || "").join("\n")
                : "";

              const custom = usePlayers ? customNamesFromText(allCustomText) : [];

              const merged = [...builtIn, ...custom];

              setState((prev) => startGame(prev, merged));

            }}
          >
            <Text style={s.primaryBtnText}>Continue</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fafafa" },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: "#fafafa",
  },

  h1: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  muted: { color: "#555", marginBottom: 12 },

  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
  },

  teamTitle: { fontSize: 16, fontWeight: "800", marginTop: 6 },
  player: { fontSize: 16, marginTop: 4 },

  primaryBtn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
  disabledBtn: { opacity: 0.6 },
});
