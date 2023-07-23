import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { useRef, useEffect, useCallback, useState } from 'react';
import io from 'socket.io-client';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import { httpClient } from './httpClient.ts';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';



// socket.ioの初期化(socketをどのタイミングで作成するかは要検討)
const socket = io('http://localhost:3000');

function ChatRoom() {
  const navigate = useNavigate();

  if (!getCookie("token")) {
    window.location.href = "login";
    return null;
  }

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;
  const [avatarPath, setAvatarPath] = useState(import.meta.env.VITE_API_BASE_URL + "users/" + username + "/avatar");

	// ルーム情報の取得
	const location = useLocation();
	const roomId = location.state.room;

  // メッセージ表示用
  const [chatLog, setChatLog] = useState<Array<any>>([]); // chatLogの型をstring[]からany[]に変更します

  // チャットの履歴を取得する関数
  async function getChatHistory() {
    try {
      const response = await httpClient.get(`/message/${roomId}`);
      setChatLog(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the chat history:", error);
    }
  }
  
  // ページロード時にチャットの履歴を取得します
  useEffect(() => {
    getChatHistory();
  }, []);
  
	// socket初回接続時の処理
	useEffect(() => {
    socket.on('connect', () => {
      console.log('connected', socket.id);
		});
    
		// ルームへの参加
		socket.emit('joinRoom', roomId);
		
	}, []);
  
	// メッセージ入力用
	const inputRef = useRef(null);

	// socketメッセージ送信処理
  const submitMessage = useCallback(() => {
    if (inputRef.current.value === '')
      return;
      
      // json形式で送信
      const message = {
        channelId: roomId,
        content: inputRef.current.value,
      username: username,
      createdAt: Date.now(),
      contents_path: ""
    }
    // メッセージ入力欄の初期化
    inputRef.current.value = '';
    // メッセージ送信
    socket.emit('message', message);
    
    // HTTP POSTリクエストでDBにメッセージを保存
    httpClient.post('/message', {
      username: username,
      channelId: roomId,
      content: message.content,
      createdAt: new Date().toISOString()
    })
    .then((response) => {
      console.log("Message saved successfully:", response);
    })
    .catch((error) => {
      console.error("An error occurred while saving the message:", error);
    });
  }, []);
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [showUsers, setShowUsers] = useState(false);
  
  const handleClose = (event) => {
    if (event.target.textContent === "Add Users") {
      getUsersNotInChannel();
      setShowUsers(true);
    }
  
    setAnchorEl(null);
  };


	// メッセージ表示用
	const [msg, setMsg] = useState('');

	// socketメッセージ受信処理
	useEffect(() => {
		socket.on('update', (message: string) => {
			setMsg(message);
		});
	}, []);

	// メッセージ履歴の表示
	useEffect(() => {
		setChatLog([...chatLog, msg]);
	}, [msg]);


	// メッセージ履歴の最下部スクロール
	const chatLogRef = useRef(null);
	useEffect(() => {
		const chatLogElement = chatLogRef.current;
		chatLogElement.scrollTop = chatLogElement.scrollHeight;
	}, [chatLog]);


	// メッセージ送信ボタンのフォーカス
	const sendButtonRef = useRef(null);
	useEffect(() => {
		const handleKeyPress = (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				sendButtonRef.current.click();
			}
		};
	
		document.addEventListener('keydown', handleKeyPress);
	
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

  const [composing, setComposing] = useState(false);

  const handleCompositionStart = () => {
    setComposing(true);
  };

  const handleCompositionEnd = () => {
    setComposing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.isComposing && !composing) {
      event.preventDefault();
      submitMessage();
    }
  };

  //User一覧
  const [users, setUsers] = useState<Array<any>>([]);

  // ユーザー一覧を取得する関数
  async function getUsersNotInChannel() {
    try {
      const response = await httpClient.get(`/channels/${roomId}/usersNotInChannel`);
      console.log('response: ', response);
      setUsers(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the users not in channel:", error);
    }
  }

  const [search, setSearch] = useState('');  // 検索文字列の状態を追加

  // ユーザーをフィルタリングする関数
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const [page, setPage] = useState(0);  // 現在のページ番号の状態を追加
  const itemsPerPage = 10;  // 1ページあたりのアイテム数

  // ユーザーをフィルタリングとページングする関数
  const displayedUsers = filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // 選択されたユーザーを管理
  const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]);

// チェックボックスが変更されたときに選択されたユーザーを追加または削除
const handleToggleUser = (user) => {
  if (selectedUsers.includes(user)) {
    setSelectedUsers(selectedUsers.filter((u) => u !== user));
  } else {
    setSelectedUsers([...selectedUsers, user]);
  }
};

  const handleAddUser = async () => {
    // チャンネルにユーザーを追加
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          httpClient.post(`/channels/${roomId}/users`, {
            username: user.username,
          })
        )
      );
      console.log("Users added successfully.");
      // 通知メッセージを表示するなど、ここで成功時の処理を追加できます。
      // 状態をリセット
      setSelectedUsers([]);
      setUsers([]);
      setSearch('');
      setPage(0);
      setShowUsers(false);
    } catch (error) {
      console.error("An error occurred while adding the users to the channel:", error);
    }
  };

	return (
		<>
      <IconButton
      edge="start"
      color="inherit"
      aria-label="settings"
      sx={{
        position: 'fixed',
        left: 280, // 左端からの距離を280pxに設定
        top: 70, // 上端からの距離を70pxに設定
      }}
      onClick={handleClick}
    >
      <SettingsIcon />
    </IconButton>
    <Menu
      id="settings-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={handleClose}>Add Users</MenuItem>
      <MenuItem onClick={handleClose}>Add Administrators</MenuItem>
    </Menu>
			<Box
				sx={{
					width: 800,
					height: "80vh",
					display: "flex",
					flexDirection: "column",
					bgcolor: "primary.dark",
				}}
				>
				<Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }} ref={chatLogRef}>
					{chatLog.map((message, index) => (
						<Message key={index} message={message} myAccountUserId={username}/>
					))}
				</Box>
				<Box sx={{ p: 2, backgroundColor: "background.default" }}>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <Button
              variant="contained"
              endIcon={<ChatIcon />}
              onClick={() => navigate('/selectRoom')}
            >
              Back
            </Button>
          </Grid>
          <Grid item xs={8}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              inputProps={{
                ref: inputRef,
                onKeyDown: handleKeyDown,
                onCompositionStart: handleCompositionStart,
                onCompositionEnd: handleCompositionEnd,
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={submitMessage}
              ref={sendButtonRef}
            >
              Send
            </Button>
          </Grid>
        </Grid>
				</Box>
			</Box>
      <Dialog open={showUsers} onClose={() => setShowUsers(false)}>
        <DialogTitle>Choose users to add</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayedUsers.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleUser(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddUser} 
          disabled={selectedUsers.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Add User
        </Button>
      </Dialog>
		</>
	)
}

const Message = ({ message, myAccountUserId }) => {
  const [avatarPath, setAvatarPath] = useState("");
  
  // 自分のメッセージかどうか
  const isMine = message.username === myAccountUserId;

  useEffect(() => {
    const fetchAvatarPath = async () => {
      const avatarURL = import.meta.env.VITE_API_BASE_URL + "users/" + message.username + "/avatar";
      // avatarのpathを非同期で取得するロジックを書く
      setAvatarPath(avatarURL);
    };

    fetchAvatarPath();
  }, [message.username]);

	return (
		<>
			<Box
				sx={{
					display: "flex",
					justifyContent: isMine ? "flex-end" : "flex-start",
					mb: 2,
				}}
				>
				<Box
					sx={{
					display: "flex",
					flexDirection: isMine ? "row" : "row-reverse",
					alignItems: "center",
					}}
				>
					<Avatar src={avatarPath} />
					<Paper
						variant="outlined"
						sx={{
							p: 2,
							ml: isMine ? 1 : 0,
							mr: isMine ? 0 : 1,
							backgroundColor: isMine ? "primary.light" : "secondary.light",
							borderRadius: isMine ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
						}}
						>
						<Typography variant="body1">{message.content}</Typography>
					</Paper>
				</Box>
			</Box>
		</>
	);
};

export default ChatRoom