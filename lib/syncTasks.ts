import { useSQLiteContext } from "expo-sqlite";
import { Databases, ID, Account } from "appwrite";
import { client } from "../lib/appwriteConfig"; // Ensure Appwrite is correctly configured

const databases = new Databases(client);
const account = new Account(client); // ✅ Create an Account instance

export async function syncTasks() {
  const database = useSQLiteContext();

  try {
    // ✅ Fetch the authenticated user from Appwrite
    const user = await account.get();
    const userId = user.$id; // ✅ Assign the user's Appwrite ID

    // Get all local tasks that don't have an Appwrite ID
    const localTasks: { id: number; name: string; description: string; completed: boolean }[] =
      await database.getAllAsync("SELECT * FROM tasks WHERE appwrite_id IS NULL");

    for (const task of localTasks) {
      // Create task in Appwrite
      const response: { $id: string } = await databases.createDocument(
        "67c608ad00050388e083",
        "tasks",
        ID.unique(),
        {
          name: task.name,
          description: task.description,
          completed: task.completed,
          user_id: userId, // ✅ Now `userId` is defined
        },
        [] // Empty permissions array (required by Appwrite)
      );

      // Store Appwrite ID in SQLite
      await database.runAsync(
        "UPDATE tasks SET appwrite_id = ? WHERE id = ?",
        [response.$id, task.id]
      );
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
