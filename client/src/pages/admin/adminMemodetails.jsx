  import React, { useState, useEffect } from 'react';
  import { useHistory } from 'react-router-dom';
  import axios from 'axios';
  import HeaderDashboard from '../../components/headerdashboard';
  import Footer from '../../components/footer';
  import '../../App.css';
  import { useParams } from 'react-router-dom';
  import { Link } from 'react-router-dom';
  import TextareaAutosize from 'react-textarea-autosize';
  import { Document, Page, pdfjs } from 'react-pdf';

  const MemoDetails = () => {
    const [memoDetails, setMemoDetails] = useState(null);
    const history = useHistory();
    const { memoId } = useParams();
    const token = localStorage.getItem('token');
    const [activeMenuItem, setActiveMenuItem] = useState('Memo');
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfPages, setPdfPages] = useState('');

    const handleMenuItemClick = (menuItem) => {
      if (menuItem === 'Dashboard') {
        history.push('/admin/dashboard');
      } else if (menuItem === 'Memo Manager') {
        history.push('/admin/memo_manager');
      } else if (menuItem === 'Calendar') {
        history.push('/admin/calendar');
      } else if (menuItem === 'Invite Members') {
        history.push('/admin/inviteMember');
      } else if (menuItem === 'Faculty Manager') {
        history.push('/admin/faculty_manager');
      } else if (menuItem === 'Report List') {
        history.push('/admin/report_list');
      } else if (menuItem === 'Calendar') {
        history.push('/admin/calendar');
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const getMeResponse = await axios.get('/api/getme', {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          const userEmail = getMeResponse.data.user.email;
    
          const response = await axios.get(`/api/memo/created/${memoId}?email=${userEmail}`, {
            responseType: 'blob', // Specify the response type as blob
          });
      
          const pdfUrl = URL.createObjectURL(response.data);
          setPdfUrl(pdfUrl);
  
          const memodetails = await axios.get(`/api/memo/created_details/${memoId}?email=${userEmail}`);
          const details = memodetails.data.memo;
        
          setMemoDetails(details);
        } catch (error) {
          console.error(error);
          history.goBack(); // Redirect or handle error accordingly
        }
      };
    
      fetchData();
    }, [memoId, token, history]);
    


    const handleBackClick = () => {
      history.push('/admin/memo_manager');
    };

    if (!pdfUrl) {
      return <p>Loading...</p>;
    }

    return (
      <>
        <HeaderDashboard />
        <div className="content-header">
          <div>
            <h1>DashBoard</h1>
          </div>
          <div>
            <input className="search" type="text" placeholder="Search" />
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
                <a onClick={() => handleMenuItemClick('Memo Manager')} href="#">
                  Memo Manager
                </a>
              </li>
              <li className={activeMenuItem === 'Calendar' ? 'active' : ''}>
                <a onClick={() => handleMenuItemClick('Calendar')} href="#">
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
          {memoDetails ? ( // Check if memoDetails is not null
            <div className="memo-details-container">
              <h1>Memo Details</h1>
              <Link to="/admin/memo_manager" className="link-to-send" onClick={handleBackClick}>Back</Link>
              <p className="memo-title-details">Title: {memoDetails.title}</p>
              <p className="memo-sender-details">From: {memoDetails.sender}</p>
              <p className="memo-timestamp-details">Timestamp: {new Date(memoDetails.createdAt).toLocaleString()}</p>
              <TextareaAutosize maxRows={20} value={memoDetails.content} readOnly />

              <div className="memo-pdf-container">
                {pdfUrl ? (
                  <iframe title="PDF Viewer" src={pdfUrl} width="100%" height="500px" />
                ) : (
                  <p>Loading PDF...</p>
                )}
              </div>

              <div className="memo-recipients-details">
                <h2>Recipients</h2>
                <ul>
                  {memoDetails.recipients && memoDetails.recipients.map((recipient, index) => (
                    <li key={index}>
                      <p>Email: {recipient.useremail}</p>
                      <p>Name: {recipient.username}</p>
                      <p>Read: {recipient.read ? 'Yes' : 'No'}</p>
                      <p>Acknowledge: {recipient.acknowledge ? 'Yes' : 'No'}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

        <Footer />
      </>
    );
  };

  export default MemoDetails;
