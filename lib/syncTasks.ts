import { useSQLiteContext } from "expo-sqlite";
import { Databases, ID, Account } from "appwrite";
import { client } from "../lib/appwriteConfig"; // Ensure Appwrite is correctly configured

const databases = new Databases(client);
const account = new Account(client);

export async function syncTasks() {
  const database = useSQLiteContext();

  try {
    // Get the currently authenticated Appwrite user
    const user = await account.get();
    const userId = user.$id;

    // Get local tasks missing an Appwrite ID
    const localTasks = await database.getAllAsync<{
      id: number;
      name: string;
      description: string;
      completed: boolean;
      appwrite_id?: string;
    }>("SELECT * FROM tasks WHERE appwrite_id IS NULL");

    for (const task of localTasks) {
      // Create document in Appwrite
      const response = await databases.createDocument(
        "67c608ad00050388e083", // Your Appwrite Database ID
        "tasks",               // Your Appwrite Collection ID
        ID.unique(),
        {
          name: task.name,
          description: task.description,
          completed: task.completed,
          user_id: userId, // Example field for referencing the user
        }
      );

      // Update local row with the new document ID
      await database.runAsync(
        "UPDATE tasks SET appwrite_id = ? WHERE id = ?",
        [response.$id, task.id]
      );
    }

    console.log("✅ Sync complete. Newly created tasks have Appwrite IDs.");
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}
