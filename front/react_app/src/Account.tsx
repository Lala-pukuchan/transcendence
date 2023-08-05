import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import TransferList from './TransferList.tsx';
import { Divider, Avatar, FormControlLabel, Switch, Typography, Badge, Grid, Rating, IconButton, Button, Stack, Modal, Box, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { httpClient } from './httpClient.ts';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import EditIcon from '@mui/icons-material/Edit';
import './App.css';
import io from 'socket.io-client';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const socket = io(import.meta.env.VITE_API_BASE_URL);

function Account() {

	// tokenが無い場合、ログイン画面にリダイレクトさせる
	if (!getCookie("token")) {
		window.location.href = "login";
		return null;
	}

	// jwt tokenのデコード
	const decoded = decodeToken(getCookie("token"));

	// ユーザー名
	const username = decoded.user.username;

	// 二要素認証
	const [tfaEnabled, setTfaEnabled] = useState(false);

	// アバター
	const [avatarPath, setAvatarPath] = useState(import.meta.env.VITE_API_BASE_URL + "users/" + username + "/avatar");

	// ディスプレイ名
	const [displayName, setDisplayName] = useState('');

	// オンラインユーザー一覧取得
	const location = useLocation();
	const [onlineUsers, setOnlineUsers] = useState<string[]>(location.state?.onlineUsers || []);
	const [onlineGameUsers, setOnlineGameUsers] = useState<string[]>(location.state?.onlineGameUsers || []);

	useEffect(() => {
		socket.on('connect', () => {
			console.log('connect');
			socket.emit('online', username);
			socket.on('onlineUsers', (message: string) => {
				console.log('onlineUsers', message);
				setOnlineUsers(message);
			});
			socket.on('onlineGameUsers', (message: string) => {
				console.log('onlineGameUsers', message);
				setOnlineGameUsers(message);
			});
		});
	}, []);

	// ゲーム情報
	const [level, setLevel] = useState(0);
	const [star, setStar] = useState(0);
	const [win, setWin] = useState(0);
	const [lose, setLose] = useState(0);

	// フレンズ情報
	const [friendsList, setFriendsList] = useState([]);
	const [notFriendsList, setNotFriendsList] = useState([]);

	// ユーザー情報取得
	useEffect(() => {

		httpClient
			.get("/users/" + username, { headers: { 'Authorization': 'Bearer ' + getCookie("token") }})
			.then((response) => {
				console.log("response(get userInfo): ", response);
				if (response.data.isEnabledTfa)
					setTfaEnabled(response.data.isEnabledTfa);
				setDisplayName(response.data.displayName);
				setLevel(response.data.ladderLevel / 100);
				setStar(response.data.ladderLevel / 100);
				setWin(response.data.wins);
				setLose(response.data.losses);
				if (response.data.friends)
					setFriendsList(response.data.friends);
				if (response.data.notFriends)
					setNotFriendsList(response.data.notFriends);
			})
			.catch(() => {
				console.log("error");
			});
	}, []);

	// Modal
	const modalStyle = {
		position: 'absolute' as 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,
		bgcolor: 'background.paper',
		border: '2px solid #000',
		boxShadow: 24,
		pt: 2,
		px: 4,
		pb: 3,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	};
	const [open, setOpen] = useState(false);
	const handleModalClose = () => {
		setOpen(false);
	};

	// 二要素認証設定更新
	const [qrCode, setQrCode] = useState("");
	const handleSwitchChange = async (event) => {
		const { checked } = event.target;
		if (checked) {
			// QRコード生成
			httpClient
				.post("/auth/2fa/generate", null, { headers: { 'Authorization': 'Bearer ' + getCookie("token") }})
				.then((response) => {
					console.log("response(generate 2fa qrcode): ", response);
					setQrCode(response.data);
				})
				.catch(() => {
					console.log("error");
				});
			setOpen(true);
		} else {
			// 二要素認証OFF
			setOpen(false);
			httpClient
			.post("/auth/2fa/turn-off", 
			null,
			{
				headers: {
					'Authorization': 'Bearer ' + getCookie("token"),
				}
			})
			.then((response) => {
				console.log("response(turn off 2fa): ", response);
				setTfaEnabled(false);
			})
			.catch(() => {
				console.log("error");
			});
		}
	};

	// 二要素認証コード検証
	const [authCode, setAuthCode] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const handleCheckCode = () => {
		console.log('Auth Code:', authCode);
		httpClient
			.post("/auth/2fa/turn-on", 
			{
				"twoFactorAuthenticationCode": authCode
			},
			{
				headers: {
					'Authorization': 'Bearer ' + getCookie("token"),
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				console.log("response(turn on 2fa): ", response);
				setOpen(false);
				setTfaEnabled(true);
				setErrorMessage('');
			})
			.catch(() => {
				console.log("error");
				setErrorMessage("Auth Code is wrong, please input the correct one.");
			});
	};

	// アバター画像アップロード
	const handleFileUpload = (event) => {

		// アップロード画像取得
		const file = event.target.files[0];
		const formData = new FormData();
		formData.append("avatar", file);

		// アバター画像アップロードAPI
		httpClient
			.post("/users/" + username + "/avatar",
				formData,
				{ 
					headers: {
						'Authorization': 'Bearer ' + getCookie("token"),
						"Content-Type": "multipart/form-data",
					}
				})
			.then((response) => {
				console.log("response(upload avatar): ", response);
			})
			.catch(() => {
				console.log("error");
			});

		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatarPath(reader.result);
		};
		reader.readAsDataURL(file);
	};

	// ディスプレイ名更新機能
	const [openDn, setOpenDn] = useState(false);
	const handleClickOpen = () => {
		setOpenDn(true);
	};
	const handleClose = () => {
		setOpenDn(false);
	};
	const [newDisplayName, setNewDisplayName] = useState('');
	const handleDisplayNameChange = (event) => {
		setNewDisplayName(event.target.value);
	};
	const [errorMessageDn, setErrorMessageDn] = useState('');
	const submitDn = (event) => {
		httpClient
			.patch("/users/" + username, 
			{
				"displayName": newDisplayName
			},
			{
				headers: {
					'Authorization': 'Bearer ' + getCookie("token"),
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				console.log("response(change displayname): ", response);
				setOpenDn(false);
				setDisplayName(newDisplayName);
				setErrorMessageDn('');
			})
			.catch(() => {
				console.log("error");
				setErrorMessageDn("DisplayName is duplicated. Please input another one.");
			});
	};

	// 対戦履歴
	const columns: GridColDef[] = [
		{ field: 'createdAt', headerName: 'createdAt' },
		{
			field: 'user1.displayName',
			headerName: 'user1',
			valueGetter: (params) => params.row.user1?.displayName || 'N/A',
			renderCell: (params) => (
			  <Link to={`/simpleAccount/${params.row.user1?.username}`}>
				{params.row.user1?.displayName || 'N/A'}
			  </Link>
			),
		},
		{ field: 'score1', headerName: 'score1', type: 'number'},
		{ field: 'result1', headerName: 'result1' },
		{
			field: 'user2.displayName',
			headerName: 'user2',
			valueGetter: (params) => params.row.user2?.displayName || 'N/A',
			renderCell: (params) => (
				<Link to={`/simpleAccount/${params.row.user2?.username}`}>
				  {params.row.user2?.displayName || 'N/A'}
				</Link>
			),
		},
		{ field: 'score2', headerName: 'score2', type: 'number' },
		{ field: 'result2', headerName: 'result2' },
	];
	const [rows, setRows] = useState([]);
	useEffect(() => {
		httpClient
			.get("/games/user/" + username + "/match-history", { headers: { 'Authorization': 'Bearer ' + getCookie("token") }})
			.then((response) => {
				console.log("response(match history): ", response);
				setRows(response.data);
			})
			.catch(() => {
				console.log("error");
			});
	}, []);

	return (
		<>
			<Grid
				container
				spacing={0}
				direction="column"
				alignItems="center"
				justifyContent="center"
				sx={{ minHeight: '100vh' }}
				>
				<Grid item xs={3}>
				<Divider sx={{ m:3 }}>
					<Typography variant="body1" fontWeight="bold">
						My Account Information
					</Typography>
				</Divider>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Avatar alt={username} src={avatarPath} sx={{ width: 100, height: 100 }}/>
						<Stack direction="row" spacing={2}>
							<IconButton
								color="primary"
								aria-label="upload picture"
								component="label"
							>
								<input hidden accept="image/*" type="file" onChange={handleFileUpload}/>
								<PhotoCamera />
							</IconButton>
						</Stack>
						<div style={{ display: 'inline' }}>
							<p style={{ display: 'inline' }}>Name: {displayName}</p>
							<button style={{ display: 'inline-block', marginLeft: '5px', paddingTop: '0px', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '0px' }} onClick={handleClickOpen}>
								<EditIcon />
							</button>
						</div>
						<Dialog open={openDn} onClose={handleClose}>
							<DialogTitle>Edit DisplayName</DialogTitle>
							<DialogContent sx={{ width: 400 }}>
								<DialogContentText>
									Please input displaName
								</DialogContentText>
								{errorMessageDn && <div style={{ color: 'red' }}>{errorMessageDn}</div>}
								<TextField
									autoFocus
									margin="dense"
									id="name"
									label="Display Name"
									variant="standard"
									value={newDisplayName}
									onChange={handleDisplayNameChange}
								/>
							</DialogContent>
							<DialogActions>
							<Button onClick={handleClose}>Cancel</Button>
							<Button onClick={submitDn}>Submit</Button>
							</DialogActions>
						</Dialog>
					</div>
					<Divider sx={{ m:3 }}>Two Factor Authentication</Divider>
						<FormControlLabel control={<Switch checked={tfaEnabled} />} onChange={handleSwitchChange} label="Enable TFA" />
						<Modal
							open={open}
							onClose={handleModalClose}
							aria-labelledby="modal-modal-title"
							aria-describedby="modal-modal-description"
							>
							<Box sx={{ ...modalStyle, width: 400 }}>
								<Typography id="modal-modal-title" variant="h6" component="h2">
									Scan QrCode by Google Authenticator
								</Typography>
								<img src={qrCode} alt="Image" />
								<TextField id="authCode" label="Auth Code" variant="outlined" onChange={(e) => setAuthCode(e.target.value)}/>
								<Button sx={{m:5}} onClick={handleCheckCode}>Check code</Button>
								{errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
							</Box>
						</Modal>
					<Divider sx={{ m:3 }}>Pong Game</Divider>
						<Box sx={{ m:3 }}>
							<Typography component="legend">- Ladder Level -</Typography>
							<Typography component="legend">Lv. {level}</Typography>
						</Box>
						<Box sx={{ m:3 }}>
							<Typography component="legend">- Achievement -</Typography>
							<Rating name="no-value" value={star} />
						</Box>
						<Box sx={{ m:3 }}>
							<Typography component="legend">- Count -</Typography>
							<Typography component="legend">win: {win}</Typography>
							<Typography component="legend">lose: {lose}</Typography>
						</Box>
						<Box sx={{ m:3 }}>
							<Typography component="legend">- Match History -</Typography>
							<DataGrid
							 	sx={{ m:3 }}
								rows={rows}
								columns={columns}
								initialState={{
									pagination: {
										paginationModel: { page: 0, pageSize: 5 },
									},
								}}
								pageSizeOptions={[5, 10]}
							/>
						</Box>
					<Divider sx={{ m:3 }}>Friends</Divider>
						<Typography component="legend" sx={{ m:3 }}>- Add/Remove Friends -</Typography>	
							<TransferList sx={{ m:3 }} friendsList={friendsList} notFriendsList={notFriendsList} username={username}></TransferList>
						<Typography component="legend" sx={{ m:3 }}>- Friends Online/Offline Status -</Typography>
							<Box>
								{friendsList.map((friend) => (
									<Badge
										key={friend.username}
										color="secondary"
										overlap="circular"
										badgeContent=" "
										variant="dot"
										sx={{
											"& .MuiBadge-badge": {
												backgroundColor: onlineUsers.includes(friend.username) ? 'green' : 'gray',
											},
											"& .MuiBadge-badge.MuiBadge-dot": {
												boxShadow: onlineGameUsers.includes(friend.username) ? '0 0 0 2px #fff' : 'none',
											},
										}}
									>
									<Avatar alt={friend.username} src={friend.avatar} sx={{ m:0.1 }}/>
									</Badge>
								))}
							</Box>
				</Grid>
			</Grid>
		</>
	)
}

export default Account
