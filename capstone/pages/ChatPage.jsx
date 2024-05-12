import React, { useState, useEffect,useRef } from "react";
import { View, Text, Button } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import io from "socket.io-client";
import ImagePicker from 'react-native-image-picker';
import { launchImageLibrary } from 'react-native-image-picker';

const Chat = ({ route }) => {
  const { user, partner } = route.params;
  const [messages, setMessages] = useState([]);
  const isMounted = useRef(true);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000");  // Connect to the server
    socket.current.on("receive message", message => {
      if (isMounted.current) {
        setMessages((prevMessages) => GiftedChat.append(prevMessages, [message]));
      }
    });

    return () => {
      socket.current.disconnect();
      isMounted.current = false;
    };
  }, []);

  const onSend = (newMessages = []) => {
    newMessages.forEach(message => {
        if (message.image) {
            socket.current.emit('send image', { image: message.image });
        } else {
            socket.current.emit('send message', message.text);
        }
    });
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
};

const handleAddImage = () => {
  const options = {
      mediaType: 'photo',
      quality: 1,
  };

  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
        console.log('User cancelled image picker');
    } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        const imageMessage = {
            _id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            user: { _id: 1 },
            image: source.uri,
        };
        onSend([imageMessage]);
    }
});
};
  // 말풍선 스타일을 조정하는 함수
  const renderBubble = (props) => {
    return (
      <View>
      <Text style={{ fontSize: 15, color: props.position === 'left' ? 'black' : 'black', paddingHorizontal: 5, paddingVertical: 2, textAlign: props.position === 'left' ? 'left' : 'right' }}>
        {props.position === 'left' ? partner : user}
      </Text>
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            padding: 10, // 왼쪽 말풍선의 padding
            backgroundColor: "#96e0ad", // 왼쪽 말풍선 배경색
          },
          right: {
            padding: 10, // 오른쪽 말풍선의 padding
            backgroundColor: "#0084ff", // 오른쪽 말풍선 배경색
          },
        }}
        textStyle={{
          left: {
            color: '#fff', // 왼쪽 말풍선의 글씨 색상을 흰색으로 설정
          },
          right: {
            color: '#fff', // 오른쪽 말풍선의 글씨 색상을 흰색으로 유지
          },
        }}
        timeTextStyle={{
          left: {
            color: '#fff', // 왼쪽 말풍선의 시간 글씨 색상을 흰색으로 설정
          },
          right: {
            color: '#fff', // 오른쪽 말풍선의 시간 글씨 색상을 흰색으로 유지
          },
        }}
      />
    </View>
    );
  };
  
  return (
        <View style={{ flex: 1 }}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                renderBubble={renderBubble}
                user={{
                    _id: 1, // Static user ID for demo purposes
                }}
            />
            <Button title="Add Image" onPress={handleAddImage} />
        </View>
    );
};

export default Chat;
