/*global google*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/header';
import Footer from '../components/footer';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Redirect } from 'react-router-dom/cjs/react-router-dom';

const Login = ({ history }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const publickey = 'YOUR_PUBLIC_KEY'; // Replace with your actual public key
  const [tokenClient, setTokenClient] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCallbackResponse = async (response) => {
    try {
      const userObject = jwtDecode(response.credential);
      setFormData(userObject);
      const token = response.credential;

      // Debugging: Log the received token
    
      console.log('Received Token:', token);

      const { data } = await axios.post('/api/login', {
        email: userObject.email,
        token: token,
      });

      if (data.success === true) {
        const response = await fetch('/api/getme', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });

        if (response.status === 200 && response.ok) {
          const result = await response.json();
          const role = result.user.role;

          setFormData({});

          if (role === 1) {
            toast.success('Login successfully!');
            history.push('/admin/dashboard');
            
          } else if (role === 2) {
            toast.success('Login successfully!');
            history.push('/secretary/dashboard');
          } else if (role === 3) {
            toast.success('Login successfully!');
            history.push('/user/dashboard');
          } else if (role === 0) {
            toast.success('Login successfully!');
            history.push('/Unregisteruser/dashboard');
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role',role);
            localStorage.setItem('googletoken',token)
          }
        } else {
          toast.error('Login failed. Please check your credentials.');
        }
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred.');
    }
  };

  useEffect(() => {
    /*global google*/
    google.accounts.id.initialize({
      client_id: '373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com', // Replace with your actual client ID
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById('signin'),
      { theme: 'outline', size: 'large' }
    );

    
    // Uncomment the line below if you want to prompt for Google Sign-In immediately
    // google.accounts.id.prompt();
  }, []);

  return (
    <div>
      <Header />

      <div className="container">
        <div className="register">
          <h2>Login</h2>
          <div id="signin" className='googlesign'>Sign In with Google</div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Login;
