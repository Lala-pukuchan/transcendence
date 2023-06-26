import { Button, Box, Typography, Grid, Paper, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UndoIcon from '@mui/icons-material/Undo';
import SendIcon from '@mui/icons-material/Send';

function ChatRoom() {

	const navigate = useNavigate();

	const messages = [
		{ id: 1, text: "Hi there!", sender: "I" },
		{ id: 2, text: "Hello!", sender: "user" },
		{ id: 3, text: "How can I assist you today?", sender: "I" },
		{ id: 4, text: "Nothing", sender: "user" },
	];

	return (
		<>
			<Box
				sx={{
					width: 800,
					height: '80vh',
					backgroundColor: 'primary.dark',
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
					<Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
						{messages.map((message) => (
							<Message key={message.id} message={message} />
						))}
					</Box>
				</Box>
			</Box>
			<Box sx={{ p: 2, backgroundColor: "background.default" }}>
				<Grid container spacing={2}>
					<Grid item xs={10}>
						<TextField id="outlined-basic" label="Outlined" variant="outlined" sx={{ width: 600}}/>
					</Grid>
					<Grid item xs={2}>
						<Button variant="contained" endIcon={<SendIcon />} sx={{ m: 2 }}>
							Send
						</Button>
					</Grid>
				</Grid>
			</Box>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/selectRoom')} sx={{ m: 2 }}>
				Return Back
			</Button>
		</>
	)
}

const Message = ({ message }) => {

	// change to my user account
	const isMine = message.sender === "I";

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: isMine ? "flex-start" : "flex-end",
				mb: 2,
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					p: 1,
					backgroundColor: isMine ? "primary.light" : "secondary.light",
				}}
			>
				<Typography variant="body1">{message.text}</Typography>
			</Paper>
		</Box>
	);
};
export default ChatRoom