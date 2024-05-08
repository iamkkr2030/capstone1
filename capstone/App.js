import React from "react";
import AppNavigator from "./Routes/Router";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";


export default function App() {
  return (
    <NativeBaseProvider>
      <AppNavigator />
    </NativeBaseProvider>
  );
}