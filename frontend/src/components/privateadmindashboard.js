import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteAdmin = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem('token');
  const myrole = localStorage.getItem('role');
  const [role, setRole] = useState(1);

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
        setRole(userRole); // Update the role state
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (myrole === '1' || (role && role === '1')) { // Check if role is set before comparing its value
          return <Component {...props} />;
        } else if (myrole === '2') {
          return <Redirect to="/secretary/dashboard" />;
        } else if (myrole === '3') {
          return <Redirect to="/user/dashboard" />;
        } else if (myrole === '0') {
          return <Redirect to="/unregisteruser/dashboard" />;
        } else {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
      }}
    />
  );
};

export default PrivateRouteAdmin;
