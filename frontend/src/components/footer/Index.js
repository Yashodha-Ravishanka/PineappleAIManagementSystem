import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

export default function Footer() {
  const navigation = useNavigation();
  return (
    <View
      style={{
        backgroundColor: "#ffffffff",
        opacity: 0.9,
        height: 70,
        width: "100%",
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "row",
        paddingLeft: 25,
        paddingRight: 25,
      }}
    >
      <TouchableOpacity onPress={() => navigation.navigate("QRScanner")}>
        <FontAwesome
          name="qrcode"
          size={25}
          color={"black"}
          style={{ marginLeft: "auto", paddingRight: 5 }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("GoogleMap")}>
        <FontAwesome
          name="home"
          size={25}
          color={"black"}
          style={{ marginLeft: "auto", paddingRight: 5 }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("NewForm")}>
        <FontAwesome
          name="plus-square-o"
          size={25}
          color={"black"}
          style={{ marginLeft: "auto", paddingRight: 5 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({});
