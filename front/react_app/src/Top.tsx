import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TextField } from '@mui/material';

function Top() {

  const navigate = useNavigate();

  const [userId, setUserId] = useState("");

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
    </>
  )
}

export default Top
