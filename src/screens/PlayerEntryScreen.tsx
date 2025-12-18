import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { GameState } from "../engine/types";
import { nextPlayer, updateCurrentPlayerCelebrities, updateCurrentPlayerName } from "../engine/game";
import { ScreenShell } from "../ui/ScreenShell";

export function PlayerEntryScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const i = state.currentPlayerIndex;
  const player = state.players[i];

  const allowPlayerCelebs = state.settings.nameSource === "players" || state.settings.nameSource === "both";

  const [celebrityInput, setCelebrityInput] = useState("");

  const celebList = useMemo(() => {
    const txt = player?.celebritiesText ?? "";
    return txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [player?.celebritiesText]);

  const addCelebrity = () => {
    const name = celebrityInput.trim();
    if (!name) return;

    const lower = name.toLowerCase();
    const exists = celebList.some((c) => c.toLowerCase() === lower);
    if (exists) {
      setCelebrityInput("");
      return;
    }

    const next = [...celebList, name].join("\n");
    setState((prev) => updateCurrentPlayerCelebrities(prev, next));
    setCelebrityInput("");
  };

  const removeCelebrity = (idx: number) => {
    const next = celebList.filter((_, i2) => i2 !== idx).join("\n");
    setState((prev) => updateCurrentPlayerCelebrities(prev, next));
  };

  return (
    <ScreenShell>
      <Text style={s.h1}>
        Player {i + 1} of {state.players.length}
      </Text>

      <Text style={s.muted}>
        Enter your name{allowPlayerCelebs ? " and add celebrities" : ""}. Then pass the phone.
      </Text>

      <View style={s.card}>
        <Text style={s.label}>Your name</Text>
        <TextInput
          value={player?.name ?? ""}
          onChangeText={(txt) => setState((prev) => updateCurrentPlayerName(prev, txt))}
          style={s.input}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {allowPlayerCelebs ? (
          <>
            <Text style={[s.label, { marginTop: 12 }]}>Add celebrities</Text>

            <View style={s.addRow}>
              <TextInput
                value={celebrityInput}
                onChangeText={setCelebrityInput}
                placeholder="Type a name"
                style={[s.input, s.addInput]}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={addCelebrity}
              />
              <Pressable style={s.addBtn} onPress={addCelebrity}>
                <Text style={s.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {celebList.length > 0 ? (
              <View style={s.chipsWrap}>
                {celebList.map((c, idx) => (
                  <Pressable key={`${c}_${idx}`} style={s.chip} onPress={() => removeCelebrity(idx)}>
                    <Text style={s.chipText}>{c}</Text>
                    <Text style={s.chipX}>×</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={s.hint}>No celebrities added yet.</Text>
            )}

            <Text style={s.hint}>Tap a chip to remove it.</Text>
          </>
        ) : null}
      </View>

      <Pressable style={s.primaryBtn} onPress={() => setState((prev) => nextPlayer(prev))}>
        <Text style={s.primaryBtnText}>{i === state.players.length - 1 ? "Finish" : "Next player"}</Text>
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

  hint: { marginTop: 8, color: "#555", fontSize: 13 },

  addRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  addInput: { flex: 1, marginTop: 0 },
  addBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "white", fontWeight: "800", fontSize: 14 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#fff" },
  chipText: { fontSize: 14, fontWeight: "700", color: "#222" },
  chipX: { marginLeft: 8, fontSize: 16, fontWeight: "900", color: "#777" },

  primaryBtn: { marginTop: 14, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
});
