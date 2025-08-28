import { Text, TouchableOpacity, View } from "react-native";
import {Image} from "expo-image";
import { Link } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function Index() {

  const {user, token, checkAuth, logout} = useAuthStore();

  useEffect( () => {
    checkAuth();
  }, []);

  console.log("User:", user);
  console.log("Token:", token);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>hello {user?.username}</Text>
      <Text>token {token}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <Link href="/(auth)">Login </Link>
      <Link href="/signup">Sign up </Link>
    </View>
  );
}
