/// <reference types="nativewind/types" />
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskViewModel } from "@/hooks/useTaskViewModel";
import { TaskRow } from "@/components/TaskRow";
import { TealButton } from "@/components/TealButton";
import { EmptyState } from "@/components/EmptyState";
import type { TaskPriority } from "@/types/Task";

const PRIORITY_OPTIONS: TaskPriority[] = ["urgent", "high", "medium", "low"];

/**
 * Tasks Screen – shows all tasks grouped by pending/completed,
 * with a modal to quickly add new tasks.
 */
export default function TasksScreen(): React.JSX.Element {
  const { tasks, isLoading, pendingTasks, createTask, completeTask } =
    useTaskViewModel();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("30");

  const completedTasks = tasks.filter((t) => t.status === "completed");

  /**
   * Submits the new task form.
   */
  const handleAddTask = async (): Promise<void> => {
    if (newTitle.trim().length === 0) return;

    await createTask({
      title: newTitle.trim(),
      description: "",
      priority: newPriority,
      status: "pending",
      dueDate: null,
      scheduledAt: null,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 30,
      tags: [],
    });

    setNewTitle("");
    setNewPriority("medium");
    setEstimatedMinutes("30");
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-3">
          <Text className="text-text-primary text-2xl font-inter-bold">
            Tasks
          </Text>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="bg-teal rounded-xl w-9 h-9 items-center justify-center"
          >
            <Text className="text-white text-xl font-inter-bold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Pending */}
        <Text className="text-text-muted text-xs font-inter-medium uppercase tracking-wider mb-2">
          Pending · {pendingTasks.length}
        </Text>

        {pendingTasks.length === 0 ? (
          <EmptyState
            title="No pending tasks"
            subtitle="Tap + to add your first task"
          />
        ) : (
          pendingTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={(id) => void completeTask(id)}
              onPress={() => {}}
            />
          ))
        )}

        {/* Completed */}
        {completedTasks.length > 0 && (
          <>
            <Text className="text-text-muted text-xs font-inter-medium uppercase tracking-wider mt-5 mb-2">
              Completed · {completedTasks.length}
            </Text>
            {completedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={(id) => void completeTask(id)}
                onPress={() => {}}
              />
            ))}
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface-raised rounded-t-3xl p-5">
            <Text className="text-text-primary text-lg font-inter-semibold mb-4">
              New Task
            </Text>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Task title..."
              placeholderTextColor="#606060"
              className="bg-surface-elevated rounded-xl px-4 py-3 text-text-primary font-inter text-sm mb-3"
            />

            {/* Priority selector */}
            <Text className="text-text-muted text-xs font-inter mb-2">
              Priority
            </Text>
            <View className="flex-row gap-2 mb-3">
              {PRIORITY_OPTIONS.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  onPress={() => setNewPriority(priority)}
                  className={`flex-1 rounded-xl py-2 items-center ${
                    newPriority === priority
                      ? "bg-teal"
                      : "bg-surface-elevated"
                  }`}
                >
                  <Text
                    className={`text-xs font-inter-medium capitalize ${
                      newPriority === priority
                        ? "text-white"
                        : "text-text-secondary"
                    }`}
                  >
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration */}
            <Text className="text-text-muted text-xs font-inter mb-2">
              Estimated minutes
            </Text>
            <TextInput
              value={estimatedMinutes}
              onChangeText={setEstimatedMinutes}
              keyboardType="number-pad"
              placeholderTextColor="#606060"
              className="bg-surface-elevated rounded-xl px-4 py-3 text-text-primary font-inter text-sm mb-4"
            />

            <TealButton
              label="Add Task"
              onPress={() => void handleAddTask()}
              isLoading={isLoading}
            />
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="mt-3 items-center"
            >
              <Text className="text-text-muted font-inter text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}