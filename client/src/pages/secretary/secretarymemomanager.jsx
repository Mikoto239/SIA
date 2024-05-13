import React, { useState, useEffect } from 'react';
import HeaderDashboard from '../../components/headerdashboard';
import Footer from '../../components/footer';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SecretaryMemoManager = () => {
  const [profile, setProfile] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('Memo');
  const [Icreatememos, setIcreateMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQueryMemoList, setSearchQueryMemoList] = useState('');
  const [searchQueryReceivedMemos, setSearchQueryReceivedMemos] = useState('');
  const [memos, setMemos] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSearchMemoList = (event) => {
    const { value } = event.target;
    setSearchQueryMemoList(value);
  };

  const handleSearchReceivedMemos = (event) => {
    const { value } = event.target;
    setSearchQueryReceivedMemos(value);
  };

  const filteredMemoList = Icreatememos.filter((memo) =>
    memo.title && memo.title.toLowerCase().includes(searchQueryMemoList.toLowerCase())
  );

  const filteredReceivedMemos = memos.filter((memo) =>
    memo.title && memo.title.toLowerCase().includes(searchQueryReceivedMemos.toLowerCase())
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('/api/details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.user);

        const memoResponse = await axios.get('/api/memoIcreate', {
          params: { email: response.data.user.email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIcreateMemos(memoResponse.data.showmemo);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserDetails();
    }
  }, [token]);

  useEffect(() => {
    const fetchUserDataAndMemos = async () => {
      try {
        const response = await axios.get('/api/details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.user);
        setLoading(false);

        const memoResponse = await axios.get('/api/showmemo', {
          params: { email: response.data.user.email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMemos(memoResponse.data.showmemo);
      } catch (error) {
        console.error('Error fetching user details or memos:', error);
        setLoading(false);
      }
    };

    if (token && profile) {
      fetchUserDataAndMemos();
    }
  }, [token, profile]);

  const handleRead = async (e, memoId) => {
    try {
      const response = await axios.get('/api/getme', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        const email = response.data.user.email;
        await axios.post('/api/memo/read', { email, memoId });
      }
    } catch (error) {
      console.error('Error fetching user details or acknowledging memo:', error);
    }
  };

  return (
    <>
      <HeaderDashboard />
      <div className="content-header">
        <div>
          <h1>DashBoard</h1>
        </div>
      </div>
      <div className="dashboard">
        <div className="sidebar">
          <ul>
            <li className={activeMenuItem === 'Dashboard' ? 'active' : ''}>
              <a onClick={() => setActiveMenuItem('Dashboard')} href="dashboard">
                Dashboard
              </a>
            </li>
            <li className={activeMenuItem === 'Memo Manager' ? 'active' : ''}>
              <a onClick={() => setActiveMenuItem('Memo Manager')} href="memo_manager">
                Memo Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Calendar' ? 'active' : ''}>
              <a onClick={() => setActiveMenuItem('Calendar')} href="calendar">
                Calendar
              </a>
            </li>
            <li className={activeMenuItem === 'Faculty Manager' ? 'active' : ''}>
              <a onClick={() => setActiveMenuItem('Faculty Manager')} href="faculty_manager">
                Faculty Manager
              </a>
            </li>
            <li className={activeMenuItem === 'Report List' ? 'active' : ''}>
              <a onClick={() => setActiveMenuItem('Report List')} href="report_list">
                Report List
              </a>
            </li>
          
          </ul>
        </div>
        <div className="content">
          <div className="contenta">
            <input
              className="search-left"
              type="text"
              placeholder="Search Memo List"
              value={searchQueryMemoList}
              onChange={handleSearchMemoList}
            />
            <Link to="/secretary/memo_create" className="link-to-send">
              Send Memo
            </Link>
            <div className="search-bar-left">
              {filteredMemoList && filteredMemoList.length > 0 ? (
                <ul className="sendMemoList">
                  {filteredMemoList.slice().reverse().map((memo) => (
                    <li key={memo._id}>
                      <Link to={`/secretary/memo_Icreate/${memo._id}`}>
                        <div className="memo-details">
                          <div className="memo-title">Title: {memo.title}</div>
                          <div className="memo-date">
                            {new Date(memo.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No memos available.</p>
              )}
            </div>
            <div className="top-receive">
              <input
                className="search-right"
                type="text"
                placeholder="Search Received Memos"
                value={searchQueryReceivedMemos}
                onChange={handleSearchReceivedMemos}
              />
            </div>
            <div className="search-right-receive">Receieve Memo</div>
            <div className="search-bar-right ">
              {filteredReceivedMemos && filteredReceivedMemos.length > 0 ? (
                <ul className="receivedMemoList">
                  {filteredReceivedMemos.slice().reverse().map((memo) => (
                    <li key={memo._id} className="receivedMemoItem">
                      <Link
                        to={`/secretary/recieve_memo/${memo._id}`}
                        onClick={(e) => handleRead(e, memo._id)}
                      >
                        <div className="memo-details">
                          <div className="memo-title">Title:{memo.title}</div>
                          <div className="memo-sender">
                            <p>From: {memo.sender}</p>
                          </div>
                          <div className="memo-date">
                            {new Date(memo.createdAt).toLocaleString()}
                          </div>
                          <div className="memo-content-details">
                            {memo.recipients && Array.isArray(memo.recipients) && (
                              <>
                                <p>
                                  {memo.recipients.some(
                                    (recipient) => recipient.useremail === profile.email && !recipient.read
                                  )
                                    ? 'Unread'
                                    : 'Read'}
                                </p>
                                <p>
                                  Acknowledge:
                                  {memo.recipients.some(
                                    (recipient) => recipient.useremail === profile.email && !recipient.acknowledge
                                  )
                                    ? 'No'
                                    : 'Yes'}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No received memos available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecretaryMemoManager;
