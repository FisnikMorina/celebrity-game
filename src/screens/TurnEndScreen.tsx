import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Vibration } from "react-native";
import { Audio } from "expo-av";
import type { GameState } from "../engine/types";
import { nextTurn } from "../engine/game";

export function TurnEndScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const rangRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/mixkit-epic-orchestra-transition-2290.wav"),
        { volume: 1.0 }
      );

      if (!mounted) {
        await sound.unloadAsync();
        return;
      }

      soundRef.current = sound;

      // ring exactly once on screen mount
      if (!rangRef.current) {
        rangRef.current = true;
        Vibration.vibrate(250);

        try {
          await sound.stopAsync();
        } catch {}

        try {
          await sound.setPositionAsync(0);
          await sound.setVolumeAsync(1.0);
          await sound.playAsync();
        } catch {}
      }
    })();

    return () => {
      mounted = false;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) s.unloadAsync();
    };
  }, []);

  const nextTeamName = state.teams[(state.activeTeamIndex + 1) % state.teams.length]?.name ?? "Next team";

  return (
    <View style={s.container}>
      <Text style={s.h1}>Time’s up</Text>
      <Text style={s.muted}>Pass the phone to: {nextTeamName}</Text>

      <Pressable style={s.primaryBtn} onPress={() => setState((prev) => nextTurn(prev))}>
        <Text style={s.primaryBtnText}>Next turn</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 220, backgroundColor: "#fafafa" },
  h1: { fontSize: 30, fontWeight: "900", marginBottom: 10 },
  muted: { color: "#555", marginBottom: 18, fontSize: 16 },
  primaryBtn: { backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
});
