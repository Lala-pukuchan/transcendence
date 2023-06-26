import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';

function Top() {

  const navigate = useNavigate();

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
