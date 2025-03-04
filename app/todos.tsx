import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Button, Text, Icon } from "react-native-paper";
import { syncTasks } from "../lib/syncTasks"; // Import Sync Logic
import { Databases, ID } from "appwrite";
import { client } from "../lib/appwriteConfig";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const databases = new Databases(client);
const { width } = Dimensions.get("window");

interface TodoItem {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  appwrite_id?: string; // Optional Appwrite ID for syncing
}

export default function TabHome() {
  const [data, setData] = useState<TodoItem[]>([]);
  const database = useSQLiteContext();
  const isNavigating = useRef(false); // Persist across renders to prevent duplicate presses

  useEffect(() => {
    createTable(); // Ensure the table exists
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncTasks(); // Sync local tasks with Appwrite
      loadData(); // Load SQLite data
    }, [])
  );

  const createTable = async () => {
    try {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          appwrite_id TEXT UNIQUE
        );
      `);
      console.warn("✅ SQLite Table 'tasks' is ready.");
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  const loadData = async () => {
    try {
      const tables = await database.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'");
      console.warn("Existing tables in SQLite:", tables);

      const result = await database.getAllAsync<TodoItem>("SELECT * FROM tasks");

      setData(
        result.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          completed: Boolean(item.completed),
          appwrite_id: item.appwrite_id,
        }))
      );
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCompleted = async (taskId: number, appwriteId?: string) => {
    Alert.alert(
      "Complete Task",
      "Are you sure you completed this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await database.runAsync("UPDATE tasks SET completed = 1 WHERE id = ?", [taskId]);

              if (appwriteId) {
                await databases.updateDocument(
                  "67c608ad00050388e083",
                  "tasks",
                  appwriteId,
                  { completed: true }
                );
              }

              setData((prevData) =>
                prevData.map((task) =>
                  task.id === taskId ? { ...task, completed: true } : task
                )
              );
            } catch (error) {
              console.error("Error marking task complete:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ paddingRight: 16, zIndex: 10000 }}>
              <Pressable
                onPress={() => {
                  if (isNavigating.current) return;
                  isNavigating.current = true;

                  console.warn("🚀 Add Task button clicked! Navigating to /addtodo");

                  setTimeout(() => {
                    router.push("/addtodo");
                    isNavigating.current = false;
                  }, 500);
                }}
                style={({ pressed }) => [
                  {
                    padding: 10,
                    backgroundColor: pressed ? "#EDEDED" : "transparent",
                    borderRadius: 50,
                  },
                ]}
              >
                <MaterialCommunityIcons name="plus-circle" size={28} color="#6B21A8" />
              </Pressable>
            </View>
          ),
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerShadowVisible: false,
          headerTitle: "Task List",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#1F2937",
          },
        }}
      />

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon source="account-group" size={50} color="#9CA3AF" />
          <Text variant="titleMedium" style={styles.emptyText}>No To-Dos found</Text>
          <Text variant="bodyMedium" style={styles.emptySubText}>Add a new task to get started</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.userInfo}>
                <Text variant="bodyLarge" style={styles.nameText}>{item.name}</Text>
                <Text variant="bodyMedium" style={styles.detailText}>{item.description}</Text>
              </View>
              <View style={styles.buttonContainer}>
                {!item.completed && (
                  <Button
                    mode="contained"
                    icon="pencil"
                    onPress={() => router.push(`/addtodo?id=${item.id}`)}
                    style={[styles.button, styles.editButton]}
                    labelStyle={styles.buttonText}
                    uppercase={false}
                  >
                    Edit
                  </Button>
                )}

                <Button
                  mode="contained"
                  icon="check"
                  onPress={() => handleCompleted(item.id, item.appwrite_id)}
                  style={[
                    styles.button,
                    styles.completeButton,
                    item.completed && styles.disabledButton,
                  ]}
                  labelStyle={[
                    styles.buttonText,
                    item.completed && styles.disabledButtonText,
                  ]}
                  uppercase={false}
                  disabled={item.completed}
                >
                  Complete
                </Button>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  addButton: { marginRight: 16 },
  listContainer: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nameText: { marginBottom: 4 },
  detailText: { color: "#6B7280" },
  buttonContainer: { flexDirection: "row", gap: 8 },
  editButton: { backgroundColor: "#6886B8FF" },
  completeButton: { backgroundColor: "#198B5DFF" },
  disabledButton: { backgroundColor: "#E5E7EB" },
  disabledButtonText: { color: "#9CA3AF" },

  // **Add the missing styles**
  userInfo: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
});