import React, { useState, useEffect, useRef } from 'react';
import HeaderDashboard from '../../components/headerdashboard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import '../../App.css';
import '../../'
import { DocumentEditorContainerComponent, Toolbar, Inject, Selection } from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense("ORg4AjUWIQA/Gnt2VVhhQ1Fac11JW3xNYVF2R2FJe1RzdF9DZkwgOX1dQ19hSXtTcEVhWndceXFdQmY=");

const AdminCreateMemo = () => {
  // State variables to manage memo data and form input.
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [userProfile, usersetProfile] = useState([]);
  const [memoEvents, setMemoEvents] = useState([]);
  const [SenderEmail, SetSenderEmail] = useState('');
  const [file, setFile] = useState('');
  const [storecontent, setStoreContent] = useState();
  let editorObj = useRef(null);
  const onSaveContentRef = useRef('');


  const token = localStorage.getItem('token');


  const { email, name, role, department } = userProfile;



  const handleConfirmation = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
  };

  const handleConfirmSend = (e) => {
    e.preventDefault(); // Make sure 'e' is the correct event object
    const fakeEvent = e || {}; // Use the passed event or create a fake one
    handleSubmit(fakeEvent);

    handleConfirmationClose();
  };

  const [activeMenuItem, setActiveMenuItem] = useState('memo_create');
  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedUsers(selectAll ? [] : userProfile);
  };

  const handleCheckboxChange = (user) => {
    setSelectedUsers((prevSelectedUsers) => {
      const isUserSelected = prevSelectedUsers.some((selectedUser) => selectedUser.email === user.email);

      const updatedUsers = isUserSelected
        ? prevSelectedUsers.filter((selectedUser) => selectedUser.email !== user.email)
        : [...prevSelectedUsers, user];

      console.log('Updated Users:', updatedUsers);
      return updatedUsers;
    });


    usersetProfile((prevUsers) => prevUsers.filter((prevUser) => prevUser.email !== email));
  };


  const handleContentChange = async () => {
    if (editorObj.current && editorObj.current.documentEditor) {
      try {
        const documentContent = await editorObj.current.documentEditor.getText();
        // Use getText() instead of getContent()
        console.log('Document Content:', documentContent);
      } catch (error) {
        console.error('Error getting document content:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleConfirmation();

    if (!title) {
      toast.error('Memo is not complete. Please fill in all required fields.');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient.');
      return;
    }

    try {
      const recipientsArray = selectedUsers.map((user) => ({
        useremail: user.email,
        username: user.name,
        read: false,
      }));

      const response = await fetch('/api/getme', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const senderName = result.user.name;
        const senderEmail = result.user.email;
        const subject = "New Memo";
        const message = `Hello,

          This is to notify you that a new memo has been created. Please log in to the system http://localhost:3000/ to view the details.
          
          Thank you.`;

        const formData = new FormData();
        formData.append('title', title);
        if (file) {
          formData.append('file', file);
        }
        else {
          formData.append('file', new Blob([onSaveContentRef.current], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'memo.docx');
        }
        formData.append('senderEmail', senderEmail);
        formData.append('sender', senderName);
        formData.append('recipients', JSON.stringify(recipientsArray));
        formData.append('subject', subject);
        formData.append('message', message);
        console.log(senderName + "this is sender name")

        const { data } = await axios.post('/api/memo/create', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.success) {
          toast.success('Memo Successfully Sent');
          handleConfirmationClose();
          setTitle('');
          setFile('');
          setContent('');
          setSelectedUsers([]);
          // Clear the file input value
          document.getElementById('fileInput').value = '';
        } else {
          toast.error('Failed to send memo. Please try again.');
        }
      } else {
        toast.error('Failed to fetch sender details');
      }
    } catch (error) {
      console.error(error);
      toast.error('Memo not sent. Please try again.');
    }
  };

  const handleItemClick = (value) => {
    console.log(value);

    if (value === 'BSIT') {
      axios.get('/api/getallbsit')
        .then((response) => {


          const allUsers = response.data.bsituser;


          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);
          usersetProfile(filteredUsers);

          setLoading(false)

        })
        .catch((error) => {

          toast.error('Error fetching users');
        });
    } else if (value === 'BSAT') {
      axios.get('/api/getallbsat')
        .then((response) => {

          const allUsers = response.data.bsatuser;

          // Filter out the current user
          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);
          usersetProfile(filteredUsers);

          setLoading(false)

        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setLoading(false)

        });
    } else if (value === 'BSFT') {
      axios.get('/api/getallbsft')
        .then((response) => {

          const allUsers = response.data.bsftuser;

          // Filter out the current user
          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);
          usersetProfile(filteredUsers);

          setLoading(false)

        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setLoading(false)

        });
    }
    else if (value === 'BSET') {
      axios.get('/api/getallbset')
        .then((response) => {
          const allUsers = response.data.bsetuser;

          // Filter out the current user
          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);
          usersetProfile(filteredUsers);

          setLoading(false)

        })
        .catch((error) => {
          console.error('Error fetching users:', error);

        });
    } else if (value === 'ALL') {
      axios.get('/api/getallusers')
        .then((response) => {
          const allUsers = response.data.users;

          // Filter out the current user
          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);
          usersetProfile(filteredUsers);


        }).catch((error) => {
          console.error('Error fetching users:', error);

        });
    } else if (value === 'ROLE') {
      axios.get('/api/role')
        .then((response) => {
          const allUsers = response.data.baseonrole;

          // Filter out the current user
          const filteredUsers = allUsers.filter(user => user.email !== SenderEmail);

          usersetProfile(filteredUsers);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching users based on role:', error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user details
        const response = await fetch('/api/getme', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          const senderEmail = result.user.email;

          // Fetch all users
          const usersResponse = await axios.get('/api/getallusers');
          const allUsers = usersResponse.data.users;

          // Filter out the current user from the list
          const filteredUsers = allUsers.filter(user => user.email !== senderEmail);

          SetSenderEmail(senderEmail)
          usersetProfile(filteredUsers);
          setLoading(false);
        } else {
          console.error('Failed to fetch current user details');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData(); // Call the async function

    if (editorObj.current && editorObj.current.documentEditor) {
      editorObj.current.documentEditor.documentChange = handleContentChange;
    }


  }, [token]); // Add token to the dependency array if it's part of the component's state



  return (
    <>
      <div>
        <HeaderDashboard />
        <div className="content-header">
          <div>
            <h1>Send Memo</h1>
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
              <Link to={'/admin/memo_manager'} className="link-to-send" id="createMemoback">Back</Link>
              <form className="form" onSubmit={handleSubmit} encType="multipart/form-data">


                <div className="title">
                  <input
                    type="text"
                    value={title}
                    name="title"
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Memo title"
                    className="form-control"
                  />
                </div>

                <input type="file" className='fileinput' id="fileInput" accept="application/pdf/docx" onChange={(e) => setFile(e.target.files[0])} />


                <button type="button" className="memoSend" onClick={handleConfirmation}>
                  Send
                </button>

                <div className='listoffaculty'>
                  <div class="dropdown">
                    <button type="button" class="dropbtw">Filter</button>

                    <div class="dropdown-content-faculty">
                      <div onClick={() => handleItemClick('ALL')}>ALL</div>
                      <div onClick={() => handleItemClick('BSIT')}>BSIT</div>
                      <div onClick={() => handleItemClick('BSAT')}>BSAT</div>
                      <div onClick={() => handleItemClick('BSET')}>BSET</div>
                      <div onClick={() => handleItemClick('BSFT')}>BSFT</div>
                      <div onClick={() => handleItemClick('ROLE')}>ROLE</div>
                    </div>

                  </div>
                  <button type="button" onClick={handleSelectAll} className="selectAllButton">
                    {selectAll ? 'Unselect All' : 'Select All'}
                  </button>

                  {loading ? (
  <p>Loading...</p>
) : (
  userProfile
    .filter(user => user.role !== 0) // Filter out users with role 0
    .map((user, index) => (
      <div key={index} className="user-details-send">
        <input
          type="checkbox"
          checked={selectedUsers.some((selectedUser) => selectedUser.email === user.email)}
          onChange={() => handleCheckboxChange(user)}
        />
        <div className='details-list'>Name: {user.name}</div>
        <div className='details-list'>
          {user.role === 1 ? 'Admin' : user.role === 2 ? 'Secretary' : user.role === 3 ? 'Instructor' : 'Unregistered user'}
        </div>
      </div>
    ))
)}


                  {isConfirmationOpen && (
                    <div className="confirmation-modal">
                      <div className="modal-content">
                        <p>Are you sure you want to send this memo?</p>
                        <button onClick={handleConfirmSend} >Yes</button>
                        <button onClick={handleConfirmationClose}>No</button>
                      </div>
                    </div>
                  )}
                </div>


              </form>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default AdminCreateMemo;
