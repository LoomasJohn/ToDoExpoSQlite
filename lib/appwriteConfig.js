import { Client, Account, Databases, ID } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT) // ✅ Set API Endpoint
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID); // ✅ Set Project ID

const account = new Account(client);
const databases = new Databases(client); // ✅ Added Databases instance for CRUD

export { client, account, databases, ID };
