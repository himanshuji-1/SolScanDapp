// App.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { WalletScreen } from "./screen/WalletScreen";
import SwapScreen from "./screen/SwapScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
       screenOptions={{
  headerStyle: { backgroundColor: "#0a0a1a" },
  headerTintColor: "#fff",
}}
      >
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Swap" component={SwapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}