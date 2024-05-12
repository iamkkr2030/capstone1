import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Box, HStack, Icon, IconButton, StatusBar, Text, Button, KeyboardAvoidingView, Center, VStack, Heading, Input, useToast, Spinner } from "native-base";
import { Platform, View, StyleSheet } from "react-native";
import io from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = io('http://localhost:3000');

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

const useSocket = () => {
  return useContext(SocketContext);
};

function AppBar_Home() {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar bg="#3700B3" barStyle="light-content" />
      <Box safeAreaTop />
      <HStack style={styles.header}>
        <Text color="white" fontSize="20" fontWeight="bold"></Text>
        <IconButton
          icon={<Icon size="md" as={MaterialIcons} name="settings" color="black" />}
          onPress={() => navigation.navigate("Setting")}
        />
      </HStack>
    </>
  );
}

function HomePage() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const toast = useToast();
  const socket = useSocket();
  const isMounted = useRef(true);
  const navigation = useNavigation();
  let intervalId = null;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleMatch = (data) => {
      if (isMounted.current) {
        setIsLoading(false);
        setTimer(0);
        clearInterval(intervalId);
        if (nickname) {
          navigation.navigate('Chat', { user: nickname, partner: data.nickname });
        }
      }
    };

    socket.on('match', handleMatch);

    return () => {
      socket.off('match', handleMatch);
    };
  }, [nickname, navigation, socket]);

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
        if (isMounted.current) {
          setTimer((prevTimer) => prevTimer + 1);
        }
      }, 1000);
      setTimeout(() => {
        clearInterval(intervalId);
        if (isMounted.current && isLoading) {
          setIsLoading(false);
          setTimer(0);
        }
      }, 60000);
    }
  };

  const cancelMatch = () => {
    setIsLoading(false);
    setTimer(0);
    clearInterval(intervalId);
    // 여기서 홈 페이지 또는 첫 번째 페이지로 네비게이션
    navigation.popToTop(); // 스택의 첫 번째 스크린으로 돌아갑니다
  };

  return (
    <View style={{ flex: 1 }}>
      <AppBar_Home />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Center>
            <VStack space="3" style={styles.innerContainer}>
              <Heading mb="3">Welcome to MAET!</Heading>
              <Text color="muted.400">
                Enter your nickname and start chatting right away. Everyone is waiting to meet you!
              </Text>
              <Input
                placeholder="Enter your nickname"
                mt="10"
                mb="4"
                value={nickname}
                onChangeText={setNickname}
              />
              <Button mb="4" onPress={gotoChatPage} isLoading={isLoading}>
                Go To Chat!
              </Button>
              {isLoading && (
                <Center>
                  <Spinner size="lg" />
                  <Text fontSize="lg">{timer} seconds</Text>
                  <Button mb="4" onPress={cancelMatch}>
                    Cancel Match!
                  </Button>
                </Center>
              )}
            </VStack>
          </Center>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    px: 1, py: 3,
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

export default function App() {
  return (
    <SocketProvider>
      <HomePage />
    </SocketProvider>
  );
}

