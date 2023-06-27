import { Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import { DataGrid, GridColDef, GridRowsProp, GridEventListener } from '@mui/x-data-grid';
import ChatIcon from '@mui/icons-material/Chat';
import { useState, useEffect } from 'react';
import { httpClient } from './httpClient.ts';
import { Room } from '../model/room.model';

function roomsToRows(response: any): GridRowsProp {
	return response.data.Rooms.map((room: Room) => ({
	  id: room.id.toString(),
	  roomName: room.name
	}));
}

function SelectRoom() {

	const navigate = useNavigate();

	// ユーザー情報の取得
	const location = useLocation();
	const userId = location.state;

	// const rows: GridRowsProp = [
	// 	{ id: 1, roomName: 'DM_personA_personB', roomType1: 'DM', roomType2: 'Public' },
	// 	{ id: 2, roomName: 'DM_personA_personC', roomType1: 'DM', roomType2: 'Private' },
	// 	{ id: 3, roomName: 'DM_personA_personD', roomType1: 'DM', roomType2: 'Protected' },
	// 	{ id: 4, roomName: 'roomD', roomType1: 'Room', roomType2: 'Public' },
	// 	{ id: 5, roomName: 'roomE', roomType1: 'Room', roomType2: 'Private' },
	// 	{ id: 6, roomName: 'roomF', roomType1: 'Room', roomType2: 'Protected' }
	// ]
	const [rows, setRows] = useState<GridRowsProp>([]);

	const [roomId, setRoomId] = useState(0);

	const cols: GridColDef[] = [
		{
			field: 'id',
			headerName: '選択ルーム',
		},
		{
			field: 'roomName',
			// width: 200,
			headerName: 'ルーム名'
		},
		// {
		// 	field: 'roomType1',
		// 	width: 200,
		// 	headerName: 'ルーム種別１'
		// },
		// {
		// 	field: 'roomType2',
		// 	width: 200,
		// 	headerName: 'ルーム種別２'
		// }
	]

	useEffect(() => {
		// データ取得のAPIリクエスト
		// const fetchRows = async () => {
		// 	await httpClient
		// 			.get("/rooms")
		// 			.then((response) => {
		// 				console.log("response is ", response);
		// 				// 取得したデータをrowsとしてセット
		// 				console.log("body is ", response.data);
		// 				setRows(response.data.Rooms.map((room: Room) => ({
		// 					id: room.id.toString(),
		// 					roomName: room.name
		// 				})));
		// 			})
		// 	  		.catch(() => {
		// 				console.log("error");
		// 			});
		// };
		// fetchRows();
		httpClient
			.get("/rooms")
			.then((response) => {
				console.log("response is ", response);
				console.log("body is ", response.data);
				setRows(roomsToRows(response));
			})
			.catch(() => {
				console.log("error");
			});
	}, []);
	
	console.log("rows are ", rows);

	// 行をクリックしたときのイベント
	const handleEvent: GridEventListener<'headerSelectionCheckboxChange'> = (
		params
	) => {
		setRoomId(params.row.id);
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
				Return Back
			</Button>
			<Button variant="contained" endIcon={<ChatIcon />} onClick={() => navigate('/chatRoom', { state: {room: roomId, user: userId} })} sx={{ m: 2 }}>
				Start Chat
			</Button>
		</>
	)
}
export default SelectRoom
