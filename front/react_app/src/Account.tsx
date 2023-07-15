import TransferList from './TransferList.tsx';
import { Divider, Avatar, FormControlLabel, Switch, Typography, Badge, Grid, Rating, IconButton, Button, Stack, Modal, Box, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { httpClient } from './httpClient.ts';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { getCookie } from './utils/GetCookie.tsx';
import './App.css'

function Account() {

	// apiパス
	const api = import.meta.env.VITE_API_BASE_URL;

	// tokenが無い場合、ログイン画面にリダイレクトさせる
	if (!getCookie("token")) {
		window.location.href = "login";
		return null;
	}

	// ユーザー名
	const username = localStorage.getItem('username');

	// 二要素認証
	const [tfaEnabled, setTfaEnabled] = useState(false);

	// ユーザー情報取得
	useEffect(() => {

		httpClient
			.get("/users/" + username)
			.then((response) => {
				console.log("response: ", response);
				setTfaEnabled(response.data.isEnabledTfa);
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
					console.log("response: ", response);
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
				console.log("response: ", response);
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
				console.log("response: ", response);
				setOpen(false);
				setTfaEnabled(true);
			})
			.catch(() => {
				console.log("error");
				setErrorMessage("Auth Code is wrong, please input the correct one");
			});
	};

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
				<Typography id="modal-modal-title" variant="h6" component="h2">My Account Information</Typography>
						<Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
						<Stack direction="row" spacing={2}>
							<IconButton
							color="primary"
							aria-label="upload picture"
							component="label"
							>
							<input hidden accept="image/*" type="file" />
							<PhotoCamera />
							</IconButton>
						</Stack>
						<p>Name: ○○○</p>
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
						<Typography component="legend">Game Rating</Typography>
						<Rating name="no-value" value={3} />
						<p>Win x/y</p>
					<Divider sx={{ m:3 }}>Add Friends</Divider>
						<TransferList sx={{ m:3 }}></TransferList>
					<Divider sx={{ m:3 }}>Friends List</Divider>	
						<Badge color="secondary" overlap="circular" badgeContent=" " variant="dot">
							<Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
						</Badge>
						<Badge color="secondary" overlap="circular" badgeContent=" " variant="dot">
							<Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
						</Badge>
						<Badge color="secondary" overlap="circular" badgeContent=" " variant="dot">
							<Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
						</Badge>
				</Grid>
			</Grid>
		</>
	)
}

export default Account
