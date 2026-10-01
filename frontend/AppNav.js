import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CaptureImage from "./src/EralyDetection/CaptureImage"; 
import GoogleMap from "./src/gmap/Index";
import { AuthContext } from "./src/context/AuthProvider";
import QRScanner from "./src/qr_scanner/Index";
import NewForm from "./src/insert_data/Index";

const Stack = createNativeStackNavigator();

export default function AppNav() {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="GoogleMap" component={GoogleMap} />
          <Stack.Screen name="QRScanner" component={QRScanner} />
          <Stack.Screen name="NewForm" component={NewForm} />
          
        </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
