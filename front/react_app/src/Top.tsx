import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";

function Top() {

  // ページ遷移用
  const navigate = useNavigate();

  // tokenが無い場合、ログイン画面にリダイレクトさせる
  const token = getCookie("token");
  if (!token) {
    window.location.href = "login";
    return null;
  }

  // tokenデコード
  const decoded = decodeToken(token);
  console.log('decoded: ', decoded);

  // 二要素認証が未検証の場合、二要素認証ログイン画面にリダイレクトさせる
  if (decoded.user.isEnabledTfa && decoded.isTwoFactorAuthenticated === undefined) {
    window.location.href = "tfa";
    return null;
  }

  return (
    <>
      <Paper sx={{ width: 320, maxWidth: '100%' }}>
        <MenuList>
          <MenuItem onClick={() => navigate('/chat')}>
            <ListItemText>
              Chat
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => navigate('/game')}>
            <ListItemText>
              Game
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => navigate('/account')}>
            <ListItemText>
              Account Information
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

export default Top
