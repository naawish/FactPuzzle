// src/config.js
import Constants from 'expo-constants';

// Get the IP address of the machine running Expo
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

const getLocalIp = () => {
  if (debuggerHost) {
    // debuggerHost looks like "192.168.1.50:8081"
    // We split it to get just the IP "192.168.1.50"
    return debuggerHost.split(':')[0];
  }
  
  // Fallback for Android Emulator (10.0.2.2 is localhost for Android)
  return '10.0.2.2'; 
};

const localhost = getLocalIp();

// Construct the URL dynamically
// 3000 is your node server port
export const API_URL = `http://${localhost}:3000`; 

console.log("🔗 Connecting to Server at:", API_URL);