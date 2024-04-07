import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import axios from 'axios';
import { toast } from 'react-toastify';

import '../../App.css';

const InviteMember = () => {
  const [profile, setProfile] = useState({
    email: '',
  });
  const [activeMenuItem, setActiveMenuItem] = useState('InviteMember'); // Default active menu item
  const [recipient, setRecipient] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [role, setrole] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);


  const handleConfirmation = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
  };

  const handleConfirmSend = (e) => {
    e.preventDefault(); 
    const fakeEvent = e || {};
    handleFormSubmit(fakeEvent);
    handleConfirmationClose();
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const { email } = profile;
  const token = localStorage.getItem('token');

  const generateCode = () => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      code += charset.charAt(randomIndex);
    }

    return code;
  };

  useEffect(() => {
    fetch('/api/details', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setProfile(result.user);
      })
      .catch((error) => {
        console.log(error);

      });
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    handleConfirmation()
    const code = generateCode();
   
    try {
      const { data } = await axios.post('/api/invite', {
        sender: email,
        recipient: recipient,
        subject: "Invitation From COT Department",
        message: `Hello, I am the admin of this system. Please go to this site: http://localhost:3000/ and use this code ${code}. Do not share this code with others.`,
        code: code, 
        role: role
      });

      setRecipient('');
      setrole('');
      setGeneratedCode('');

      toast.success('Successfully sent');
    } catch (err) {
      toast.error(err.response.data.error);
    }
  };

  return (
    <>
     <HeaderDashboard />

    <div className="dashboard">
      <div>
        <h1>Invite Members</h1>
      </div>
</div>

    <div className="dashboard">
      <div className="sidebar">
        <ul>
          <li className={activeMenuItem === 'Dashboard' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Dashboard')} href="Dashboard">
              Dashboard
            </a>
          </li>
          <li className={activeMenuItem === 'Memo Manager' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Memo Manager')} href="memo_manager">
              Memo Manager
            </a>
          </li>
          <li className={activeMenuItem === 'Calendar' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Calendar')} href="calendar">
              Calendar
            </a>
          </li>
          <li className={activeMenuItem === 'Faculty Manager' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Faculty Manager')} href="faculty_manager">
              Faculty Manager
            </a>
          </li>
          <li className={activeMenuItem === 'Report List' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Report List')} href="report_list">
              Report List
            </a>
          </li>
          <li className={activeMenuItem === 'Invite Members' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Invite Members')} href="inviteMember">
              Invite Members
            </a>
          </li>
        </ul>
      </div>
      <div className="content">
      <div className="Creatememo">
      <form onSubmit={handleFormSubmit}>
      

  
        <div className="Recipient">
          <label for="recipient">Send to:</label>
          <input
            type="text"
            onChange={(e) => setRecipient(e.target.value)}
            name="recipient"
            placeholder="Send to"
            className="recipient"
            value={recipient}
            
          />
        </div>
  
     
  
      

       <div className='selectrole'>
       <label For="admin">Admin</label> 
        <input
            type="radio"
            onChange={(e) => setrole(e.target.value)}
            name="role"
            value="1" // Admin
            className="admin"
            checked={role === '1'} // Add this line
          />
         
          <label For="secretary">Secretary</label>
              <input
                type="radio"
                onChange={(e) => setrole(e.target.value)}
                name="role"
                value="2" // Secretary
                checked={role === '2'} // Add this line
                className="secretary"
              />
         
          <label For="user">User</label>
          <input
            type="radio"
            onChange={(e) => setrole(e.target.value)}
            name="role"
            value="3" // User
            className="user"
            checked={role === '3'} 
          />
      
          </div>

       
          <button type="button" onClick={handleConfirmation}>Send</button>



      </form>
      
      {isConfirmationOpen && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to invite this user?</p>
            <button onClick={handleConfirmSend}>Yes</button>
            <button onClick={handleConfirmationClose}>No</button>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
    
    <Footer />
  </>
  
  
  );
};

export default InviteMember;