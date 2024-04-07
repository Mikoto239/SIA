import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteAdmin = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem('token');
  const myrole = localStorage.getItem('role');
  const [role, setRole] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/getme', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = response.data.user.role;
        setUserRole(userRole);
        setRole(userRole);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, e.g., show an error message to the user
      }
    };
    fetchData();
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (myrole === 3 || (role && role === 3)) { 
          return <Component {...props} />;
        } else if (myrole === '1') {
          return <Redirect to="/admin/dashboard" />;
        } else if (myrole === '2') {
          return <Redirect to="/secretary/dashboard" />;
        } else if (myrole === '0' && role === '0') {
          return <Redirect to="/unregisteruser/dashboard" />;
        } else {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
      }}
    />
  );
};

export default PrivateRouteAdmin;
