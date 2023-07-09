import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useRef, useEffect, useCallback, useState } from 'react';
import UndoIcon from '@mui/icons-material/Undo';
import { useNavigate, useLocation } from 'react-router-dom';

// function Game() {

// 	const navigate = useNavigate();



	
// 	const stopperRef = useRef(null);
// 	function handleRestart() {
// 		// if (stopperRef.current) {
// 		// 	stopperRef.current.reset(); 
// 		// 	console.log("restart");
// 		// }
// 		console.log("restart");
// 	}

// 	return (
// 		<>
// 			<h2>Game</h2>
// 			<div className="App">
// 				<h2>Pong</h2>

// 				{/* <div className="result">{this.printResult()}</div> */}
// 					<div className="container">
// 						<div className="gameField">
// 						{/* <div
// 							className="ball"
// 							style={{
// 								top: this.state.ballPosition.y,
// 								left: this.state.ballPosition.x
// 							}}
// 						/> */}
// 						{/* <div className="midLine" /> */}
// 						{/* <div className="player1" style={{ top: this.state.p1 }} />
// 						<div className="player2" style={{ top: this.state.p2 }} /> */}

// 						</div>
// 					</div>
// 					<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/')} sx={{ m: 2 }}>
// 						Return Back
// 					</Button>
// 					<Button variant="contained" endIcon={<UndoIcon />} onClick={handleRestart} sx={{ m: 2 }}>restart</Button>
// 			</div>
// 		</>
// 	)
// }

function Game() {

	const canvasRef = useRef(null);
	const contextRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;
	canvas.width = 1400;
	canvas.height = 1000;

	canvas.style.width = (canvas.width / 2) + 'px';
	canvas.style.height = (canvas.height / 2) + 'px';

	var color = '#2c3e50';
	context.clearRect(
		0,
		0,
		canvas.width,
		canvas.height
	);

	// Set the fill style to black
	context.fillStyle = color;

	// Draw the background
	context.fillRect(
		0,
		0,
		canvas.width,
		canvas.height
	);

	// Set the fill style to white (For the paddles and the ball)
	context.fillStyle = '#ffffff';
	// player = Paddle.new.call(this, 'left');
	// paddle = Paddle.new.call(this, 'right');
	// ball = Ball.new.call(this);

	// paddle.speed = 8;
	// running = over = false;
	// turn = paddle;
	// timer = round = 0;
	
  }, []);

  // ここでcontextRef.currentを使用して描画ロジックを追加



  return (
    <div>
      {/* 他のコンポーネントやテキストなど */}
      <canvas ref={canvasRef} width={500} height={500}></canvas>
      {/* 他のコンポーネントやテキストなど */}
    </div>
  );
  }
export default Game




