import Button from '@mui/material/Button';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';


function Chat() {

    const navigate = useNavigate();

  return (
    <>
        <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom')}>
            Create Room
        </Button>
        <Button variant="contained" endIcon={<ChatIcon />} onClick={() => navigate('/selectRoom')}>
            Select Room
        </Button>
    </>
  )
}
export default Chat
