import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useRef, useEffect, useCallback, useState } from 'react';
import UndoIcon from '@mui/icons-material/Undo';
import { useNavigate, useLocation } from 'react-router-dom';

function Game() {

	const navigate = useNavigate();



	
	const stopperRef = useRef(null);
	function handleRestart() {
		// if (stopperRef.current) {
		// 	stopperRef.current.reset(); 
		// 	console.log("restart");
		// }
		console.log("restart");
	}

	return (
		<>
			<h2>Game</h2>
			<div className="App">
				<h2>Pong</h2>

				{/* <div className="result">{this.printResult()}</div> */}
					<div className="container">
						<div className="gameField">
						{/* <div
							className="ball"
							style={{
								top: this.state.ballPosition.y,
								left: this.state.ballPosition.x
							}}
						/> */}
						{/* <div className="midLine" /> */}
						{/* <div className="player1" style={{ top: this.state.p1 }} />
						<div className="player2" style={{ top: this.state.p2 }} /> */}

						</div>
					</div>
					<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/')} sx={{ m: 2 }}>
						Return Back
					</Button>
					<Button variant="contained" endIcon={<UndoIcon />} onClick={handleRestart} sx={{ m: 2 }}>restart</Button>
			</div>
		</>
	)
}

export default Game




