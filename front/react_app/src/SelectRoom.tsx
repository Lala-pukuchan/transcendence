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
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';


function channelsToRows(response: any): GridRowsProp {
  return response.data.map((channel: any) => ({
    id: channel.id.toString(),
    roomName: channel.name,
    isProtected: channel.isProtected,
    isDM: channel.isDM,
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
  const [notJoinedRows, setNotJoinedRows] = useState<GridRowsProp>([]);
  const [isJoined, setIsJoined] = useState(false);
	
  const navigate = useNavigate();

  if (!getCookie("token")) {
    window.location.href = "login";
    return null;
  }

  const reqHeader = {
    headers: {
      Authorization: `Bearer ` + getCookie('token'),
      'Content-Type': 'application/json',
    },
  };

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;

	const cols: GridColDef[] = [
    {
      field: 'roomName',
      width: 150,
      headerName: 'ルーム名'
    },
    {
      field: 'isProtected',
      headerName: 'パスワード',
      width: 150,
      renderCell: (params) => {
        if (params.value) {
          // パスワードが設定されている（isProtectedがtrue）場合は、鍵閉まっているアイコンを表示
          return <LockIcon />;
        } else {
          // パスワードが設定されていない（isProtectedがfalse）場合は、鍵開いているアイコンを表示
          return <LockOpenIcon />;
        }
      }
    },
    {
      field: 'isDM',
      headerName: 'DM',
      width: 150,
      renderCell: (params) => {
        if (params.value) {
          // DMが設定されている（isDMがtrue）場合は、スピーチバブルのアイコンを表示
          return <PersonIcon />;
        } else {
          // DMが設定されていない（isDMがfalse）場合は、エンベロープのアイコンを表示
          return <GroupIcon />;
        }
      }
    }
  ]

  useEffect(() => {
    // 参加しているチャンネル一覧を取得
    httpClient
      .get(`/users/${username}/channels`, reqHeader)
      .then((response) => {
        console.log("response is ", response);
        setRows(channelsToRows(response));
      })
      .catch((error) => {
        console.log("An error occurred:", error);
      });
  }, [username]);

  useEffect(() => {
    // 未参加のpublicチャンルーム一覧を取得
    httpClient
      .get(`/users/${username}/channels/not-members`, reqHeader)
      .then((response) => {
        console.log("response is ", response);
        setNotJoinedRows(channelsToRows(response));  // 結果をnotJoinedRowsに保存
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
    setIsJoined(true);
  };

  const handleEventNotJoined: GridEventListener<'rowClick'> = (params) => {
    setSelectedRoom(params.row);
    setRoomId(parseInt(params.id));
    setIsJoined(false);
  };

  const handlePasswordChange = (event) => {
    const newValue = event.target.value;
     if (/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]*$/.test(newValue)) {
    setInputPassword(newValue);
    } else {
    alert("Passwords must be alphanumeric characters or some symbols");
    }
};

  const handlePasswordSubmit = () => {
    httpClient
      .post(`/channels/${selectedRoom.id}/verifyPassword`, { password: inputPassword }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        if (response.data.isValid) {
          setOpenDialog(false);  // パスワードが検証された後にダイアログを閉じます
          if (!isJoined) {
            httpClient
              .post(`/channels/${selectedRoom.id}/users`, { username: username }, reqHeader)
              .then((response) => {
                console.log(response);  // レスポンスをログ出力
              })
            .catch((error) => {
              console.log("An error occurred in joining room:", error);
              alert("An error occurred in joining room");  // エラーメッセージを表示します
              return;
            });
          }
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

  const openChatRoom = () => {
    if (selectedRoom.isProtected) {
      setIsDialogOpen(true);
    } else {
      if (!isJoined) {
        httpClient
          .post(`/channels/${selectedRoom.id}/users`, { username: username }, reqHeader)
          .then((response) => {
            console.log(response);  // レスポンスをログ出力
          })
        .catch((error) => {
          console.log("An error occurred in joining room:", error);
          alert("An error occurred in joining room");  // エラーメッセージを表示します
          return;
        });
      }
      navigate('/chatRoom', { state: {room: roomId} });
    }
  };

	return (
		<>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%' }}>
            <Typography variant="h6" component="div">
              Joined Rooms
            </Typography>
            <DataGrid 
              rows={rows} 
              columns={cols}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10]}
              onRowClick={handleEvent}
            />
          </div>
          <div style={{ width: '45%' }}>
            <Typography variant="h6" component="div">
              Not Joined Public Rooms
            </Typography>
            <DataGrid 
              rows={notJoinedRows} 
              columns={cols}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10]}
              onRowClick={handleEventNotJoined}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/chat')} sx={{ m: 2, width: '25%' }}>
            Back
          </Button>
          <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom')} sx={{ m: 2, width: '25%' }}>
            Create Room
          </Button>
          <Button
            variant="contained"
            endIcon={<ChatIcon />}
            onClick={openChatRoom}
            sx={{ m: 2, width: '25%' }}
            disabled={roomId === 0}  // roomIdが0のとき、このボタンを無効化します
          >
            Start Chat
          </Button>
        </div>
      </div>
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
          onChange={handlePasswordChange}
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
		</>
	)
}
export default SelectRoom
