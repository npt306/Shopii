const axios = require('axios');

// Configuration - REPLACE THESE VALUES WITH YOUR ACTUAL VALUES
const config = {
  keycloakBaseUrl: 'http://localhost:8080', // Replace with your Keycloak URL
  realm: 'shopii', // Replace with your realm name
  clientId: 'shopii-client', // Replace with your client ID
  clientSecret: 'aYwjqEtB31gmvTfaWNVMqeVsSy2dq7aP', // Replace with your client secret
  adminUsername: 'realadmin', // Replace with admin username
  adminPassword: 'admin', // Replace with admin password
  adminClientId: 'admin-cli',
  testUsername: 'multirole2@example.com', // Replace with a test user's username
  testPassword: 'test', // Replace with the test user's password
  testEmail: 'multirole2@example.com' // Replace with the test user's email
};

// 1. Test direct user login
async function testDirectLogin(username, password) {
  console.log('\n--- TESTING DIRECT USER LOGIN ---');
  console.log(`Attempting to login with username: ${username}`);
  
  const url = `${config.keycloakBaseUrl}/realms/${config.realm}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', config.clientId);
  params.append('client_secret', config.clientSecret);
  params.append('username', username);
  params.append('password', password);
  
  try {
    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('✅ LOGIN SUCCESSFUL');
    console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
    return response.data;
  } catch (error) {
    console.log('❌ LOGIN FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// 2. Test admin token retrieval
async function testAdminToken() {
  console.log('\n--- TESTING ADMIN TOKEN RETRIEVAL ---');
  
  const url = `${config.keycloakBaseUrl}/realms/master/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', config.adminClientId);
  params.append('username', config.adminUsername);
  params.append('password', config.adminPassword);
  
  try {
    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('✅ ADMIN TOKEN RETRIEVAL SUCCESSFUL');
    console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
    return response.data.access_token;
  } catch (error) {
    console.log('❌ ADMIN TOKEN RETRIEVAL FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testDirectLoginWithScope(username, password) {
    console.log('\n--- TESTING DIRECT USER LOGIN WITH OPENID SCOPE ---');
    console.log(`Attempting to login with username: ${username}`);
    
    const url = `${config.keycloakBaseUrl}/realms/${config.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('username', username);
    params.append('password', password);
    params.append('scope', 'openid');
    
    try {
      const response = await axios.post(url, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      console.log('✅ LOGIN SUCCESSFUL');
      console.log('Access Token:', response.data.access_token.substring(0, 20) + '...');
      return response.data;
    } catch (error) {
      console.log('❌ LOGIN FAILED');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
      return null;
    }
  }

// 3. Test looking up a user by email
async function testLookupUserByEmail(email, adminToken) {
  console.log('\n--- TESTING USER LOOKUP BY EMAIL ---');
  console.log(`Looking up user with email: ${email}`);
  
  if (!adminToken) {
    console.log('❌ SKIPPED: No admin token available');
    return null;
  }
  
  const url = `${config.keycloakBaseUrl}/admin/realms/${config.realm}/users?email=${encodeURIComponent(email)}`;
  
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data && response.data.length > 0) {
      console.log('✅ USER FOUND');
      console.log('User details:', {
        id: response.data[0].id,
        username: response.data[0].username,
        email: response.data[0].email,
        enabled: response.data[0].enabled
      });
      return response.data[0];
    } else {
      console.log('❌ USER NOT FOUND');
      return null;
    }
  } catch (error) {
    console.log('❌ USER LOOKUP FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// 4. Test client configuration
async function testClientConfiguration(adminToken) {
  console.log('\n--- TESTING CLIENT CONFIGURATION ---');
  console.log(`Checking client: ${config.clientId}`);
  
  if (!adminToken) {
    console.log('❌ SKIPPED: No admin token available');
    return null;
  }
  
  const url = `${config.keycloakBaseUrl}/admin/realms/${config.realm}/clients?clientId=${encodeURIComponent(config.clientId)}`;
  
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data && response.data.length > 0) {
      const client = response.data[0];
      console.log('✅ CLIENT FOUND');
      console.log('Client settings:', {
        id: client.id,
        clientId: client.clientId,
        publicClient: client.publicClient,
        directAccessGrantsEnabled: client.directAccessGrantsEnabled,
        serviceAccountsEnabled: client.serviceAccountsEnabled
      });
      
      // Check if client has directAccessGrantsEnabled
      if (!client.directAccessGrantsEnabled) {
        console.log('⚠️ WARNING: Direct Access Grants not enabled for this client');
        console.log('This is required for password-based login. Enable it in Keycloak admin console.');
      }
      
      // Check if client is confidential but no secret provided
      if (!client.publicClient && !config.clientSecret) {
        console.log('⚠️ WARNING: Client is confidential but no client secret provided');
      }
      
      return client;
    } else {
      console.log('❌ CLIENT NOT FOUND');
      return null;
    }
  } catch (error) {
    console.log('❌ CLIENT LOOKUP FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=== KEYCLOAK AUTHENTICATION DEBUG TESTS ===');
  console.log('Keycloak URL:', config.keycloakBaseUrl);
  console.log('Realm:', config.realm);
  console.log('Client ID:', config.clientId);
  
  // Test direct login with username
  await testDirectLogin(config.testUsername, config.testPassword);
  
  // Get admin token
  const adminToken = await testAdminToken();
  
  // If we got an admin token, run additional tests
  if (adminToken) {
    // Test user lookup by email
    const user = await testLookupUserByEmail(config.testEmail, adminToken);
    
    // If we found the user, try logging in with the actual username
    if (user) {
      console.log('\n--- TESTING LOGIN WITH LOOKED-UP USERNAME ---');
      await testDirectLogin(user.username, config.testPassword);
    }
    
    // Test client configuration
    await testClientConfiguration(adminToken);
    await testDirectLoginWithScope(config.testUsername, config.testPassword);
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Execute the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
});