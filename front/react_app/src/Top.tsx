import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

function Top() {

  return (
    <>
      <Paper sx={{ width: 320, maxWidth: '100%' }}>
        <MenuList>
          <MenuItem>
            <ListItemText>Chat</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText>Game</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemText>Account Information</ListItemText>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

export default Top
