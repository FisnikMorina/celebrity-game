import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Vibration } from "react-native";
import type { GameState } from "../engine/types";
import { chooseStarterTeamIndex, setStarterAndGoToRoundIntro } from "../engine/game";

export function CoinTossScreen({
  state,
  setState,
}: {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);


  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = useMemo(() => {
    if (resultIndex !== null) return `${state.teams[resultIndex].name} starts`;
    return state.teams[displayIndex]?.name ?? "?";
  }, [displayIndex, resultIndex, state.teams]);

  const startFlip = () => {
    if (locked || isFlipping) return;

    setLocked(true);
    setIsFlipping(true);

    if (isFlipping) return;
    setIsFlipping(true);
    setResultIndex(null);

    // Decide the real winner immediately, but don't reveal yet
    const winner = chooseStarterTeamIndex(state);

    // Animate by cycling names quickly
    intervalRef.current = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % state.teams.length);
    }, 90);

    // Stop after 1.2s, reveal winner, then advance to round intro
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;

      setDisplayIndex(winner);
      setResultIndex(winner);
      setIsFlipping(false);
      Vibration.vibrate(500);
      // Small pause so the user sees the result before moving on
      setTimeout(() => {
        setState((prev) => setStarterAndGoToRoundIntro(prev, winner));
      }, 2000);
    }, 1200);
    
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.h1}>Coin toss</Text>
      <Text style={s.p}>Tap to decide which team starts.</Text>

      <View style={s.coin}>
        <Text style={s.coinText}>
          {resultIndex === null ? (isFlipping ? displayName : "?") : displayName}
        </Text>
        <Text style={s.sub}>
          {isFlipping ? "Flipping..." : resultIndex === null ? "Ready" : "Starting now"}
        </Text>
      </View>

      <Pressable
        style={[s.primaryBtn, (locked || isFlipping) ? s.disabledBtn : null]}
        onPress={startFlip}
        disabled={locked || isFlipping}
      >
        <Text style={s.primaryBtnText}>
          {locked || isFlipping ? "Flipping..." : "Flip coin"}
        </Text>
      </Pressable>


      <Text style={s.muted}>Pass the phone to the starting team.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 80, backgroundColor: "#fafafa" },
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 10 },
  p: { fontSize: 16, marginBottom: 18 },
  coin: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    padding: 18,
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  coinText: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  sub: { marginTop: 10, color: "#555" },
  primaryBtn: { marginTop: 18, backgroundColor: "#111", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "800" },
  disabledBtn: { opacity: 0.6 },
  muted: { marginTop: 12, color: "#555" },
});
