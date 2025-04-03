import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { EnvValue } from '../env-value/envValue';

const CallbackPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract code and session_state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const sessionState = urlParams.get('session_state');
        
        console.log("URL parameters:", window.location.search);
        console.log("Received auth code:", code);
        console.log("Session state:", sessionState);
        
        if (!code || !sessionState) {
          throw new Error('Missing authentication parameters');
        }
  
        console.log("Attempting to connect to backend...");
        
        // Send code to backend to exchange for tokens
        const response = await axios.post(
          `${EnvValue.API_GATEWAY_URL}/Users/auth/exchange-token`,
          { code, sessionState },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );
  
        console.log("Backend response received:", response.data);
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.access_token);
        
        // Redirect to home page
        navigate('/home');
      } catch (error: any) {
        console.error('Full error object:', error);
  
        // Check for expired code error
        if (error.response?.data?.message?.includes('expired') || 
            error.response?.data?.message?.includes('already used')) {
          setError('Your login session expired. Please try logging in again.');
          
          // Add a button to redirect back to login
          return (
            <Alert variant="warning">
              <p>Your login session expired. Please try again.</p>
              <Button onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </Alert>
          );
        }
        
        if (error.request && !error.response) {
          console.error('No response received from server - it may be down or unreachable');
          setError('Cannot connect to authentication server. Please try again later.');
        } else {
          setError(error.response?.data?.message || error.message || 'Authentication failed');
        }
      } finally {
        setLoading(false);
      }
    };
  
    handleCallback();
  }, [navigate]);

  return (
    <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
      {loading ? (
        <>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Processing your login...</p>
        </>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          <h4>Authentication Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => navigate('/login')}
          >
            Return to Login
          </button>
        </Alert>
      ) : null}
    </Container>
  );
};

export default CallbackPage;