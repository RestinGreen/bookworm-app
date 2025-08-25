import { Text, View } from "react-native";
import {Image} from "expo-image";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>hello</Text>
      <Link href="/(auth)">Login </Link>
      <Link href="/signup">Sign up </Link>
    </View>
  );
}
