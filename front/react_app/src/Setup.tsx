import { useState, useEffect } from 'react';
import { Divider, Avatar, Typography, Grid, IconButton, Button, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { httpClient } from './httpClient.ts';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import './App.css';

const api_url = import.meta.env.VITE_API_BASE_URL;

function Setup() {

	// jwt tokenのデコード
	const decoded = decodeToken(getCookie("token"));

	// ユーザー名の取得
	const username = decoded.user.username;

	// アバター画像の取得
	const [avatarPath, setAvatarPath] = useState(api_url + "users/" + username + "/avatar");

	// ディスプレイ名の設定
	const [displayName, setDisplayName] = useState('');

	// ページ遷移用設定
	const navigate = useNavigate();

	// ユーザー情報取得機能
	useEffect(() => {
		httpClient
			.get("/users/" + username, { headers: { 'Authorization': 'Bearer ' + getCookie("token") }})
			.then((response) => {
				console.log("response(get userInfo): ", response);
				setDisplayName(response.data.displayName);
			})
			.catch(() => {
				console.log("error");
			});
	}, []);

	// アバター画像更新機能
	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		const formData = new FormData();
		formData.append("avatar", file);

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
		setNewDisplayName('');
		setErrorMessageDn('');
	};
	const [newDisplayName, setNewDisplayName] = useState('');
	const handleDisplayNameChange = (event) => {
		setNewDisplayName(event.target.value);
	};
	const [errorMessageDn, setErrorMessageDn] = useState('');
	const submitDn = (event) => {
		if (newDisplayName === '') {
			console.log('error: DisplayName is empty.');
			setErrorMessageDn("DisplayName is empty. Please input the correct one.");
		} else {
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
		}
	};

	const completeSetup = (event) => {
		httpClient
			.patch("/users/" + username + "/completeSetup",
			{
				"completeSetup": true
			},
			{
				headers: {
					'Authorization': 'Bearer ' + getCookie("token"),
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				console.log("response(complete setup): ", response);
				navigate('/');
			})
			.catch(() => {
				console.log("error(complete setup)");
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
					<Divider sx={{ m:3 }}>
						<Typography variant="body1" fontWeight="bold">
							Initial Setup
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
						<Button onClick={completeSetup} variant="contained" color="success" sx={{ m:5 }}>Complete Setup</Button>
					</div>
				</Grid>
			</Grid>
		</>
	)
}

export default Setup
