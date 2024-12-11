import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable, Alert, ScrollView, StatusBar, ImageBackground, Platform, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [location, setLocation] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = () => {
    if (Platform.OS === 'android') {
      requestLocationPermission().then((granted) => {
        if (granted) fetchLocation();
        else Alert.alert('Permission Denied', 'Location permission is required.');
      });
    } else {
      fetchLocation();
    }
  };

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        fetchAddress(latitude, longitude);
        setMessages((prevMessages) => [...prevMessages, `Location: Latitude: ${latitude}, Longitude: ${longitude}`]);
        Alert.alert('Location', `Latitude: ${latitude}, Longitude: ${longitude}`);
      },
      (error) => {
        console.log(error);
        Alert.alert('Error', `Unable to fetch location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );
  };

  const fetchAddress = (latitude, longitude) => {
    const apiKey = 'c8ff929c62bc421497d843a18b27c5ec';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    axios.get(url)
      .then((response) => {
        const results = response.data.results;
        if (results.length > 0) {
          const address = results[0].formatted;
          const mapUrl = generateStaticMapUrl(latitude, longitude);
          setMessages((prevMessages) => [...prevMessages, `Address: ${address}`, mapUrl]);
          Alert.alert('Address', address);
        } else {
          Alert.alert('Error', 'Unable to fetch address.');
        }
      })
      .catch((error) => {
        console.log("Error fetching address:", error);
        Alert.alert('Error', 'Unable to fetch address from OpenCage API.');
      });
  };

  const generateStaticMapUrl = (latitude, longitude) => {
    return `https://staticmap.openstreetmap.org/cgi-bin/mapgen.cgi?center=${latitude},${longitude}&zoom=15&size=400x400&maptype=mapnik&markers=${latitude},${longitude}`;
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage('');
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isConnected ? 'dark-content' : 'light-content'} backgroundColor={isConnected ? '#FFC1CC' : '#D32F2F'} />

      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/originals/a1/4f/d7/a14fd7d08e79d5231ea593bf2268cf79.jpg' }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {messages.map((msg, index) => {
              if (msg.startsWith("http")) {
                return (
                  <View key={index} style={styles.mapContainer}>
                    <Image source={{ uri: msg }} style={styles.mapImage} />
                  </View>
                );
              }
              return <Text key={index} style={styles.message}>{msg}</Text>;
            })}
          </ScrollView>
        </View>
      </ImageBackground>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Type a message..."
          placeholderTextColor="#FFB6C1"
          value={message}
          onChangeText={setMessage}
        />
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={handleSendMessage}>
          <Text style={styles.toolbarButtonText}>Send</Text>
        </Pressable>
        <Pressable style={styles.toolbarButton} onPress={() => Alert.alert('Send Image', 'Sending an image...')}>
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
    backgroundColor: '#FFE4E9',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 240, 245, 0.8)',
  },
  messageContainer: {
    padding: 10,
  },
  scrollContent: {
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
  },
  message: {
    padding: 12,
    backgroundColor: '#FFC1CC',
    color: '#333333',
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mapImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF0F5',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#FFE4E9',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    color: '#333333',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#FFC1CC',
  },
  toolbarButton: {
    padding: 10,
    backgroundColor: '#FFB6C1',
    borderRadius: 5,
  },
  toolbarButtonText: {
    color: '#333333',
    fontSize: 16,
  },
});

export default App;
