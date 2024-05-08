import { MaterialIcons } from "@expo/vector-icons";
import {
  Box,
  HStack,
  Icon,
  IconButton,
  StatusBar,
  Text,
  Button,
  KeyboardAvoidingView,
  Center,
  VStack,
  Heading,
  Input,
  useToast,
  Spinner
} from "native-base";
import React, { useState,useEffect } from "react";
import { Platform, View, StyleSheet } from "react-native";
import io from 'socket.io-client';

// 상단 앱 바 컴포넌트
function AppBar_Home({ navigation }) {
  // 상태바 및 설정 버튼을 포함한 헤더 표시
  return (
    <>
      <StatusBar bg="#3700B3" barStyle="light-content" />
      <Box safeAreaTop />
      <HStack style={styles.header}>
        <Text color="white" fontSize="20" fontWeight="bold"></Text>
        <IconButton
          icon={
            <Icon size="md" as={MaterialIcons} name="settings" color="black" />
          }
          onPress={() => navigation.navigate("Setting")}
        />
      </HStack>
    </>
  );
}

// 홈 페이지 컴포넌트
function HomePage({ navigation }) {
  const [nickname, setNickname] = useState(""); // 닉네임 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const toast = useToast(); // 토스트 메시지 기능 활용
  const socket = io('http://localhost:3000');
  let intervalId = null;

  useEffect(() => {
    // 매칭 결과 수신 대기
    const handleMatch = (data) => {
      setIsLoading(false);
      setTimer(0);
      clearInterval(intervalId);
      if (nickname) { // 마운트 상태를 확인하는 추가적인 방어 로직
        alert("Match Found!", `You are now matched with ${data.nickname}`);
        navigation.navigate('Chat', { user: nickname, partner: data.nickname });
      }
    };

    socket.on('match', handleMatch);

    return () => {
      socket.off('match', handleMatch);
      socket.disconnect(); // 언마운트 시 소켓 연결 해제
    };
  }, [nickname,navigation]);
  // 채팅 페이지로 이동 처리 함수
  const gotoChatPage = () => {
    if (!nickname) {
      toast.show({
        title: "Please enter your nickname!",
        status: "warning",
        color: "red",
        duration: 2000,
      });
    } else {
      setIsLoading(true);
      socket.emit('nickname', { nickname });
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      setTimeout(() => {
        clearInterval(intervalId);
        if (isLoading) {
          setIsLoading(false);
          setTimer(0);
        }
      }, 60000);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppBar_Home navigation={navigation} />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // 플랫폼에 따른 키보드 회피 동작 설정
          style={styles.keyboardView}
        >
          <Center>
            <VStack space="3" style={styles.innerContainer}>
              <Heading mb="3">Welcome to MAET!</Heading>
              <Text color="muted.400">
                MAET is a nickname-based chat app! Enter your nickname and start
                chatting right away. Everyone is waiting to meet you!
              </Text>
              <Input
                placeholder="Enter your nickname"
                mt="10"
                mb="4"
                value={nickname}
                onChangeText={setNickname} // 입력된 텍스트를 닉네임 상태로 설정
              />
              <Button mb="4" onPress={gotoChatPage} isLoading={isLoading}>
                Go To Chat!
              </Button>
              {isLoading && (
                <Center>
                  <Spinner size="lg" />
                  <Text fontSize="lg">{timer} seconds</Text>
                </Center>
              )}
            </VStack>
          </Center>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

// 스타일 정의를 위한 StyleSheet 객체
const styles = StyleSheet.create({
  header: {
    px: 1,
    py: 3,
    justifyContent: "space-between",
    alignItems: "center",
    w: "100%",
  },
  container: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    padding: 16,
  },
  keyboardView: {
    base: "400px",
    lg: "auto",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    w: "100%",
    maxW: "800",
    padding: 2,
  },
});

export default HomePage;
