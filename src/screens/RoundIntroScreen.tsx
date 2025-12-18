import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { roundRuleText, startTurn } from "../engine/game";

export function RoundIntroScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const team = state.teams[state.activeTeamIndex];

  return (
    <View style={s.container}>
      <Text style={s.h1}>Round {state.round}</Text>
      <Text style={s.p}>{roundRuleText(state.round)}</Text>

      <View style={s.card}>
        <Text style={s.p}>
          Next up: <Text style={s.bold}>{team.name}</Text>
        </Text>
        <Text style={s.p}>Names left this round: {state.remaining.length + (state.current ? 1 : 0)}</Text>
      </View>

      <Pressable style={s.primaryBtn} onPress={() => setState((prev) => startTurn(prev))}>
        <Text style={s.primaryBtnText}>Start turn</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 100, backgroundColor: "#fafafaff" },
  h1: { fontSize: 32, fontWeight: "700", marginBottom: 10, marginTop:200 },
  p: { fontSize: 18, color: "#222", marginBottom: 20, fontWeight: "700" },
  bold: { fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 20, marginTop:6 },
  primaryBtn: { marginTop: 14, backgroundColor: "#46dc69ff", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
