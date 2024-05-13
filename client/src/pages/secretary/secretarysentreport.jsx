import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import { Link } from 'react-router-dom';
import { PieChart, Pie, ResponsiveContainer,Cell,Text } from 'recharts';



const SecretarysentReport = () => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const history = useHistory();
  const { memoId } = useParams();
  const token = localStorage.getItem('token');
  const [activeMenuItem, setActiveMenuItem] = useState('Memo');
  const [pdffile,setpdffile] = useState();
  const [pdfUrl, setPdfUrl] = useState('');


  const handleMenuItemClick = (menuItem) => {
    switch (menuItem) {
      case 'Dashboard':
        history.push('/admin/dashboard');
        break;
      case 'Memo Manager':
        history.push('/admin/memo_manager');
        break;
      case 'Calendar':
        history.push('/admin/calendar');
        break;
      case 'Faculty Manager':
        history.push('/admin/faculty_manager');
        break;
      default:
        break;
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
        const acknowledge = memodetails.data.memo.isAcknowledged
        setIsAcknowledged(acknowledge);
  
        setMemoDetails(details);
      } catch (error) {
        console.error(error);
        history.goBack(); // Redirect or handle error accordingly
      }
    };
  
    fetchData();
  }, [memoId, token, history]);
  


  const handleBackClick = () => {
    history.push('/secretary/memo_manager');
  };

  if (!memoDetails) {
    return <p>Loading...</p>;
  }





  const acknowledgedCount = memoDetails.recipients.filter((recipient) => recipient.acknowledge).length;
  const readCount = memoDetails.recipients.filter((recipient) => recipient.read).length;
  const labelTopRead = "Read Status";
const labelTopAcknowledge = "Acknowledge Status";
const notReadPercentage = (((memoDetails.recipients.length - readCount) / memoDetails.recipients.length) * 100).toFixed(2);
const notAcknowledgePercentage = (((memoDetails.recipients.length - acknowledgedCount) / memoDetails.recipients.length) * 100).toFixed(2);

  const PieChartWithCustomizedLabel = ({ data, dataKey, nameKey, position, labelTop, labelBottom, labelNotRead, labelNotAcknowledge }) => {
    const cxPosition = position === 'left' ? '50%' : '50%';

    return (
      <ResponsiveContainer width="50%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx={cxPosition}
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            fill="black"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        
          {data.map((entry, index) => (
            <g key={`legend-${index}`} transform={`translate(${position === 'left' ? 10 : 10},${90 + index * 20})`}>
              <rect width="15" height="15" fill={entry.color} />
              <text x="20" y="12" textAnchor="start" fill="black" fontSize="12">
                {entry.name}
              </text>
            </g>
          ))}
        
          <text x="50%" y="10" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">
            {labelTop}
          </text>
        
          <text x="50%" y="90%" textAnchor="middle" fill="black" fontSize="12">
            {labelBottom}
          </text>

          {labelNotRead && (
            <text x="50%" y="110%" textAnchor="middle" fill="black" fontSize="12">
              {labelNotRead}
            </text>
          )}

          {labelNotAcknowledge && (
            <text x="50%" y="130%" textAnchor="middle" fill="black" fontSize="12">
              {labelNotAcknowledge}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  };

  

const data01 = [
{
  "name": "Acknowledged",
  "value": acknowledgedCount,
  "color":"green"
},
{
  "name": "Not Acknowledged",
  "value": memoDetails.recipients.length - acknowledgedCount,
  "color": "red"
}
];

const data02 = [
{
  "name": "Read",
  "value": readCount,
  "color": "#3498db"
},
{
  "name": "Not Read",
  "value": memoDetails.recipients.length - readCount,
  "color": "#f39c12"
}
];

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
              <a onClick={() => handleMenuItemClick('Dashboard')} href="/admin/dashboard">
                Dashboard
              </a>
            </li>
            <li className={activeMenuItem === 'Memo Manager' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Memo Manager')} href="/admin/memo_manager">
                Memo Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Calendar' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Calendar')} href="/admin/calendar">
                Calendar
              </a>
            </li>
            <li className={activeMenuItem === 'Faculty Manager' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Faculty Manager')} href="/admin/faculty_manager">
                Faculty Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Report List' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Report List')} href="/admin/report_list">
                Report List
              </a>
            </li>
       
          </ul>
        </div>
      
        <div className="content" >
    
          <div className="memo-details-container" id="memo-details-container">
          <Link to="/secretary/report_list" onClick={handleBackClick} className="link-to-send"> Back</Link>
            <h1>Memo Details</h1>
 
         
            <p className="memo-title-details">Title: {memoDetails.title}</p>
            <p className="memo-sender-details">From: {memoDetails.sender}</p>
            <p className="memo-timestamp-details">Timestamp: {new Date(memoDetails.createdAt).toLocaleString()}</p>
            <p className="memo-content-details">Content: {memoDetails.content}</p>
          
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <PieChartWithCustomizedLabel
  data={data02}
  dataKey="value"
  nameKey="name"
  position="left"
  labelTop={labelTopRead}
  labelBottom={`Read: ${readCount} (${((readCount / memoDetails.recipients.length) * 100).toFixed(2)}%) Not Read: ${memoDetails.recipients.length - readCount} (${notReadPercentage}%)`}
/>
<PieChartWithCustomizedLabel
  data={data01}
  dataKey="value"
  nameKey="name"
  position="right"
  labelTop={labelTopAcknowledge}
  labelBottom={`Acknowledged: ${acknowledgedCount} (${((acknowledgedCount / memoDetails.recipients.length) * 100).toFixed(2)}%) Not Acknowledged: ${memoDetails.recipients.length - acknowledgedCount} (${notAcknowledgePercentage}%)`}
/>
      </div>
  
  
      <div className="memo-pdf-container">
                {pdfUrl ? (
                  <iframe title="PDF Viewer" src={pdfUrl} width="100%" height="500px" />
                ) : (
                  <p>Loading PDF...</p>
                )}
              </div>
      <div className="memo-details-container" >
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

export default SecretarysentReport;