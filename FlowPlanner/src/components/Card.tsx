/// <reference types="nativewind/types" />
import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Extra padding variant */
  variant?: "default" | "compact";
}

/**
 * Base card component with rounded corners and dark surface background.
 * Used as a container for all content blocks in the app.
 */
export function Card({
  children,
  variant = "default",
  className,
  ...rest
}: CardProps): React.JSX.Element {
  const padding = variant === "compact" ? "p-3" : "p-4";

  return (
    <View
      className={`bg-surface-raised rounded-2xl ${padding} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </View>
  );
}