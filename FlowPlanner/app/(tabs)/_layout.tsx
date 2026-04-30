/// <reference types="nativewind/types" />
import React from "react";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { Palette } from "lucide-react-native";

/** Tab icon using a text character – no icon-in-circle pattern. */
function TabIcon({
  symbol,
  focused,
}: {
  symbol: string;
  focused: boolean;
}): React.JSX.Element {
  return (
    <View className="items-center justify-center">
      <Text
        className="text-lg"
        style={{ color: focused ? "#01696f" : "#606060" }}
      >
        {symbol}
      </Text>
    </View>
  );
}

/**
 * Bottom tab navigator with 5 tabs: Today, Tasks, Journal, Scrapbook, Settings.
 */
export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#141414",
          borderTopColor: "#2a2a2a",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#01696f",
        tabBarInactiveTintColor: "#606060",
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="◈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="≡" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="✦" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scrapbook"
        options={{
          title: "Scrapbook",
          tabBarLabel: "🎨 Скрап",
          tabBarIcon: ({ focused }) => (
            <Palette
              size={18}
              color={focused ? "#01696f" : "#606060"}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="⊙" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}