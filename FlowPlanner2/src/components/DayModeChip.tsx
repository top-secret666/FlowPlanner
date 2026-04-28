/// <reference types="nativewind/types" />
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { DayMode } from "@/types/ScheduleSlot";

interface DayModeChipProps {
  mode: DayMode;
  onPress?: () => void;
}

const MODE_LABELS: Record<DayMode, string> = {
  deep_work: "Deep Work",
  meetings: "Meetings",
  light: "Light Day",
  off: "Day Off",
};

const MODE_COLORS: Record<DayMode, string> = {
  deep_work: "#01696f",
  meetings: "#6b6b8a",
  light: "#4a7c59",
  off: "#3a3a3a",
};

/**
 * A compact chip that shows and allows changing the current day mode.
 */
export function DayModeChip({
  mode,
  onPress,
}: DayModeChipProps): React.JSX.Element {
  const color = MODE_COLORS[mode];
  const label = MODE_LABELS[mode];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-row items-center rounded-pill px-3 py-1.5"
      style={{ backgroundColor: `${color}22` }}
    >
      <View
        className="w-1.5 h-1.5 rounded-full mr-2"
        style={{ backgroundColor: color }}
      />
      <Text
        className="text-xs font-inter-medium"
        style={{ color }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}