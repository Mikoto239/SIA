import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/header';
import Footer from '../../components/footer';
import '../../App';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Pdfcom from '../../components/Pdfcom';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;



const AdminRecieveMemoDetails = ({ match }) => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [isAcknowledged, setIsAcknowledged] = useState(false); // New state to track acknowledgment
  const history = useHistory();
  const { memoId } = useParams();
  const [acknowledgeStatus, setAcknowledgeStatus] = useState(false);
  const token = localStorage.getItem('token')
  const [activeMenuItem, setActiveMenuItem] = useState('Memo');
  const [pdffile,setpdffile] = useState();

  
  const showpdf = (pdf) => {
    setpdffile(`http://localhost:5000/typememo/${pdf}`)
  };


  const handleMenuItemClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      history.push('/admin/dashboard');
    } else if  (menuItem === 'Memo Manager') {
      history.push('/admin/memo_manager');
    }
    else if  (menuItem === 'Faculty Manager') {
      history.push('/admin/faculty_manager');
    }
    else if  (menuItem === 'Report List') {
      history.push('/admin/report_list');
    } else if  (menuItem === 'Calendar') {
      history.push('/admin/calendar');
    }else if  (menuItem === 'Invite Members') {
      history.push('/admin/inviteMember');
    }
  };


  useEffect(() => {
    const fetchMemoDetails = async () => {
      try {
        const response = await axios.get(`/api/memo/details/${memoId}`);
        setMemoDetails(response.data.memo);
  
        const getme = await axios.get('/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const myemail = getme.data.user.email;
  
        // Correct acknowledgment request
        const acknowledgmentResponse = await axios.post(
          `/api/Iacknowledge/${memoId}`,
          { email: myemail }
        );
  
        setIsAcknowledged(acknowledgmentResponse.data.acknowledgeStatus);
        setAcknowledgeStatus(acknowledgmentResponse.data.acknowledgeStatus);
      } catch (error) {
        console.error('Error fetching memo details:', error);
      }
    };
  
    fetchMemoDetails();
  }, [memoId, token]);
  

  const handleAcknowledge = async () => {
    let email;
    let name;
  
    try {
      const response = await axios.get('/api/getme', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200 && response.data) {
        email = response.data.user.email;
        name = response.data.user.name;
        
  
        const acknowledge = await axios.post(`/api/memo/acknowledge/${memoId}`, { email,name});
  
        if (acknowledge.status === 200) {
          setIsAcknowledged(true);
        } else if (acknowledge.status === 404) {
          console.error('Memo not found. Please check the memo ID.');
        } else {
          console.error('Error acknowledging memo:', acknowledge.statusText);
        }
      } else {
        console.error('Error fetching user details:' + email);
      }
    } catch (error) {
      console.error('Error acknowledging memo:', error);
  
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
    }
  };
    
  
  
  

if (!memoDetails) {
  return <p>Loading...</p>;
}


  return (
    <>
      <HeaderDashboard />
      <div className="content-header">
        <div>
          <h1>Receive Memo</h1>
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
        <li className={activeMenuItem === 'Dashboard' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Dashboard')} href="dashboard">
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
            <a onClick={() => handleMenuItemClick('Report List')} href="#">
              Report List
            </a>
          </li>
          <li className={activeMenuItem === 'Invite Members' ? 'active' : ''}>
            <a onClick={() => handleMenuItemClick('Invite Members')} href="inviteMember">
              Invite Members
            </a>
          </li>
        </div>

        <div className='content'>
     
          <div className="memo-details-container">
          <Link to={'/admin/memo_manager'} className="link-to-send" > Back </Link>
            <h1>Memo Details</h1>
          
            <p className="memo-title-details">Title: {memoDetails.title}</p>
            <p className="memo-sender-details">From: {memoDetails.sender}</p>
            <p className="memo-timestamp-details">Timestamp: {new Date(memoDetails.createdAt).toLocaleString()}</p>
            <p className="memo-content-details">Content: {memoDetails.content}</p>
            <button type="button" className='showmemo' onClick={() => showpdf(memoDetails.content)}>Show Memo</button>
              <a href={`http://localhost:5000/typememo/${memoDetails.content}`} className="link-to-send" target="_blank" rel="noopener noreferrer">Open PDF</a>
            <Pdfcom pdffile={pdffile}/>
       
          

            {isAcknowledged ? (
            <strong>    <p className="acknowledge-info">You have already acknowledged this memo.</p></strong>  
          ) : (
            <>
              <label for='acknowledge'>By clicking this button the Admin notify that you acknowledge this memo</label>
              <button className='acknowledge' onClick={handleAcknowledge}>
                Acknowledge Memo
              </button>
              <p className="acknowledge-info">You haven't acknowledged this memo yet.</p>
            </>
          )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default  AdminRecieveMemoDetails;
