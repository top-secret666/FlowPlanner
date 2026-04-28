/// <reference types="nativewind/types" />
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface TealButtonProps extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: "filled" | "outline" | "ghost";
}

/**
 * Primary action button using the teal accent colour.
 * Supports filled, outline, and ghost variants.
 */
export function TealButton({
  label,
  isLoading = false,
  variant = "filled",
  disabled,
  className,
  ...rest
}: TealButtonProps): React.JSX.Element {
  const baseClasses = "rounded-xl px-5 py-3 items-center justify-center flex-row";

  const variantClasses =
    variant === "filled"
      ? "bg-teal"
      : variant === "outline"
      ? "border border-teal bg-transparent"
      : "bg-transparent";

  const textClasses =
    variant === "filled"
      ? "text-white font-inter-semibold text-sm"
      : "text-teal font-inter-semibold text-sm";

  const opacityClass = disabled || isLoading ? "opacity-50" : "opacity-100";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses} ${opacityClass} ${className ?? ""}`}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "filled" ? "#ffffff" : "#01696f"}
        />
      ) : (
        <Text className={textClasses}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}