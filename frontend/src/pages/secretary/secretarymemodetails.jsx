import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import '../../App.css';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import base64 from 'base-64';  // Import the base64 library
import TextareaAutosize from 'react-textarea-autosize';

import Pdfcom from '../../components/Pdfcom';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

   



  const MemoDetails = () => {
    const [memoDetails, setMemoDetails] = useState(null);
    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const history = useHistory();
    const { memoId } = useParams();
    const token = localStorage.getItem('token');
    const [activeMenuItem, setActiveMenuItem] = useState('Memo');
    
  const [showMemo, setShowMemo] = useState(false);

    const [pdffile,setpdffile] = useState();



    const handleMenuItemClick = (menuItem) => {
      if (menuItem === 'Dashboard') {
        history.push('/secretary/dashboard');
      } else if (menuItem === 'Memo Manager') {
        history.push('/secretary/memo_manager');
      }
      else if (menuItem === 'Calendar') {
        history.push('/secretary/calendar');
      }
      else if (menuItem === 'Invite Members') {
        history.push('/secretary/inviteMember');
      }
      else if (menuItem === 'Faculty Manager') {
        history.push('/secretary/faculty_manager');
      }
      else if (menuItem === 'Memo Manager') {
        history.push('/secretary/memo_manager');
      }
      else if (menuItem === 'Calendar') {
        history.push('/secretary/calendar');
      }
    };

  
    
    
  
    useEffect(() => {
      axios
        .get(`/api/memo/details/${memoId}`)
        .then((response) => {
          setMemoDetails(response.data.memo);
          setIsAcknowledged(response.data.memo.isAcknowledged);
      
        })
        .catch((error) => {
          console.error('Error fetching memo details:', error);
        });
    }, [memoId]);
  
    const handleBackClick = () => {
      history.push('/secretary/memo_manager');
    };

    if (!memoDetails) {
      return <p>Loading...</p>;
    }
    const showpdf = (pdf) => {
      setpdffile(`http://localhost:5000/typememo/${pdf}`)
    };
    return (
      <>
        <HeaderDashboard />
        <div className="content-header">
          <div>
            <h1>DashBoard</h1>
          </div>
          <div>
            <input
              className="search"
              type="text"
              placeholder="Search"
            />
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
        
          </ul>
          </div>
          
          <div className="content">
            <div className="memo-details-container">
              <h1>Memo Details</h1>
              <Link to="/secretary/memo_manager" className="link-to-send" onClick={handleBackClick}>Back</Link>
              <p className="memo-title-details">Title: {memoDetails.title}</p>
              <p className="memo-sender-details">From: {memoDetails.sender}</p>
              <p className="memo-timestamp-details">Timestamp: {new Date(memoDetails.createdAt).toLocaleString()}</p>
              <TextareaAutosize maxRows={20} value={memoDetails.content} readOnly />
              <button type="button" className="showmemo" onClick={() => showpdf(memoDetails.content)}>Show Memo</button>
              <a

  target="_blank"
  rel="noopener noreferrer"
  href={`/typememo/${memoDetails.content}`} // Use a relative URL
  download={`memo_${memoDetails.title}.pdf`} // Set the filename here
className="link-to-send"
>
  Download Memo
</a>
<Pdfcom pdffile={pdffile}/>
              <div className="memo-recipients-details">
                <h2>Recipients</h2>
                <ul>
                  {memoDetails.recipients.map((recipient, index) => (
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
          </div>
        </div>
        
        <Footer />
      </>
    );
  };

  export default MemoDetails;