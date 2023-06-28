import TransferList from './TransferList.tsx';
import { Divider, Avatar, FormGroup, FormControlLabel, Switch, Typography, Badge, Grid, Rating, IconButton, Stack } from '@mui/material';

import PhotoCamera from "@mui/icons-material/PhotoCamera";
function Account() {

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
				<Divider sx={{ m:3 }}>My Account Information</Divider>
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
						<FormGroup>
							<FormControlLabel control={<Switch defaultChecked />} label="Enable TFA" />
						</FormGroup>
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
