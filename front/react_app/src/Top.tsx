import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { httpClient } from './httpClient.ts';

const socket = io(import.meta.env.VITE_API_BASE_URL);

function Top() {

  // ページ遷移用
  const navigate = useNavigate();

  // tokenが無い場合、ログイン画面にリダイレクトさせる
  const token = getCookie("token");
  if (!token) {
    window.location.href = "login";
    return null;
  }

  // tokenデコード
  const decoded = decodeToken(token);
  console.log('decoded: ', decoded);

  // 二要素認証が未検証の場合、二要素認証ログイン画面にリダイレクトさせる
  if (decoded.user.isEnabledTfa && decoded.isTwoFactorAuthenticated === undefined) {
    window.location.href = "tfa";
    return null;
  }

  // ユーザー情報取得機能
	useEffect(() => {
		httpClient
			.get("/users/" + decoded.user.username, { headers: { 'Authorization': 'Bearer ' + getCookie("token") }})
			.then((response) => {
				console.log("response(get userInfo): ", response);
        if (!response.data.completeSetUp) {
          console.log('Initial Setup is not completed.');
          window.location.href = "setup";
          return null;
        } else {
          console.log('Initial Setup is completed.');
        }
			})
			.catch(() => {
				console.log("error(get userInfo)");
			});
	}, []);

  // オンライン処理
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	useEffect(() => {
		socket.on('connect', () => {
			socket.emit('online', decoded.user.username);
			socket.on('onlineUsers', (message: string) => {
				setOnlineUsers(message);
			});
		});
	}, []);

  return (
    <>
      <Paper sx={{ width: 320, maxWidth: '100%' }}>
        <MenuList>
          <MenuItem onClick={() => navigate('/chat')}>
            <ListItemText>
              Chat
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => navigate('/game', { replace: true })}>
            <ListItemText>
              Game
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => navigate('/account', { state: { onlineUsers: onlineUsers } })}>
            <ListItemText>
              Account Information
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

export default Top
