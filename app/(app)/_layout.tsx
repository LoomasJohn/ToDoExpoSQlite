import {Slot, Redirect, Tabs} from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import FontAwesome from "@expo/vector-icons/FontAwesome";
/* 
If a user tries to access a protected page without being logged in, they are redirected to the sign-in page.
If there is no session (!session is true), the user is redirected to the /signin page.

If there is a session (!session is false), the <Slot/> component is rendered, allowing the user to access the protected content.
If the user is logged in, they can access the content rendered by <Slot/>.
options={{ headerShown: false }}
*/
export default function AppLayout(){
    const {session} = useAuth()
    return ( <>{!session ? ( <Redirect  href="../signin"/> ) : (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false ,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
    )
  }
    </>
    
  );
}