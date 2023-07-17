import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
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

const paddleWidth: number = 20, paddleHeight: number = 500, ballWidth: number = 16, wallOffset: number = 20;

class Position {
	width: number;
	height: number;
	x: number;
	y: number;
	speed: number = 5;
	deltaX: number = 0;
	deltaY: number = 0;
	constructor(width: number, height: number, x: number, y: number) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#fff";
		context.fillRect(this.x, this.y, this.width, this.height);
	}
}

class Paddle extends Position {


	constructor(w: number, h: number, x: number, y: number) {
		super(w, h, x, y);
	}

	// update(canvas){
	//  if( Game.keysPressed[KeyBindings.UP] ){
	// 	this.yVel = -1;
	// 	if(this.y <= 20){
	// 		this.yVel = 0
	// 	}
	//  }else if(Game.keysPressed[KeyBindings.DOWN]){
	// 	 this.yVel = 1;
	// 	 if(this.y + this.height >= canvas.height - 20){
	// 		 this.yVel = 0;
	// 	 }
	//  }else{
	// 	 this.yVel = 0;
	//  }

	//  this.y += this.yVel * this.speed;

	// }
}

class Ball extends Position {

	constructor(w: number, h: number, x: number, y: number) {
		super(w, h, x, y);
		var randomDirection = Math.floor(Math.random() * 2) + 1;
		if (randomDirection % 2) {
			this.deltaX = 1;
		}
		else {
			this.deltaX = -1;
		}
		this.deltaY = 1;
	}

	update(player: Paddle, opponent: Paddle, canvas: HTMLCanvasElement) {
		// x, y is the top left corner of the ball
		
		//check top canvas bounds
		if (this.y <= wallOffset) {
			this.deltaY = 1;
		}

		//check bottom canvas bounds
		if (this.y + this.height >= canvas.height - wallOffset) {
			this.deltaY = -1;
		}

		//check left canvas bounds
		if (this.x <= ballWidth / 4) {
			this.x = canvas.width / 2 - this.width / 2;
			this.deltaX *= -1;
			// Game.computerScore += 1;
		}

		//check right canvas bounds
		// console.log("right canvas bounds");
		// console.log("this.x is " + this.x);
		// console.log("canvas.width is " + canvas.width);
		if (this.x + this.width >= canvas.width - ballWidth / 4) {
			this.x = canvas.width / 2 - this.width / 2;
			this.deltaX *= -1;
			// Game.playerScore += 1;
		}


		//check player collision
		// console.log(player.x + player.width);

		// console.log("player height is " + player.y + player.height);
		if (this.x <= player.x + player.width) {
			if (this.y >= player.y && this.y + this.height <= player.y + player.height) {
				this.deltaX = 1;
			}
		}

		//check opponent collision
		if (this.x + this.width >= opponent.x) {
			if (this.y >= opponent.y && this.y + this.height <= opponent.y + opponent.height) {
				this.deltaX = -1;
				// console.log("opponent collision");
			}
		}

		this.x += this.deltaX * this.speed;
		this.y += this.deltaY * this.speed;
	}
}

function Game() {
	const navigate = useNavigate();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	// const [playerScore, setPlayerScore] = useState(0);
	// const [computerScore, setComputerScore] = useState(0);
	// const [player, setPlayer] = useState<Position>(new Position(paddleWidth,paddleHeight,wallOffset,canvas.height / 2 - paddleHeight / 2));
	// const [computerPlayer, setComputerPlayer] = useState<Position>(new Position(paddleWidth,paddleHeight,canvas.width - (wallOffset + paddleWidth) ,canvas.height / 2 - paddleHeight / 2));
	// const [ball, setBall] = useState<Position>(new Position(ballSWidth,ballSWidth,canvas.width / 2 - ballSWidth / 2, canvas.height / 2 - ballSWidth / 2));
	let canvas: any;
	let context: any;
	useLayoutEffect(() => {
		canvas = canvasRef.current;
		context = canvas.getContext('2d');
		contextRef.current = context;

		canvas.width = 1200;
		canvas.height = 800;
		canvas.style.width = (canvas.width / 2) + 'px';
		canvas.style.height = (canvas.height / 2) + 'px';
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = '#429950';
		context.fillRect(0, 0, canvas.width, canvas.height);
		
	}, []);
	
	useEffect(() => {
		
		//なくてもいいかも
		// context.clearRect(0, 0, canvas.width, canvas.height);


		// player = Paddle.new.call(this, 'left');
		// paddle = Paddle.new.call(this, 'right');
		// ball = Ball.new.call(this);

		// paddle.speed = 8;
		// running = over = false;
		// turn = paddle;
		// timer = round = 0;
		
		// player.draw(context);
		// ball.draw(context);
		// ball.update(player,player,canvas);
		const player = new Position(paddleWidth, paddleHeight, wallOffset, canvas.height / 2 - paddleHeight / 2);
		const opponent = new Position(paddleWidth, paddleHeight, canvas.width - wallOffset - paddleWidth, canvas.height / 2 - paddleHeight / 2);
		const ball = new Ball(ballWidth, ballWidth, canvas.width / 2 - ballWidth / 2, canvas.height / 2 - ballWidth / 2);
		function gameLoop() {
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Update game state
			ball.update(player, opponent, canvas);

			// Draw game elements
			context.fillStyle = '#429950';
			context.fillRect(0, 0, canvas.width, canvas.height);
			ball.draw(context);
			player.draw(context);
			opponent.draw(context);
			requestAnimationFrame(gameLoop);
		}
		gameLoop();
	}, []);

	// ここでcontextRef.currentを使用して描画ロジックを追加

	return (
		<>
			{/* <h2>Game</h2> */}
			<div>
				<h2>Game</h2>
				{/* 他のコンポーネントやテキストなど */}
				<canvas ref={canvasRef}></canvas>
				{/* 他のコンポーネントやテキストなど */}
			</div>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={() => navigate('/')} sx={{ m: 2 }}>
				Return Back
			</Button>
		</>
	);
}
export default Game




