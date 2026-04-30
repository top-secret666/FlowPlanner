/// <reference types="nativewind/types" />
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { Task, TaskPriority } from "@/types/Task";

interface TaskRowProps {
  task: Task;
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
}

/** Priority dot colour map. */
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#6b7280",
};

/**
 * A single task row in the task list.
 * Shows priority indicator, title, due date, and a completion tap target.
 */
export function TaskRow({
  task,
  onComplete,
  onPress,
}: TaskRowProps): React.JSX.Element {
  const priorityColor = PRIORITY_COLORS[task.priority];
  const isCompleted = task.status === "completed";

  return (
    <TouchableOpacity
      onPress={() => onPress(task.id)}
      activeOpacity={0.7}
      className="flex-row items-center bg-surface-raised rounded-2xl px-4 py-3 mb-2"
    >
      {/* Completion toggle */}
      <TouchableOpacity
        onPress={() => onComplete(task.id)}
        className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
        style={{ borderColor: isCompleted ? "#01696f" : "#606060" }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && (
          <View className="w-2.5 h-2.5 rounded-full bg-teal" />
        )}
      </TouchableOpacity>

      {/* Priority dot */}
      <View
        className="w-2 h-2 rounded-full mr-3"
        style={{ backgroundColor: priorityColor }}
      />

      {/* Task info */}
      <View className="flex-1">
        <Text
          className={`text-sm font-inter-medium ${
            isCompleted ? "text-text-muted line-through" : "text-text-primary"
          }`}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        {task.dueDate !== null && (
          <Text className="text-text-muted text-xs font-inter mt-0.5">
            Due {task.dueDate}
          </Text>
        )}
      </View>

      {/* Duration pill */}
      {task.estimatedMinutes > 0 && (
        <View className="bg-surface-elevated rounded-pill px-2 py-0.5">
          <Text className="text-text-muted text-xs font-inter">
            {task.estimatedMinutes}m
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}