import { Button, TextField, Box } from '@mui/material';
import { getCookie, updateCookie } from './utils/HandleCookie.tsx';
import { httpClient } from './httpClient.ts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Tfa() {

	// auth code
	const [authCode, setAuthCode] = useState('');

	// エラーメッセージ
	const [errorMessage, setErrorMessage] = useState('');

	// ページ遷移用
	const navigate = useNavigate();

	// 二要素認証ログイン
	const handleCheckCode = () => {
		httpClient
			.post("/auth/2fa/authenticate", 
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
				updateCookie("token", response.data.access_token);
				navigate('/');
			})
			.catch(() => {
				console.log("error");
				setErrorMessage('Auth Code is wrong, please input the correct one.');
			});
	};

	const boxStyle = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	};

	return (
		<>
			<Box sx={{ ...boxStyle, width: 400 }}>
				<TextField id="authCode" label="Auth Code" variant="outlined" onChange={(e) => setAuthCode(e.target.value)}/>
				<Button variant="contained" color="success" size="large" sx={{m:5}} onClick={handleCheckCode}>Check code</Button>
				{errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
			</Box>
		</>
	)

}

export default Tfa
