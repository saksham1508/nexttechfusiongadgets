// Status check script
const axios = require('axios');

async function checkStatus() {
  console.log('🔍 Checking Application Status...\n');

  // Check Backend
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend: Running on port 5000');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Database: ${response.data.database}`);
  } catch (error) {
    console.log('❌ Backend: Not running on port 5000');
    console.log('   Run: cd backend && npm run dev');
  }

  // Check Frontend
  try {
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Frontend: Running on port 3000');
  } catch (error) {
    console.log('❌ Frontend: Not running on port 3000');
    console.log('   Run: cd frontend && npm start');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Check Console tab - should see fewer errors');
  console.log('4. Test registration/login functionality');
  console.log('5. Test cart operations after login');
  
  console.log('\n📋 What to Look For:');
  console.log('✅ No Chrome extension errors');
  console.log('✅ No DOM autocomplete warnings');
  console.log('✅ No setInterval performance warnings');
  console.log('✅ Better error messages for 401/409 responses');
  console.log('✅ Smooth cart operations after login');
}

checkStatus().catch(console.error);