import Button from '@mui/material/Button';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCookie } from './utils/HandleCookie';

function Chat() {
  if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}

  const navigate = useNavigate();

  // ルーム情報の取得
	const location = useLocation();
	const userId = location.state;

  return (
    <>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ m:3 }}
        >
        Back Home
        </Button>
        <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom', { state: userId })}>
            Create Room
        </Button>
        <Button variant="contained" endIcon={<ChatIcon />} onClick={() => navigate('/selectRoom', { state: userId })}>
            Select Room
        </Button>
    </>
  )
}
export default Chat
