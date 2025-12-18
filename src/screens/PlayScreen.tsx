import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { guessed, skip, tick } from "../engine/game";

export function PlayScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  // timer tick
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => tick(prev));
    }, 1000);
    return () => clearInterval(id);
  }, [setState]);

  const team = state.teams[state.activeTeamIndex];

  const skipDisabled =
    state.phase !== "playing" ||
    !state.current ||
    state.skipsLeftThisTurn <= 0 ||
    state.remaining.length === 0;

  return (
    <View style={s.container}>
      <Text style={s.h1}>
        {team.name} (Round {state.round})
      </Text>

      <View style={s.row}>
        <View style={s.pill}>
          <Text>
            Time: <Text style={s.bold}>{state.turnSecondsLeft}s</Text>
          </Text>
        </View>
        <View style={s.pill}>
          <Text>
            Remaining:{" "}
            <Text style={s.bold}>
              {state.remaining.length + (state.current ? 1 : 0)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={s.cardBig}>
        <Text style={s.cardText}>{state.current?.label ?? "No card"}</Text>
      </View>

      <View style={s.row}>
        <Pressable
          style={[s.btn, s.btnPrimary]}
          onPress={() => setState((prev) => guessed(prev))}
        >
          <Text style={s.btnText}>Guessed</Text>
        </Pressable>

        <Pressable
          style={[s.btn, skipDisabled ? s.btnDisabled : s.btnSecondary]}
          onPress={() => setState((prev) => skip(prev))}
          disabled={skipDisabled}
        >
          <Text style={s.btnText}>Skip</Text>
        </Pressable>
      </View>

      <Text style={s.muted}>When time hits 0, pass the phone.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 270, backgroundColor: "#fafafa" },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 },
  pill: { borderWidth: 1, borderColor: "#ddd", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  bold: { fontWeight: "700" },
  cardBig: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 18,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  cardText: { fontSize: 30, fontWeight: "800", textAlign: "center" },
  btn: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  btnPrimary: { borderWidth: 1, borderColor: "#111", backgroundColor: "#46dc69" },
  btnSecondary: { borderWidth: 1, borderColor: "#111", backgroundColor: "#ff0101" },
  btnDisabled: { borderWidth: 1, borderColor: "#ddd", opacity: 0.5 },
  btnText: { color: "white", fontWeight: "800", fontSize: 16 },
  muted: { marginTop: 12, color: "#555" },
});
