import './App.css'
import { Link } from 'react-router-dom'
import { updateCookie } from './utils/HandleCookie';

const MenuBar = () => {

  const handleLogout = () => {
    updateCookie('token', '');
    window.location.href = "/";
  };

  return (
    <nav className="menu-bar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li className="logout">
          <span onClick={handleLogout}>Logout</span>
        </li>
      </ul>
    </nav>
  );
};

export default MenuBar;
