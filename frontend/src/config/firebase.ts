// Firebase configuration for phone authentication
// Note: This is a mock configuration for demonstration purposes
// In production, you would use actual Firebase credentials

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Mock Firebase Auth for demonstration
export const mockFirebaseAuth = {
  signInWithPhoneNumber: async (phoneNumber: string, recaptchaVerifier: any) => {
    console.log('Mock: Sending OTP to', phoneNumber);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      verificationId: 'mock-verification-id-' + Date.now(),
      confirm: async (otp: string) => {
        if (otp === '123456') {
          return {
            user: {
              uid: 'mock-uid-' + Date.now(),
              phoneNumber: phoneNumber,
              getIdToken: async () => 'mock-firebase-token-' + Date.now()
            }
          };
        } else {
          throw new Error('Invalid OTP. Use 123456 for demo.');
        }
      }
    };
  }
};

// Mock RecaptchaVerifier for demonstration
export class MockRecaptchaVerifier {
  constructor(containerId: string, parameters?: any) {
    console.log('Mock RecaptchaVerifier initialized for', containerId);
  }
  
  render() {
    return Promise.resolve('mock-recaptcha-widget-id');
  }
  
  verify() {
    return Promise.resolve('mock-recaptcha-token');
  }
  
  clear() {
    console.log('Mock RecaptchaVerifier cleared');
  }
}

export default firebaseConfig;