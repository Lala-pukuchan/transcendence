import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { useRef, useEffect, useCallback, useState } from 'react';
import io from 'socket.io-client';

// socket.ioの初期化(socketをどのタイミングで作成するかは要検討)
const socket = io('http://localhost:3000');

function ChatRoom() {

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

		if (inputRef.current.value === '')
			return;

		// json形式で送信
		const message = {
			room_id: roomId,
			chat_text: inputRef.current.value,
			user_id: userId,
			chat_time: Date.now(),
			contents_path: ""
		}
		// メッセージ入力欄の初期化
		inputRef.current.value = '';
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

	return (
		<>
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
						<Message key={index} message={message} myAccountUserId={userId}/>
					))}
				</Box>
				<Box sx={{ p: 2, backgroundColor: "background.default" }}>
					<Grid container spacing={2}>
					<Grid item xs={10}>
						<TextField
						size="small"
						fullWidth
						placeholder="Type a message"
						variant="outlined"
						inputRef={inputRef}
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
		</>
	)

}

const Message = ({ message, myAccountUserId }) => {

	// 自分のメッセージかどうか
	const isMine = message.user_id === myAccountUserId;

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
					<Avatar sx={{ bgcolor: isMine ? "primary.main" : "secondary.main" }}>
						{isMine ? "B" : "U"}
					</Avatar>
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
						<Typography variant="body1">{message.chat_text}</Typography>
					</Paper>
				</Box>
			</Box>
		</>
	);
};

export default ChatRoom