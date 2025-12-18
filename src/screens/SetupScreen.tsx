import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Switch, Platform } from "react-native";
import type { GameState, NameItem, NameSource } from "../engine/types";
import {
  toggleSkip,
  updateBucketSize,
  updateTeamName,
  updateTotalPlayers,
  startPlayerEntry,
  updateNameSource,
} from "../engine/game";
import { ScreenShell } from "../ui/ScreenShell";

export function SetupScreen({
  state,
  setState,
  namePool,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  namePool: NameItem[];
}) {
  const [playersText, setPlayersText] = useState(state.totalPlayers ? String(state.totalPlayers) : "");

  useEffect(() => {
    setPlayersText(state.totalPlayers ? String(state.totalPlayers) : "");
  }, [state.totalPlayers]);

  const numberKeyboard = Platform.OS === "web" ? "default" : "number-pad";

  const parsedPlayers = Number(playersText);
  const playersValid = Number.isFinite(parsedPlayers) && parsedPlayers >= 2;

  const setSource = (src: NameSource) => setState((prev) => updateNameSource(prev, src));

  return (
    <ScreenShell>
      <Text style={s.h1}>Guess the Celebrity</Text>
      <Text style={s.subtitle}>Three rounds. Same names. Harder rules.</Text>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Teams</Text>
        {state.teams.map((t, i) => (
          <View key={t.id} style={{ marginBottom: 10 }}>
            <Text style={s.label}>Team {i + 1} Name</Text>
            <TextInput
              value={t.name}
              onChangeText={(txt) => setState((prev) => updateTeamName(prev, i, txt))}
              style={s.input}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Bucket</Text>

        <Text style={s.label}>How many names?</Text>
        <TextInput
          value={String(state.settings.bucketSize)}
          onChangeText={(txt) => setState((prev) => updateBucketSize(prev, Number(txt || 1)))}
          keyboardType={numberKeyboard as any}
          style={s.input}
          returnKeyType="done"
        />

        <Text style={[s.label, { marginTop: 12 }]}>How many players?</Text>
        <TextInput
          value={playersText}
          onChangeText={setPlayersText}
          keyboardType={numberKeyboard as any}
          style={s.input}
          returnKeyType="done"
        />

        <View style={s.row}>
          <Text style={s.label}>Allow skip</Text>
          <Switch value={state.settings.allowSkip} onValueChange={() => setState((prev) => toggleSkip(prev))} />
        </View>

        <Text style={s.muted}>Built-in list available: {namePool.length} names.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Names source</Text>

        <Pressable style={[s.optionBtn, state.settings.nameSource === "builtIn" && s.optionBtnActive]} onPress={() => setSource("builtIn")}>
          <Text style={s.optionText}>Use built-in list only</Text>
        </Pressable>

        <Pressable style={[s.optionBtn, state.settings.nameSource === "players" && s.optionBtnActive]} onPress={() => setSource("players")}>
          <Text style={s.optionText}>Players add their own only</Text>
        </Pressable>

        <Pressable style={[s.optionBtn, state.settings.nameSource === "both" && s.optionBtnActive]} onPress={() => setSource("both")}>
          <Text style={s.optionText}>Mix both</Text>
        </Pressable>
      </View>

      <Pressable
        style={[s.primaryBtn, !playersValid && s.disabledBtn]}
        disabled={!playersValid}
        onPress={() => {
          const n = Number(playersText);
          if (!Number.isFinite(n) || n < 2) return;
          setState((prev) => startPlayerEntry(updateTotalPlayers(prev, n)));
        }}
      >
        <Text style={s.primaryBtnText}>Next</Text>
      </Pressable>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 36, paddingLeft: 6, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 18, paddingLeft: 6 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  label: { fontSize: 16, color: "#222" },
  muted: { marginTop: 10, color: "#555" },

  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10, marginTop: 6, fontSize: 16 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },

  optionBtn: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginTop: 10 },
  optionBtnActive: { borderColor: "#111" },
  optionText: { fontSize: 16, fontWeight: "600", color: "#222" },

  primaryBtn: { marginTop: 6, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  disabledBtn: { opacity: 0.5 },
});
