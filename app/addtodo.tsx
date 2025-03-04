import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { syncTasks } from "../lib/syncTasks"; // Import sync function

interface TodoItem {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  appwrite_id?: string; // Optional Appwrite sync ID
}


export default function ItemModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ✅ Fix 2: Get id from params
  const database = useSQLiteContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editMode, setEditMode] = useState(false); // ✅ Fix 3: Declare editMode state

  useEffect(() => {
    if (id) {
      setEditMode(true);
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const result = await database.getFirstAsync<TodoItem>(
      "SELECT * FROM tasks WHERE id = ?",
      [parseInt(id as string)]
    );
    if (result) {
      setName(result.name);
      setDescription(result.description);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    try {
      await database.runAsync(
        `INSERT INTO tasks (name, description, completed) VALUES (?, ?, 0)`,
        [name.trim(), description.trim()]
      );

      console.log("✅ Task added to SQLite. Syncing with Appwrite...");
      await syncTasks(); // 🚀 Sync newly added task to Appwrite

      router.push("/todos"); // ✅ Ensure navigation happens only after sync
    } catch (error) {
      console.error("❌ Error saving item:", error);
      Alert.alert("Error", "Failed to save Task");
    }
  };
  

  const handleUpdate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await database.runAsync(
        `UPDATE tasks SET name = ?, description = ? WHERE id = ?`,
        [name.trim(), description.trim(), parseInt(id as string)]
      );
      console.log("Item updated successfully:", response?.changes);
      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update Task");
    }
  };


  const handleDelete = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await database.runAsync(
                `DELETE FROM tasks WHERE id = ?`,
                [parseInt(id as string)]
              );
              console.log("Item deleted successfully:", response?.changes);
              router.back();
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete task");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: editMode ? "Edit Task" : "Add Task",
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1F2937',
          }
        }} 
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          <TextInput
            label="Task"
            placeholder="Enter Task Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon="plus" color="#6B7280" />}
            style={styles.textInput}
          />
          <TextInput
            label="Description"
            placeholder="Enter Task description"
            value={description}
            autoCapitalize="none"
            onChangeText={setDescription}
            mode="outlined"
            left={<TextInput.Icon icon="star-outline" color="#6B7280" />}
            style={styles.textInput}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            icon="close" 
            onPress={() => router.back()} 
            style={[styles.button, styles.cancelButton]}
          >
            Cancel
          </Button>
          
          <Button
            mode="contained"
            onPress={() => {
              console.warn("🚀 Save Task Button Pressed");
              handleSave();
            }}
          >
            Save Task
          </Button>


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
    backgroundColor: '#F3F4F6',
  },
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  textInput: {
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
});



