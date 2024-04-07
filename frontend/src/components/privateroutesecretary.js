import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

const PrivateRouteSecretary = ({ component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem('token');
  const myrole = localStorage.getItem('role');
  const [role, setRole] = useState(2);

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
        if (myrole === '2' || role === '2') {
          return <Component {...props} />;
        } else if (myrole === '1') {
          return <Redirect to="/admin/dashboard" />;
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

export default PrivateRouteSecretary;
