/*global google*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/header';
import Footer from '../components/footer';
import '../App.css';
import ReCAPTCHA from 'react-google-recaptcha';

const Signup = ({ history }) => {
  const [captchaisdone, setCaptchaisdone] = useState(false);
  const [captchaToken, setcaptchaToken] = useState(''); // Corrected variable name

  const publickey = "6LevtxwpAAAAAFR89iASdG-0bPdUqODMhht_QZRv";
  const [formgoogle, setFormgoogle] = useState({
    email: '',
    name: '',
    picture: '',
  });

  function onchange(token) {
    setCaptchaisdone(true);
    setcaptchaToken(token); // Update the captchaToken state
  }

  const [role, setRole] = useState(0);

  const handleCallbackResponse = async (response) => {
    if (response.credential) {
      const userObject = jwtDecode(response.credential);
 
  
      const email = userObject.email;
  
      if (email) {
        try {
          console.log('Entering try block...');
          const { data } = await axios.post('/api/signup', {
            email: email,
            name:userObject.name,
            picture:userObject.picture,
            role: role || 0,
          });
  
          console.log('Response from server:', data);
  
          if (data.success === true) {
            setFormgoogle({});
            toast.success('Successfully Sign-up!');
            history.push('/Unregisteruser/dashboard');
          }
        } catch (err) {
          console.error('Error in axios.post request:', err);
  
          if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
          }
  
          toast.error(err.response?.data?.error + email);
          console.log(response.credential);
        } finally {
          console.log('Finally block...');
          setFormgoogle({});
        }
      }
    }
  };
  
  useEffect(() => {
    /*global google*/
    google.accounts.id.initialize({
      client_id: "373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });
  
    const signUpButton = document.getElementById("signUp");
    if (signUpButton) {
      google.accounts.id.renderButton(signUpButton, {
        theme: "outline",
        size: "large",
        text: "Sign Up", // 'Text' should be 'text'
      });
    }
  }, [handleCallbackResponse]);
  
  const handleSignUpClick = () => {
    // Perform sign-up logic here
    if (captchaisdone) {
      console.log('Sign Up button clicked!');
      // Additional logic for sign-up...
    } else {
      console.log('Please complete the reCAPTCHA first.');
      // You can show a message to the user or take other actions.
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="register">
          <h2>Sign Up</h2>
          <ReCAPTCHA sitekey={publickey} className="recaptcha" onChange={onchange} />
          {captchaisdone && (
            <div id="signUp" onClick={handleSignUpClick} style={{ cursor: 'pointer' }}>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
