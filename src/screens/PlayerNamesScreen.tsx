import React, { useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { updatePlayerNameAtIndex, startPlayerEntry } from "../engine/game";
import { ScreenShell } from "../ui/ScreenShell";

export function PlayerNamesScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const count = state.players.length;

  const allNamed = useMemo(() => {
    return state.players.every((p) => (p.name ?? "").trim().length > 0);
  }, [state.players]);

  return (
    <ScreenShell>
      <Text style={s.h1}>Players</Text>
      <Text style={s.muted}>Enter everyone’s name. Then you will pass the phone to add celebrities.</Text>

      <View style={s.card}>
        {state.players.map((p, idx) => (
          <View key={p.id} style={{ marginBottom: 12 }}>
            <Text style={s.label}>Player {idx + 1} of {count}</Text>
            <TextInput
              value={p.name ?? ""}
              onChangeText={(txt) => setState((prev) => updatePlayerNameAtIndex(prev, idx, txt))}
              style={s.input}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        ))}
      </View>

      <Pressable
        style={[s.primaryBtn, !allNamed && s.disabledBtn]}
        disabled={!allNamed}
        onPress={() => setState((prev) => startPlayerEntry(prev))}
      >
        <Text style={s.primaryBtnText}>Continue</Text>
      </Pressable>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 10 },
  muted: { color: "#555", marginBottom: 14 },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  label: { fontSize: 16, color: "#222" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginTop: 6, fontSize: 16 },

  primaryBtn: { marginTop: 14, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
  disabledBtn: { opacity: 0.5 },
});
