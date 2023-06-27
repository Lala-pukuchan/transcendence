import { Button, Box, Grid, TextField, Paper, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import SendIcon from '@mui/icons-material/Send';
import { useRef, useEffect, useCallback, useState } from 'react';
import io from 'socket.io-client';

// socket.ioの初期化(socketをどのタイミングで作成するかは要検討)
const socket = io('http://localhost:3000');

function ChatRoom() {

	// ページ遷移用
	const navigate = useNavigate();

	// ルーム情報の取得
	const location = useLocation();
	const roomId = location.state.room;
	const userId = location.state.user;

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

		// json形式で送信
		const message = {
			text: inputRef.current.value,
			sender: userId,
			postedTime: Date().toLocaleString(),
		}

		// メッセージ送信
		socket.emit('message', message);

	}, []);

	// メッセージ表示用
	const [chatLog, setChatLog] = useState<string[]>([]);
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


	return (
		<>
			<Box sx={{ width: 800, height: '80vh', backgroundColor: 'primary.dark', display: 'flex', flexDirection: 'column'}} >
				<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
					<Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
						{chatLog.map((message, index) => (
							<Message key={index} message={message} myAccountUserId={userId}/>
						))}
					</Box>
				</Box>
			</Box>
			<Box sx={{ p: 2, backgroundColor: "background.default" }}>
				<Grid container spacing={2}>
					<Grid item xs={10}>
						<TextField id="outlined-basic" label="Outlined" variant="outlined" sx={{ width: 600 }} defaultValue="" inputRef={inputRef}/>
					</Grid>
					<Grid item xs={2}>
						<Button variant="contained" endIcon={<SendIcon />} sx={{ m: 2 }} onClick={submitMessage}>
							Send
						</Button>
					</Grid>
				</Grid>
			</Box>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/selectRoom')} sx={{ m: 2 }}>
				Return Back
			</Button>
		</>
	)

}

const Message = ({ message, myAccountUserId }) => {

	const isMine = message.sender === myAccountUserId;

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: isMine ? "flex-start" : "flex-end",
				mb: 2,
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					p: 1,
					backgroundColor: isMine ? "primary.light" : "secondary.light",
				}}
			>
				<Typography variant="body1">{message.text}</Typography>
			</Paper>
		</Box>
	);
};

export default ChatRoom