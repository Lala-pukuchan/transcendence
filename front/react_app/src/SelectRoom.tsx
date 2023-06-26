import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import ChatIcon from '@mui/icons-material/Chat';

function SelectRoom() {

    const navigate = useNavigate();

	const rows: GridRowsProp = [
		{ id: 1, roomName: 'DM_personA_personB', roomType1: 'DM', roomType2: 'Public' },
		{ id: 2, roomName: 'DM_personA_personC', roomType1: 'DM', roomType2: 'Private' },
		{ id: 3, roomName: 'DM_personA_personD', roomType1: 'DM', roomType2: 'Protected' },
		{ id: 4, roomName: 'roomD', roomType1: 'Room', roomType2: 'Public' },
		{ id: 5, roomName: 'roomE', roomType1: 'Room', roomType2: 'Private' },
		{ id: 6, roomName: 'roomF', roomType1: 'Room', roomType2: 'Protected' }
	]

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
		{
			field: 'roomType1',
			width: 200,
			headerName: 'ルーム種別１'
		},
		{
			field: 'roomType2',
			width: 200,
			headerName: 'ルーム種別２'
		}
	]

  return (
    <>
		<DataGrid
			rows={rows}
			columns={cols}
			initialState={{
				pagination: {
					paginationModel: { page: 0, pageSize: 10 },
				},
			}}
			pageSizeOptions={[5, 10]}
			checkboxSelection
		/>
        <Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/chat')} sx={{ m: 2 }}>
            Return Back
        </Button>
		<Button variant="contained" endIcon={<ChatIcon />} onClick={() => navigate('/chatRoom')} sx={{ m: 2 }}>
            Start Chat
        </Button>
    </>
  )
}
export default SelectRoom