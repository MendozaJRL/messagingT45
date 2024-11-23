import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable, Alert, ScrollView, StatusBar, ImageBackground, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import { PermissionsAndroid } from 'react-native'; // For permission handling on Android
import Geolocation from 'react-native-geolocation-service'; // Import Geolocation for location fetching

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true); // State to track network connectivity
  const [location, setLocation] = useState(null); // To store the location data
  const scrollViewRef = useRef();

  // Monitor network connectivity status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected); // Update the state based on network connectivity
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Request location permission for Android
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location to send your current position.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission granted");
        return true;
      } else {
        console.log("Location permission denied");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get the current location of the user
  const getCurrentLocation = () => {
    if (Platform.OS === 'android') {
      // Request permission on Android
      requestLocationPermission().then((granted) => {
        if (granted) {
          fetchLocation();
        } else {
          Alert.alert('Permission Denied', 'You need to grant location permission to use this feature.');
        }
      });
    } else {
      // For iOS, we can directly fetch the location
      fetchLocation();
    }
  };

  // Fetch the user's current location
  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        const locationMessage = `Location: Latitude: ${latitude}, Longitude: ${longitude}`;
        setMessages((prevMessages) => [...prevMessages, locationMessage]); // Add location to messages
        Alert.alert('Location', locationMessage); // Show an alert with the location
      },
      (error) => {
        console.log(error);
        Alert.alert('Error', 'Unable to fetch location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Send a message function
  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage('');
    }
  };

  // Function to handle sending an image (placeholder)
  const handleSendImage = () => {
    Alert.alert('Send Image', 'Sending an image...');
  };

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Set the status bar color based on connectivity */}
      <StatusBar
        barStyle={isConnected ? 'dark-content' : 'light-content'} // Change text color based on connectivity
        backgroundColor={isConnected ? 'green' : 'red'} // Set background color to green when connected, red when not
      />

      {/* Image Background for Content Area */}
      <ImageBackground 
        source={{uri: 'https://img.freepik.com/premium-photo/white-wood-wall-with-white-background_1375194-66.jpg?w=900'}} // Replace with your image URL or local asset
        style={styles.contentBackground}
      >
        <View style={styles.content}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Render each message */}
            {messages.map((msg, index) => (
              <Text key={index} style={styles.message}>
                {msg}
              </Text>
            ))}
          </ScrollView>
        </View>
      </ImageBackground>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputMethodEditor}
          placeholder="Input Message Here"
          value={message}
          onChangeText={(text) => setMessage(text)} // Update message as user types
        />
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={handleSendMessage}>
          <Text style={styles.toolbarButtonText}>Send</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={handleSendImage}>
          <Text style={styles.toolbarButtonText}>Image</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={getCurrentLocation}>
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
  contentBackground: {
    flex: 1,
    resizeMode: 'cover', // This makes the image cover the entire area, maintaining aspect ratio
    justifyContent: 'center', // Ensures the children inside are aligned correctly
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end', // Align the content to the bottom
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Optional: Semi-transparent white background for better readability
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
    marginTop: 10,
    marginRight: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8, // Uniform border radius
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
  toolbarButton: {
    flex: 1, // Make each button take up equal space
    paddingVertical: 10,
    marginHorizontal: 5, // Add horizontal margin for spacing
    backgroundColor: 'lightgray',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default App;
