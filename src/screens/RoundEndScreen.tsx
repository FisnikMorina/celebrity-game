import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { nextRound, totalScore } from "../engine/game";

export function RoundEndScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const finishedRoundKey = String(state.round) as "1" | "2" | "3";

  const totalGuessedThisRound = useMemo(() => {
    return state.teams.reduce((sum, t) => {
      const v = (t.scoreByRound as any)[finishedRoundKey];
      return sum + (typeof v === "number" ? v : 0);
    }, 0);
  }, [state.teams, finishedRoundKey]);

  return (
    <View style={s.container}>
      <Text style={s.h1}>Round {state.round} finished</Text>

      <View style={s.summary}>
        <Text style={s.summaryText}>
          Guessed this round: <Text style={s.bold}>{totalGuessedThisRound}</Text> /{" "}
          <Text style={s.bold}>{state.bucket.length}</Text>
        </Text>
      </View>

      <View style={s.card}>
        {state.teams.map((t, idx) => {
          const roundScore = (t.scoreByRound as any)[finishedRoundKey] ?? 0;
          return (
            <View key={t.id} style={[s.row, idx === state.teams.length - 1 ? s.rowLast : null]}>
              <Text style={s.team}>{t.name}</Text>
              <Text style={s.score}>
                R{state.round}: {roundScore} | Total: {totalScore(t)}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable style={s.primaryBtn} onPress={() => setState((prev) => nextRound(prev))}>
        <Text style={s.primaryBtnText}>{state.round === 3 ? "Finish" : "Next round"}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 260, backgroundColor: "#fafafa" },
  h1: { fontSize: 32, fontWeight: "700", marginBottom: 14 },

  summary: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  summaryText: { fontSize: 16, color: "#333" },
  bold: { fontWeight: "800" },

  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginTop: 6, marginBottom: 20 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowLast: { borderBottomWidth: 0 },

  team: { fontSize: 20, fontWeight: "700" },
  score: { fontSize: 17, marginTop: 4, color: "#333" },

  primaryBtn: { marginTop: 14, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
