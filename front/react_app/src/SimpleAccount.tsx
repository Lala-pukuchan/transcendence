import { useState, useEffect } from 'react';
import { Divider, Avatar, Typography, Grid, Rating, Box } from '@mui/material';
import { httpClient } from './httpClient.ts';
import { getCookie } from './utils/HandleCookie.tsx';
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SimpleAccount() {
	const reqHeader = {
		headers: {
		  Authorization: `Bearer ` + getCookie('token'),
		  'Content-Type': 'application/json',
		},
	};

	const navigate = useNavigate();

	// ユーザー名
	const { username } = useParams();
	if (username === '') {
		return null;
	}

	// tokenが無い場合、ログイン画面にリダイレクトさせる
	if (!getCookie("token")) {
		window.location.href = "login";
		return null;
	}

	// アバター
	const [avatarPath, setAvatarPath] = useState(import.meta.env.VITE_API_BASE_URL + "users/" + username + "/avatar");

	// ディスプレイ名
	const [displayName, setDisplayName] = useState('');

	// ゲーム情報
	const [level, setLevel] = useState(0);
	const [star, setStar] = useState(0);
	const [win, setWin] = useState(0);
	const [lose, setLose] = useState(0);

	// ユーザー情報取得
	useEffect(() => {

		httpClient
			.get("/users/" + username, reqHeader)
			.then((response) => {
				console.log("response(get userInfo): ", response);
				setDisplayName(response.data.displayName);
				setLevel(response.data.ladderLevel / 100);
				setStar(response.data.ladderLevel / 100);
				setWin(response.data.wins);
				setLose(response.data.losses);
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
						Account Information
					</Typography>
				</Divider>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Avatar alt={username} src={avatarPath} sx={{ width: 100, height: 100 }}/>
						<div style={{ display: 'inline' }}>
							<p style={{ display: 'inline' }}>Name: {displayName}</p>
						</div>
					</div>
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
						<Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate(-1)}
                sx={{ m:3 }}
            >
                Back
            </Button>
				</Grid>
			</Grid>
		</>
	)
}

export default SimpleAccount
