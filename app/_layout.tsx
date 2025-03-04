import { Slot } from "expo-router";
import {AuthProvider} from '../context/AuthContext'
import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
const createDbIfNeeded = async (db: SQLiteDatabase) => {
  //
  console.log("Creating database");
  try {
    // Create a table
    const response = await db.execAsync(
      "CREATE TABLE IF NOT EXISTS incident_alert (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, completed BOOLEAN)"
    );
  } catch (error) {
    console.error("Error creating database:", error);
  }
};

export default function RootLayout() {
  return (
    <>
<AuthProvider> 

      <SQLiteProvider databaseName="to-dos.db" onInit={createDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(app)" options={{ title:'',headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="addtodo"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="auto" />
      </AuthProvider>
    </>
  );
}
