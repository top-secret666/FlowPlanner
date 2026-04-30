/// <reference types="nativewind/types" />
import React from "react";
import { View, Text } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

/**
 * Generic empty state component displayed when a list has no items.
 */
export function EmptyState({
  title,
  subtitle,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <Text className="text-text-secondary font-inter-medium text-base text-center">
        {title}
      </Text>
      {subtitle !== undefined && (
        <Text className="text-text-muted font-inter text-sm text-center mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}