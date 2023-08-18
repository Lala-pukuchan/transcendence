import './App.css'
import { Link } from 'react-router-dom'
import { updateCookie } from './utils/HandleCookie';
import { useLocation } from 'react-router-dom';

const MenuBar = () => {

  // ゲーム画面ではメニューバーを非表示にする
  const location = useLocation();
  const onGamePage = location.pathname === '/game';

  const handleLogout = () => {
    updateCookie('token', '');
    window.location.href = "/";
  };

  return (
    <>
      {!onGamePage && (
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
      )}
    </>
  );
};

export default MenuBar;
