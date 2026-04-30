/// <reference types="nativewind/types" />
import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getScreenPadding } from "../constants/layout";
import { useScheduleViewModel } from "@/hooks/useScheduleViewModel";
import { useSettingsStore } from "@/store/settingsStore";
import { SlotBlock } from "@/components/SlotBlock";
import { DayModeChip } from "@/components/DayModeChip";
import { TealButton } from "@/components/TealButton";
import { EmptyState } from "@/components/EmptyState";
import { todayISO, formatDate } from "@/utils/dateHelpers";

/**
 * Today Screen – shows the daily schedule timeline and day mode selector.
 * Fetches Google Calendar events and runs AI task distribution on load.
 */
export default function TodayScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const today = todayISO();
  const { dayMode, setDayMode } = useSettingsStore();
  const {
    daySchedule,
    isLoading,
    error,
    loadScheduleForDate,
    runSmartDistribution,
  } = useScheduleViewModel();

  useEffect((): void => {
    void loadScheduleForDate(today);
  }, [today]);

  const handleRefresh = (): void => {
    void loadScheduleForDate(today);
  };

  const handleSmartDistribute = (): void => {
    void runSmartDistribution(today);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#01696f"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={getScreenPadding(insets.bottom)}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-3">
          <View>
            <Text className="text-text-muted text-xs font-inter uppercase tracking-widest">
              {formatDate(today)}
            </Text>
            <Text className="text-text-primary text-2xl font-inter-bold mt-0.5">
              Today
            </Text>
          </View>
          <DayModeChip mode={dayMode} onPress={() => {}} />
        </View>

        {/* Focus minutes summary */}
        {daySchedule !== null && (
          <View className="bg-surface-elevated rounded-2xl p-4 mb-4">
            <Text className="text-text-muted text-xs font-inter uppercase tracking-wider mb-1">
              Focus Available
            </Text>
            <Text className="text-teal text-3xl font-inter-bold">
              {daySchedule.availableFocusMinutes}
              <Text className="text-text-secondary text-base font-inter"> min</Text>
            </Text>
          </View>
        )}

        {/* Distribute button */}
        <TealButton
          label="Smart Distribute"
          onPress={handleSmartDistribute}
          isLoading={isLoading}
          className="mb-4"
        />

        {/* Error */}
        {error !== null && (
          <View className="bg-surface-elevated rounded-xl p-3 mb-4">
            <Text className="text-red-400 text-sm font-inter">{error}</Text>
          </View>
        )}

        {/* Timeline */}
        <Text className="text-text-secondary text-xs font-inter-medium uppercase tracking-wider mb-3">
          Schedule
        </Text>

        {daySchedule === null || daySchedule.slots.length === 0 ? (
          <EmptyState
            title="No schedule yet"
            subtitle="Connect Google Calendar or tap Smart Distribute"
          />
        ) : (
          daySchedule.slots.map((slot) => (
            <SlotBlock key={slot.id} slot={slot} />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}