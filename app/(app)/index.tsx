import React from "react";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import TextCustom from "../components/TextCustom";
import { useAuth } from "@/context/AuthContext";
import { Link } from 'expo-router';


export default function Index() {

  const {user, session, signout} =useAuth()
  const [input, setInput] = React.useState("");

  return (
    <SafeAreaView>
           <TouchableOpacity 
            style={styles.button} 
            onPress={signout}
            >
            <Text style={styles.buttonText}>SignOut</Text>
        </TouchableOpacity>
        {session && ( <View style={styles.container}>
           <TextCustom fontSize={22}>Hello {user.name}!</TextCustom>
            <View style={styles.container}>
              <Text style={styles.text}> This app will help you stay up to date on current cyber incidents. It allows you to create, edit, and delete alerts, set status updates, and prioritize incident severity.</Text>
       {/*You can include the incident functionalies inside the index.tsx or you can create a separe screen and access via a link as below*/}
      <Link href="../incident" style={styles.button}>
      <Text style={styles.buttonText}>Access your To-Dos</Text>
    </Link>
     </View>
    
        </View>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    paddingHorizontal:20,

  },
  headline:{
    paddingVertical:20
  },
    button: {
      backgroundColor: 'black',
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      margin:20,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
    },
    text: {
      color: 'black',
      textAlign:'justify',
      fontSize: 15,
    },
    main: {
      flex: 1,
      gap: 2,
      justifyContent: "center",
      alignItems: "center",
      maxWidth: 640,
      paddingHorizontal: 24,
      paddingVertical:200,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 24,
    },
    separator: {
      marginVertical: 90,
      height: 1,
      width: "80%",
    }
})