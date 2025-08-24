// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('REACT_APP_PHONEPE_CLIENT_ID:', process.env.REACT_APP_PHONEPE_CLIENT_ID);

// Check all REACT_APP_ variables
const reactAppVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));
console.log('All REACT_APP_ variables:', reactAppVars);
reactAppVars.forEach(key => {
  console.log(`${key}:`, process.env[key]);
});

export default {};