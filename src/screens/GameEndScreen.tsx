import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { resetGame, totalScore } from "../engine/game";

export function GameEndScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const ranked = [...state.teams].sort((a, b) => totalScore(b) - totalScore(a));

  return (
    <View style={s.container}>
      <Text style={s.h1}>Game finished</Text>

      <View style={s.card}>
        {ranked.map((t, idx) => (
          <Text key={t.id} style={s.p}>
            {idx + 1}. {t.name}: {totalScore(t)} (R1 {t.scoreByRound[1]}, R2 {t.scoreByRound[2]}, R3 {t.scoreByRound[3]})
          </Text>
        ))}
      </View>

      <Pressable style={s.primaryBtn} onPress={() => setState(resetGame())}>
        <Text style={s.primaryBtnText}>New game</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 300, backgroundColor: "#fafafaff" },
  h1: { fontSize: 32, fontWeight: "700", marginBottom: 10 },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginTop: 6, marginBottom:6 },
  p: { fontSize: 18, marginBottom: 15, fontWeight: "500" },
  primaryBtn: { marginTop: 14, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
