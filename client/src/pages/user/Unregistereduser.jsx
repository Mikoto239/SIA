import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import axios from 'axios';
import {toast} from 'react-toastify';

const Unregisteruserdashboard = () => {
  const [profile, setProfile] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
  const [department, setdepartment] = useState(''); // Corrected variable name
  const [message, setMessage] = useState('');
  const { name, email,picture, createdAt, role } = profile || {};
  const token = localStorage.getItem('token');
  const history = useHistory();
  

  useEffect(() => {
    fetch('/api/details', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        console.log(token);
        setProfile(result.user);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!department) {
      toast.error('Please select a department.');
      return;
    }
    try {
      const response = await axios.post('/api/verifycode', {
        code: verificationCode,
      });
  
      if (response && response.data && response.data.success) {
        const newrole = response.data.code.role;
          
        axios.post('/api/deletecode',{code:verificationCode});
        const updaterole = await axios.post('/api/updaterole', {
          email: email,
          role: newrole,
          department:department
        });
  
        if (updaterole && updaterole.data && updaterole.data.success) {
          const role = updaterole.data.user.role;
  
          setVerificationCode('');
          setMessage('Verification successful.');
  
          
          
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
        } else {
          setMessage('Failed to update user role.');
          toast.error('Invalid code')
         
        }
      } else {
        setMessage('Verification failed. Please try again.');
        toast.error('Invalid code')
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      setMessage('An error occurred during form submission. Please try again.');
      toast.error('Invalid code')
      
    }
  };
  

  return (
    <>
      <HeaderDashboard/>
      <div className='unregistereddashboard'>
        <h1>Validation DashBoard</h1>
        <div className='profiledetails'>
          <ul>
          <li className='details-lists-unregistered'>
               <img className='user-picture' src={picture} alt="User" />
            </li>
            <li className='details-list-profile'>Name: {name}</li>
            <li className='details-list-profile'>Email: {email}</li>
            <li className='details-list-profile'>Department: {department}</li>
            <li className='details-list-profile'>Join at: {new Date(createdAt).toLocaleDateString()}</li>
            <li className='details-list-profile'>{role === 1 ? 'Admin' : role === 2 ? 'Secretary' : role === 3 ? 'Instructor' :'Unregistered user' }</li>
          </ul>
        </div>
        <div>
            <h1>User Registration</h1>
        
  
            <div className='selectdepartment'>
          <label htmlFor="bsit">BSIT</label>
          <input
  type="radio"
  onChange={(e) => setdepartment(e.target.value)}
  name="department"
  value="Bachelor of Science and Information Technology"
  className="role"
/>

          <label htmlFor="bsft">BSFT</label>
          <input
            type="radio"
            onChange={(e) => setdepartment(e.target.value)}
            name="department"
            value="Bachelor of Science in Food Technology"
            className="role"
          />

          <label htmlFor="bsat">BSAT</label>
          <input
            type="radio"
            onChange={(e) => setdepartment(e.target.value)}
            name="department"
            value="Bachelor of Science in Automotive Technology"
            className="role"
          />
          
          <label htmlFor="bset">BSET</label>
          <input
            type="radio"
            onChange={(e) => setdepartment(e.target.value)}
            name="department"
            value="Bachelor of Science in Electrical Technology"
            className="role"
          />
       
        </div>
        <div className='verification-section'>
  <label>Verification Code:</label>
  <input type="text" value={verificationCode} placeholder="Enter code"onChange={(e) => setVerificationCode(e.target.value)} />
  <button disabled={!department} onClick={handleFormSubmit}>Verify</button>
        
</div>

            <div>
               
            </div>
         
        </div>
      </div>
    </>
  );
};

export default Unregisteruserdashboard;
