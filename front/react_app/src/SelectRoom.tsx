import { Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import { DataGrid, GridColDef, GridRowsProp, GridEventListener } from '@mui/x-data-grid';
import ChatIcon from '@mui/icons-material/Chat';
import { useState, useEffect } from 'react';
import { httpClient } from './httpClient.ts';
import { Room } from '../model/room.model';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import AddCommentIcon from '@mui/icons-material/AddComment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function channelsToRows(response: any): GridRowsProp {
  return response.data.map((channel: any) => ({
    id: channel.id.toString(),
    roomName: channel.name,
    isProtected: channel.isProtected,
  }));
}

function SelectRoom() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [roomId, setRoomId] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [inputPassword, setInputPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
	
  const navigate = useNavigate();

  if (!getCookie("token")) {
    window.location.href = "login";
    return null;
  }

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;

	const cols: GridColDef[] = [
		{
			field: 'id',
			headerName: '選択ルーム',
		},
		{
			field: 'roomName',
			width: 200,
			headerName: 'ルーム名'
		},
	]

	useEffect(() => {
    httpClient
      .get(`/users/${username}/channels`)
      .then((response) => {
        console.log("response is ", response);
        setRows(channelsToRows(response));
      })
      .catch((error) => {
        console.log("An error occurred:", error);
      });
  }, [username]);
	
	console.log("rows are ", rows);

	// 行をクリックしたときのイベント
  const handleEvent: GridEventListener<'rowClick'> = (params) => {
    setSelectedRoom(params.row);
    setRoomId(parseInt(params.id));
  };

  const handlePasswordSubmit = () => {
    httpClient
      .post(`/channels/${selectedRoom.id}/verifyPassword`, { password: inputPassword })
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        if (response.data.isValid) {
          setOpenDialog(false);  // パスワードが検証された後にダイアログを閉じます
          navigate('/chatRoom', { state: {room: roomId} });
        } else {
          // パスワードが間違っている場合、ここでエラーメッセージを表示します
          alert("パスワードが間違っています");
        }
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while verifying the password");  // エラーメッセージを表示します
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  


	return (
		<>
			<DataGrid 
				rows={rows} columns={cols}
				initialState={{
					pagination: {
						paginationModel: { page: 0, pageSize: 10 },
					},
				}}
				pageSizeOptions={[5, 10]}
				onRowClick={handleEvent}
			/>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
      <DialogTitle>Password Required</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Password"
          type={showPassword ? "text" : "password"}  // showPasswordの値によりタイプを動的に変更します
          fullWidth
          variant="standard"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          InputProps={{  // このプロパティでエンドアドーンメントを追加します
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePasswordSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/chat')} sx={{ m: 2 }}>
				Back
			</Button>
      <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom')}>
        Create Room
      </Button>
      <Button
        variant="contained"
        endIcon={<ChatIcon />}
        onClick={() => {
          if (selectedRoom.isProtected) {
            setIsDialogOpen(true);
          } else {
            navigate('/chatRoom', { state: {room: roomId} });
          }
        }}
        sx={{ m: 2 }}
        disabled={roomId === 0}  // roomIdが0のとき、このボタンを無効化します
      >
        Start Chat
      </Button>
		</>
	)
}
export default SelectRoom
