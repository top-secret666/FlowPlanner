/// <reference types="nativewind/types" />
import React from "react";
import { View, Text } from "react-native";
import type { ScheduleSlot, SlotCategory } from "@/types/ScheduleSlot";
import { formatTime, durationMinutes } from "@/utils/dateHelpers";

interface SlotBlockProps {
  slot: ScheduleSlot;
}

/** Colour map for slot categories. */
const CATEGORY_COLORS: Record<SlotCategory, string> = {
  deep_work: "#01696f",
  meetings: "#6b6b8a",
  admin: "#4a7c59",
  break: "#3a3a3a",
  personal: "#7c4a6b",
  blocked: "#2a2a2a",
};

/**
 * A single time-block row in the daily schedule timeline.
 * Shows category colour, time range, title, and duration.
 */
export function SlotBlock({ slot }: SlotBlockProps): React.JSX.Element {
  const color = slot.color ?? CATEGORY_COLORS[slot.category];
  const duration = durationMinutes(slot.startTime, slot.endTime);
  const startLabel = formatTime(slot.startTime);
  const endLabel = formatTime(slot.endTime);

  return (
    <View className="flex-row items-stretch mb-2">
      {/* Time column */}
      <View className="w-14 items-end pr-3 pt-1">
        <Text className="text-text-muted text-xs font-inter">{startLabel}</Text>
      </View>

      {/* Colour bar */}
      <View
        className="w-1 rounded-full mr-3"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <View className="flex-1 bg-surface-elevated rounded-xl p-3">
        <Text
          className="text-text-primary text-sm font-inter-medium"
          numberOfLines={1}
        >
          {slot.title}
        </Text>
        <Text className="text-text-muted text-xs font-inter mt-0.5">
          {endLabel} · {Math.round(duration)} min
        </Text>
      </View>
    </View>
  );
}