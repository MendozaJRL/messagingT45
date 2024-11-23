import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable, Alert, ScrollView } from 'react-native';

const App = () => {
  // State to store the array of messages
  const [messages, setMessages] = useState([]);
  // State to store the current input message
  const [message, setMessage] = useState('');

  // Reference to the ScrollView to scroll to bottom when new message is added
  const scrollViewRef = useRef();

  // Function to handle sending the message
  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, message]); // Append the new message to the messages array
      setMessage(''); // Clear the input field after sending
    }
  };

  // Function to handle sending an image (placeholder)
  const handleSendImage = () => {
    Alert.alert('Send Image', 'Sending an image...');
  };

  // Function to handle sending location (placeholder)
  const handleSendLocation = () => {
    Alert.alert('Send Location', 'Sending location...');
  };

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Render each message in the messages array */}
          {messages.map((msg, index) => (
            <Text key={index} style={styles.message}>
              {msg}
            </Text>
          ))}
        </ScrollView>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputMethodEditor}
          placeholder="Type something..."
          value={message}
          onChangeText={(text) => setMessage(text)} // Update message as user types
        />
      </View>
      <View style={styles.toolbar}>
        <Pressable style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={handleSendImage}>
          <Text style={styles.toolbarButtonText}>Image</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={handleSendLocation}>
          <Text style={styles.toolbarButtonText}>Location</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginRight: 10,
    justifyContent: 'flex-end', // Align the content to the bottom
  },
  messageContainer: {
    width: '100%',
  },
  scrollContent: {
    flexDirection: 'column-reverse', // Reverse the message order
    alignItems: 'flex-end', // Align messages to the right
  },
  message: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    alignSelf: 'flex-end', // Align each message to the right
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10, // Space between input and toolbar
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
  toolbarButton: {
    backgroundColor: 'lightgray',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  toolbarButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default App;
