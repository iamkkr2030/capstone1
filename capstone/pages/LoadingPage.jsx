import React, { useEffect } from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";

function LoadingPage({ navigation }) {
  useEffect(() => {}, []);

  const gotoHomePage = () => {
    navigation.navigate("Home");
  };
  return (
    <View style={styles.container}>
      {/* 이미지 추가 */}
      <TouchableOpacity onPress={()=>{gotoHomePage();}}>
        <Image
          source={require("../assets/images/logoText.png")} // 이미지 파일의 경로를 지정합니다.
          style={styles.image}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain", // 이미지를 화면에 맞게 조정합니다.
    marginBottom: 20, // 이미지와 버튼 사이의 간격 조정
    marginLeft: 28,
  },
});

export default LoadingPage;