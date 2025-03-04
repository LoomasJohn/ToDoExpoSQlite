import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { syncTasks } from "../lib/syncTasks"; // Import your sync function

interface TodoItem {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  appwrite_id?: string; // Optional Appwrite sync ID
}

export default function ItemModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const database = useSQLiteContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setEditMode(true);
      loadData();
    }
  }, [id]);

  // Load existing data if we're in "edit" mode
  const loadData = async () => {
    try {
      const result = await database.getFirstAsync<TodoItem>(
        "SELECT * FROM tasks WHERE id = ?",
        [parseInt(id as string, 10)]
      );
      if (result) {
        setName(result.name);
        setDescription(result.description);
      }
    } catch (error) {
      console.error("Error loading item:", error);
      Alert.alert("Error", "Failed to load the Task");
    }
  };

  // Insert a new record into `tasks`
  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await database.runAsync(
        "INSERT INTO tasks (name, description, completed) VALUES (?, ?, 0)",
        [name.trim(), description.trim()]
      );

      console.log("✅ Task added to SQLite. Syncing with Appwrite...");
      await syncTasks(); // Sync newly added task to Appwrite

      // Once saved, navigate back to the todos list
      router.push("/todos");
    } catch (error) {
      console.error("❌ Error saving item:", error);
      Alert.alert("Error", "Failed to save Task");
    }
  };

  // Update an existing record in `tasks`
  const handleUpdate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await database.runAsync(
        "UPDATE tasks SET name = ?, description = ? WHERE id = ?",
        [name.trim(), description.trim(), parseInt(id as string, 10)]
      );

      console.log("Item updated successfully");
      router.back(); // Go back instead of push
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update Task");
    }
  };

  // Delete a record from `tasks`
  const handleDelete = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await database.runAsync(
                "DELETE FROM tasks WHERE id = ?",
                [parseInt(id as string, 10)]
              );

              console.log("Item deleted successfully");
              router.back();
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete task");
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
          title: editMode ? "Edit Task" : "Add Task",
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#1F2937",
          },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          {/* Title field */}
          <TextInput
            label="Title"
            placeholder="Enter Incident Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.textInput}
          />
          {/* Description field */}
          <TextInput
            label="Description"
            placeholder="Enter Incident Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.textInput}
          />
          <TextInput
            label="Incident Type"
            placeholder="Enter Incident Type"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon="plus" color="#6B7280" />}
            style={styles.textInput}
          />
          <TextInput
            label="Severity"
            placeholder="Enter Incident Severity"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon="plus" color="#6B7280" />}
            style={styles.textInput}
          />
          <TextInput
            label="Status"
            placeholder="Enter Current Status"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon="plus" color="#6B7280" />}
            style={styles.textInput}
          />
          <TextInput
            label="Reported By"
            placeholder="Enter Who Reported"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon="plus" color="#6B7280" />}
            style={styles.textInput}
          />
        </View>

        <View style={styles.buttonContainer}>
          {/* Cancel button: just go back */}
          <Button
            mode="contained"
            icon="close"
            onPress={() => router.back()}
            style={[styles.button, styles.cancelButton]}
          >
            Cancel
          </Button>

          {/* Save or Update: depends on editMode */}
          {editMode ? (
            <Button
              mode="contained"
              onPress={handleUpdate}
              style={[styles.button, styles.saveButton]}
            >
              Update Task
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
            >
              Save Task
            </Button>
          )}

          {/* Show Delete button only in edit mode */}
          {editMode && (
            <Button
              mode="contained"
              icon="delete"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
            >
              Delete
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  textInput: {
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
});
