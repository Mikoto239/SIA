import React from 'react';
import COTLOGO from '../image/COT.png';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className='head'>
      <img src={COTLOGO} alt="COT-LOGO" className='logo' />
      <h5>BUKIDNON STATE UNIVERSITY<h3>COLLEGE OF TECHNOLOGIES</h3></h5>
      <ul className='nav-item-header'>
        <Link className="nav-link" to='/login' style={{ borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          Login
        </Link>
        <Link className="nav-link" to='/signup'>
          Sign up
        </Link>
      </ul>
    </div>
  );
}

export default Header;
