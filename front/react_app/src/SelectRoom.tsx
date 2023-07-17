import { Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import { DataGrid, GridColDef, GridRowsProp, GridEventListener } from '@mui/x-data-grid';
import ChatIcon from '@mui/icons-material/Chat';
import { useState, useEffect } from 'react';
import { httpClient } from './httpClient.ts';
import { Room } from '../model/room.model';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import AddCommentIcon from '@mui/icons-material/AddComment';

function channelsToRows(response: any): GridRowsProp {
	return response.data.map((channel: any) => ({
	  id: channel.id.toString(),
	  roomName: channel.name
	}));
}

function SelectRoom() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [roomId, setRoomId] = useState(0);
	
  const navigate = useNavigate();

  if (!getCookie("token")) {
    window.location.href = "login";
    return null;
  }

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;

	const cols: GridColDef[] = [
		{
			field: 'id',
			headerName: '選択ルーム',
		},
		{
			field: 'roomName',
			width: 200,
			headerName: 'ルーム名'
		},
	]

	useEffect(() => {
    httpClient
      .get(`/users/${username}/channels`)
      .then((response) => {
        console.log("response is ", response);
        setRows(channelsToRows(response));
      })
      .catch((error) => {
        console.log("An error occurred:", error);
      });
  }, [username]);
	
	console.log("rows are ", rows);

	// 行をクリックしたときのイベント
	const handleEvent: GridEventListener<'rowClick'> = (params) => {
    setRoomId(parseInt(params.id));
  };

	return (
		<>
			<DataGrid 
				rows={rows} columns={cols}
				initialState={{
					pagination: {
						paginationModel: { page: 0, pageSize: 10 },
					},
				}}
				pageSizeOptions={[5, 10]}
				onRowClick={handleEvent}
			/>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/chat')} sx={{ m: 2 }}>
				Back
			</Button>
      <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom')}>
        Create Room
      </Button>
			<Button
        variant="contained"
        endIcon={<ChatIcon />}
        onClick={() => navigate('/chatRoom', { state: {room: roomId} })}
        sx={{ m: 2 }}
        disabled={roomId === 0}  // roomIdが0のとき、このボタンを無効化します
      >
        Start Chat
      </Button>
		</>
	)
}
export default SelectRoom
