import * as React from 'react';
import { ChangeEvent, useState, useEffect } from 'react';
import { FormControl, InputLabel, Input, FormHelperText, FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, OutlinedInput, InputAdornment, Box, Button } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import { useLocation } from 'react-router-dom';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import { useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { httpClient } from './httpClient.ts';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

function CreateRoom() {
  if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}
  const reqHeader = {
    headers: {
      Authorization: `Bearer ` + getCookie('token'),
      'Content-Type': 'application/json',
    },
  };
  const [roomType, setroomType] = useState("");
  const [accessLevel, setaccessLevel] = useState("");
  const [password, setPassword] = useState("");
  const [roomName, setRoomName] = useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState(''); // 検索文字列の状態を管理
  const [users, setUsers] = useState([]); // ユーザーの状態を管理
  const [page, setPage] = useState(0);  // 現在のページ番号の状態を追加
  const itemsPerPage = 10; // 1ページあたりのアイテム数
  const [selectedUser, setSelectedUser] = useState(null); // 選択されたユーザーの状態を管理

  const navigate = useNavigate();

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);

  const username = decoded.user.username;

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setroomType((event.target as HTMLInputElement).value);
  };

  const handleAccessChange = (event: ChangeEvent<HTMLInputElement>) => {
    setaccessLevel((event.target as HTMLInputElement).value);
  };

  // DMボタンのクリックハンドラ
  const handleDMButtonClick = () => {
    setDialogOpen(true);
  };
  
  // ダイアログのクローズハンドラ
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const isInputComplete = () => {
    return roomType === "room" && roomName && accessLevel && (accessLevel !== "protected" || password);
  };
  
  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  // 正規表現を使って、入力値が英語の文字または一部の記号であることを確認します。
  const handlePasswordChange = (event) => {
      const newValue = event.target.value;
       if (/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]*$/.test(newValue)) {
      setPassword(newValue);
      } else {
      alert("Passwords must be alphanumeric characters or some symbols");
      }
  };

  const handleCreateRoom = async () => {
    // 入力値を含むオブジェクト
    const data = {
      name: roomName,
      owner: username, // ここは適切な所有者名に置き換えてください
      isDM: false,
      isPublic: accessLevel === "public" || accessLevel === "protected",
      isProtected: accessLevel === "protected",
      password: password,
    };

    try {
      // POSTリクエストを送信
      const response = await httpClient.post('/channels', data);
    
      // レスポンスを受け取る
      const result = response.data;
    
      // 結果を表示（必要に応じて）
      console.log(result);
      navigate('/chatRoom', { state: { room: result.id } });
    } catch (error) {
      // axiosのエラーオブジェクトは、error.responseにレスポンス情報を持っています。
      // エラーハンドリング（ここではコンソールにエラーを表示）
      if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Server responded with status code:', error.response);
      } else {
        console.error('Error during room creation:', error);
      }
    }
  };
    

  //以下はDMの作成において必要な諸関数
  async function getUsers() {
    try {
      const response = await httpClient.get(`/users/${username}/users`, reqHeader);
      console.log('response: ', response);
      setUsers(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the users not in channel:", error);
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const displayedUsers = filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleToggleUser = (user) => {
    if (selectedUser && selectedUser.username === user.username) {
      setSelectedUser(null);  // すでに選択されているユーザーを再度クリックすると選択を解除
    } else {
      setSelectedUser(user);  // 新たなユーザーを選択
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      getUsers();
    }
  }, [dialogOpen]);

  const handleStartDM = async () => {
    try {
      const response = await httpClient.post(`/channels`, {
        name: `${username}-${selectedUser.username}`,
        owner: username,
        isDM: true,
        isPublic: false,
        isProtected: false,
        password: null,
        dmUser: selectedUser.username,
      }, reqHeader);
      console.log('response: ', response);
      navigate('/chatRoom', { state: { room: response.data.id } });
    } catch (error) {
      console.error("An error occurred while creating a DM:", error);
    }
    setDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormControl>
          
          {roomType === "room" && (
            <div>
                <InputLabel htmlFor="my-input">Room Name</InputLabel>
                <Input id="my-input" aria-describedby="my-helper-text" value={roomName} onChange={e => setRoomName(e.target.value)}/>
                <FormHelperText id="my-helper-text">Please input roomName.</FormHelperText>
            </div>
        )}
          
          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Room Type</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={roomType}
            onChange={handleTypeChange}
          >
            <FormControlLabel value="room" control={<Radio />} label="Room" />
            <FormControlLabel value="dm" control={<Radio />} label="DM" onClick={handleDMButtonClick} />
          </RadioGroup>

          {roomType === "room" && (
            <div>
              <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Access Level</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={accessLevel}
                onChange={handleAccessChange}
              >
                <FormControlLabel value="public" control={<Radio />} label="Public" />
                <FormControlLabel value="private" control={<Radio />} label="Private" />
                <FormControlLabel value="protected" control={<Radio />} label="Protected" />
              </RadioGroup>
            </div>
          )}
            {accessLevel === "protected" && roomType == "room" && (
            <div>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  label="Password"
                />
                <FormHelperText id="my-helper-text2">You can protect your channel by password</FormHelperText>
              </FormControl>
            </div>
          )}
        </FormControl>
      </Box>
      <Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/chat')} sx={{ m: 2 }}>
				Back
			</Button>
      <Button variant="contained" endIcon={<CheckIcon />} sx={{ m: 2 }} disabled={!isInputComplete()} onClick={handleCreateRoom}>
        Create
      </Button>
        <Dialog open={dialogOpen} onClose={() => handleDialogClose()}>
          <DialogTitle>Choose users to DM</DialogTitle>
          <TextField
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <RadioGroup value={selectedUser ? selectedUser.username : ""}>
            {displayedUsers.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
              <ListItem key={index}>
                <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
                <ListItemText primary={user.username} />
                <FormControlLabel 
                  value={user.username} 
                  control={<Radio color="primary" />} 
                  onChange={() => handleToggleUser(user)}
                  sx={{ mr: 0 }}
                />
              </ListItem>
            ))}
          </RadioGroup>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
            <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
            <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleStartDM}
            disabled={selectedUser === null}
            sx={{ mt: 2, mb: 2 }}
          >
            Start DM
          </Button>
        </Dialog>
    </>
  )
}

export default CreateRoom
