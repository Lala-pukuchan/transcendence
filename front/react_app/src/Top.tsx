import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TextField } from '@mui/material';
import { getCookie } from './utils/GetCookie.tsx';

function Top() {

  const navigate = useNavigate();

  const [userId, setUserId] = useState("");

  // tokenが無い場合、ログイン画面にリダイレクトさせる
  if (!getCookie("token")) {
    window.location.href = "login";
    return null;
  }

  return (
    <>
      <TextField id="outlined-basic" label="Outlined" variant="outlined" defaultValue="UserId" sx={{ m: 10 }} onChange={e => setUserId(e.target.value)}/>
      <Paper sx={{ width: 320, maxWidth: '100%' }}>
        <MenuList>
          <MenuItem onClick={() => navigate('/chat', { state: userId })}>
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
      {/*<img src="data:image/png;base64,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" alt="" />*/}
    </>
  )
}

export default Top
