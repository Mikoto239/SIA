import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import { Link } from 'react-router-dom';
import { PieChart, Pie, ResponsiveContainer,Cell,Text } from 'recharts';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Pdfcom from '../../components/Pdfcom';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;



const AdminsentReport = () => {
  const [memoDetails, setMemoDetails] = useState(null);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const history = useHistory();
  const { memoId } = useParams();
  const token = localStorage.getItem('token');
  const [activeMenuItem, setActiveMenuItem] = useState('Memo');
  const [pdffile,setpdffile] = useState();


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
      case 'Invite Members':
        history.push('/admin/inviteMember');
        break;
      case 'Faculty Manager':
        history.push('/admin/faculty_manager');
        break;
      default:
        break;
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
    history.push('/admin/memo_manager');
  };

  if (!memoDetails) {
    return <p>Loading...</p>;
  }



  const downloadAsPDF = async () => {
    const memoDetailsContainer = document.getElementById('memo-details-container');
  
    try {
      // Use html2canvas to capture the content as an image
      const canvas = await html2canvas(memoDetailsContainer);
  
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
  
      // Add the captured image to the PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
  
      const filename = memoDetails.title.replace(/[^\w\s]/gi, '') || 'memo-details';

      // Save the PDF with the memo title as the filename
      pdf.save(`${filename}-details.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
            <li className={activeMenuItem === 'Invite Members' ? 'active' : ''}>
              <a onClick={() => handleMenuItemClick('Invite Members')} href="/admin/inviteMember">
                Invite Members
              </a>
            </li>
          </ul>
        </div>
      
        <div className="content" >
        <button onClick={downloadAsPDF} className="link-to-send">Download as PDF</button>
       
          <div className="memo-details-container" id="memo-details-container">
          <Link to="/admin/report_list" onClick={handleBackClick} className="link-to-send"> Back</Link>
            <h1>Memo Details</h1>
 
         
            <p className="memo-title-details">Title: {memoDetails.title}</p>
            <p className="memo-sender-details">From: {memoDetails.sender}</p>
            <p className="memo-timestamp-details">Timestamp: {new Date(memoDetails.createdAt).toLocaleString()}</p>
            <p className="memo-content-details">Content: {memoDetails.content}</p>
            <button type="button"className='showmemo' onClick={() => showpdf(memoDetails.content)}>Show Memo</button>
              <a href={`http://localhost:5000/typememo/${memoDetails.content}`} className="link-to-send" target="_blank" rel="noopener noreferrer">Download PDF</a>
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
  
  
      <Pdfcom pdffile={pdffile}/>
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

export default AdminsentReport;