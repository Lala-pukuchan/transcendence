import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import UndoIcon from '@mui/icons-material/Undo';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { httpClient } from './httpClient';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";

const paddleWidth: number = 20, paddleHeight: number = 200, wallOffset: number = 20;
let ballWidth: number = 16;
const MATCHPOINT: number = 3;
class Position {
	width: number;
	height: number;
	x: number;
	y: number;
	speed: number;
	deltaX: number = 0;
	deltaY: number = 0;
	constructor(width: number, height: number, x: number, y: number, speed: number) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.speed = speed;
	}
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#fff";
		context.fillRect(this.x, this.y, this.width, this.height);
	}
}

class Paddle extends Position {

	constructor(w: number, h: number, x: number, y: number) {
		super(w, h, x, y, 8);
	}

	update(canvas, direct) {
		if (direct != 0)
			this.deltaY = direct;
		if (this.y <= wallOffset && direct != 1)
			this.deltaY = 0;
		if (this.y + this.height >= canvas.height - wallOffset && direct != -1)
			this.deltaY = 0;
		this.y += this.deltaY * this.speed;
	}
}


class Ball extends Position {

	constructor(w: number, h: number, x: number, y: number) {
		super(w, h, x, y, 5);
		this.deltaY = 1;
	}

	update(player: Paddle, opponent: Paddle, canvas: HTMLCanvasElement, setPlayerScore, setOpponentScore) {
		// x, y is the top left corner of the ball

		//check top canvas bounds
		if (this.y <= wallOffset) {
			this.deltaY = 1;
		}

		//check bottom canvas bounds
		if (this.y + this.height >= canvas.height - wallOffset) {
			this.deltaY = -1;
		}

		//TODO: すり抜けている感があるので, ボールの4角で判定するようにしてもいいいかも
		//check left canvas bounds
		if (this.x <= 1) {
			console.log("left ball emit");
			// 左に抜けたときだけ見ればよい
			// 自分にとっての左に抜けたときは，相手にとっての右に抜けたときであるため
			// 壁を抜けたときに，リクエストを送り，その先でballの位置を初期化することで両者の遅延をほぼなくすことができる
			setOpponentScore((prevScore: number) => {
				socket.emit('ball', 'left', prevScore + 1, socket.id);
			});
		}

		//check player collision
		if (this.x <= player.x + player.width) {
			if (this.y >= player.y && this.y + this.height <= player.y + player.height) {
				this.deltaX = 1;
			}
		}

		//check opponent collision
		if (this.x + this.width >= opponent.x) {
			if (this.y >= opponent.y && this.y + this.height <= opponent.y + opponent.height) {
				this.deltaX = -1;
			}
		}

		//send the absolute position to check lag
		// if (this.x == canvas.width / 4) {
		// 	socket.emit('left position', this.y, this.deltaX, socket.id);
		// }

		// if (this.x == canvas.width * 3 / 4) {
		// 	socket.emit('right position', this.y, this.deltaX, socket.id);
		// }

		this.x += this.deltaX * this.speed;
		this.y += this.deltaY * this.speed;
	}
}

async function createGame() {
	if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}
	const reqHeader = {
		headers: {
		  Authorization: `Bearer ` + getCookie('token'),
		  'Content-Type': 'application/json',
		},
	};
	// tokenデコード
	const decoded = decodeToken(getCookie("token"));
	console.log('decoded: ', decoded);
	const username = decoded.user.username;
	try {
		const response = await httpClient.post('/games/' , {
			username: username
		}, reqHeader);
		console.log('response: ', response);
		return response.data;
	} catch (error) {
		console.error("エラーが発生しました:", error);
	}
}

async function fetchAndProcessMatchmakingGame() {
	if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}
	// tokenデコード
	const decoded = decodeToken(getCookie("token"));
	console.log('decoded: ', decoded);
	const username = decoded.user.username;
	const reqHeader = {
		headers: {
		  Authorization: `Bearer ` + getCookie('token'),
		  'Content-Type': 'application/json',
		},
	};
	try {
		const response = await httpClient.get(`/games/matchmaking/${username}`, reqHeader);
		console.log('res(check matchmaking): ', response);
		const game = response.data;
		return game;
	} catch (error) {
		console.error("エラーが発生しました:", error);
	}
}


const socket = io('http://localhost:3000');

//TODO: ブラウザが非アクティブになったとき，どうするか考える
function Game() {
	if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}
	const reqHeader = {
		headers: {
		  Authorization: `Bearer ` + getCookie('token'),
		  'Content-Type': 'application/json',
		},
	};
	const navigate = useNavigate();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const animationIdRef = useRef<number | null>(null);
	const [playerScore, setPlayerScore] = useState(0);
	const [opponentScore, setOpponentScore] = useState(0);
	const [deltaX, setDeltaX] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [isMatching, setIsMatching] = useState(true);
	const [gameId, setGameId] = useState(0);

	const [parameterValue, setParameterValue] = useState(60);

	const handleReturnBack = () => {
		socket.emit('returnBack', decodeToken(getCookie("token")).user.username);
		
		navigate('/');
	};
	const [isUser1, setisUser1] = useState(false);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const game = await fetchAndProcessMatchmakingGame();
				
				if (game.length === 0) {
					console.log("マッチメイキング中のゲームは見つかりませんでした。");
					const createdGame = await createGame();
					console.log("createdGame", createdGame);
					setGameId(createdGame.id);
					socket.emit('joinGameRoom', createdGame.roomId);
					socket.emit('gaming', decodeToken(getCookie("token")).user.username);
					setisUser1(true);
				} else {
					console.log("インバイト，または，マッチメイキング中のゲームが見つかりました。");
					console.log("matching game : ", game);
					try {
						const response = await httpClient.put(`/games/${game[0].id}/join`, reqHeader);
						setGameId(game[0].id);
						console.log(response.data); // レスポンスデータをログに表示
						console.log("joined game : ", game);
						socket.emit('joinGameRoom', game[0].roomId);
						socket.emit('gaming', decodeToken(getCookie("token")).user.username);
						socket.emit('matched', 'game[0].', socket.id);
					}
					catch (error) {
						console.error("エラーが発生しました:", error);
					}
				}
				setIsLoading(false);
			} catch (error) {
				console.error("エラーが発生しました:", error);
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => { //FIXME: 事故ったら, useEffectに戻す
		
		//初期化
		
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');
		contextRef.current = context;
		canvas.width = 1200;
		canvas.height = 800;
		canvas.style.width = (canvas.width / 2) + 'px';
		canvas.style.height = (canvas.height / 2) + 'px';
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = '#429950';
		context.fillRect(0, 0, canvas.width, canvas.height);
		const player = new Paddle(paddleWidth, paddleHeight, wallOffset, canvas.height / 2 - paddleHeight / 2);
		const opponent = new Paddle(paddleWidth, paddleHeight, canvas.width - wallOffset - paddleWidth, canvas.height / 2 - paddleHeight / 2);
		const ball = new Ball(ballWidth, ballWidth, canvas.width / 2 - ballWidth / 2, canvas.height / 2 - ballWidth / 2);
		player.draw(context);
		opponent.draw(context);
		ballWidth = parameterValue;
		//socket.on
		const handleConnect = () => {
			console.log('connection ID : ', socket.id);
		};
		const handleOpponetPaddle = (message: string) => {
			// console.log('opponent paddle : ', message);
			if (socket.id != message[1])
				opponent.update(canvas, parseInt(message[0]));
		};
		const handleGameStatus = (message: string) => {
			// console.log('GameStatus : ', message);
			if (message[2] === socket.id)
				setDeltaX(parseInt(message[1]));
			else
				setDeltaX(parseInt(message[1]) * -1);
			setIsAnimating(message[0]);
		};
		const handleBall = (message: string) => {
			// console.log('init ball', message);
			// ball.y = canvas.height / 2 - ball.width / 2;
			if (message[0] === 'left') {
				if (message[2] === socket.id)
					setOpponentScore(parseInt(message[1]));
				else
					setPlayerScore(parseInt(message[1]));
			}
			ball.deltaX *= -1;
			ball.x = canvas.width / 2 - ball.width / 2;
			if (parseInt(message[1]) >= MATCHPOINT)
				ball.y = canvas.height / 2 - ball.width / 2;
		};
		const handleMatchMaking = (message: string) => {
			setIsMatching(false);
		};
		const handleOpponentDisconnect = (message: string) => {
			const confirmation = window.confirm(message + " is disconnected. Please click OK.");
			// alert("Your opponent left the game.");
			console.log("confirmation : ", "さよなら");
			if (confirmation) {
			  window.location.href = '/';
			}
		};
		const handleBallSizeUpdate = (message: string) => {
			ballWidth = parseInt(message);
			setParameterValue(parseInt(message));
		}

		const handleLeft = (message: string) => {
			alert("Your opponent left the game.");
			handleReturnBack();
		}

		socket.on('connect', handleConnect);
		socket.on('opponentPaddle', handleOpponetPaddle);
		socket.on('GameStatus', handleGameStatus);
		socket.on('centerball', handleBall);
		socket.on('matchedGame', handleMatchMaking);
		socket.on('detectedDisconnection', handleOpponentDisconnect);
		socket.on('ballSizeUpdate', handleBallSizeUpdate);
		socket.on('userLeft', handleLeft);
		
		const handleKeyDown = (event) => {
			if (event.key === 'ArrowUp') {
				socket.emit('paddle', -1, socket.id);
				// console.log('ArrowUp : ', socket.id);
				player.update(canvas, -1);
			}
			else if (event.key === 'ArrowDown') {
				socket.emit('paddle', 1, socket.id);
				// console.log('ArrowDown : ', socket.id);
				player.update(canvas, 1);
			}
		};

		

		ball.deltaX = deltaX;
		const gameLoop = () => {

			ball.update(player, opponent, canvas, setPlayerScore, setOpponentScore);
			player.update(canvas, 0);
			opponent.update(canvas, 0);
			setPlayerScore((prevScore: number) => {
				if (prevScore >= MATCHPOINT)
					setIsAnimating(false);
				return prevScore;
			});
			setOpponentScore((prevScore: number) => {
				if (prevScore >= MATCHPOINT)
					setIsAnimating(false);
				return prevScore;
			});

			// Draw game elements
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = '#429950';
			context.fillRect(0, 0, canvas.width, canvas.height);
			ball.draw(context);
			player.draw(context);
			opponent.draw(context);
			animationIdRef.current = requestAnimationFrame(gameLoop);
		}
		if (isAnimating) {
			animationIdRef.current = requestAnimationFrame(gameLoop);
		}
		else {
			if (playerScore >= MATCHPOINT) {
				alert("You Win!\n" + "Your Score: " + playerScore + " Opponent Score: " + opponentScore);
				httpClient.put(`/games/${gameId}/score`, {
					score1: playerScore,
					score2: opponentScore
				}, reqHeader).then((response) => {
					console.log("score response : ", response);
				}).catch((error) => {
					console.log("score error : ", error);
				});
				handleReturnBack(); //FIXME:多分合っている
			}
			else if (opponentScore >= MATCHPOINT) {
				alert("You Lose.\n" + "Your Score: " + playerScore + "  :  Opponent Score: " + opponentScore);
				handleReturnBack(); //FIXME:多分合っている
			}
			// setPlayerScore(0);
			// setOpponentScore(0);
			
		}

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			cancelAnimationFrame(animationIdRef.current);
			setPlayerScore(0);
			setOpponentScore(0);
			socket.off('connect', handleConnect);
			socket.off('opponentPaddle', handleOpponetPaddle);
			socket.off('GameStatus', handleGameStatus);
			socket.off('centerball', handleBall);
			socket.off('detectedDisconnection', handleOpponentDisconnect);
			socket.off('ballSizeUpdate', handleBallSizeUpdate);
			socket.off('userLeft', handleLeft);
		};
	}, [isAnimating, socket, deltaX, isLoading, isMatching, parameterValue]);
	// parameterValue入れといて，start状態のときしか動かせないようにする

	const handleStartStop = () => {
		var randomDirection = Math.floor(Math.random() * 2);
		if (randomDirection === 0)
			randomDirection = -1;
		// console.log('randomDirection : ', randomDirection);
		setIsAnimating((prevIsAnimating: Boolean) => {
			socket.emit('changeGameStatus', !prevIsAnimating, randomDirection, socket.id);
			// console.log('changeGameStatus : ', !prevIsAnimating);
			return !prevIsAnimating
		});
	};

	

	// const onClickSubmit = useCallback(() => {
	// 	socket.emit('ball', socket.id);
		// console.log("ball emit");
	// }, []);

	let buttonText;
	if (isMatching) {
		buttonText = 'Match Making';
	} else if (isAnimating) {
		buttonText = 'Reset';
	} else {
		buttonText = 'Start';
	}


	const handleParameterChange = (event) => {
		const newValue = parseInt(event.target.value);
		socket.emit('ballSize', newValue, socket.id);
		setParameterValue(newValue);
	};

	const returnWhileGaming = () => {
		handleReturnBack();
		socket.emit('exitRoom', socket.id);
		console.log("ばいばい");
	}

	return (
		<>
			{/* <h2>Game</h2> */}
			<div>
				<h2>Game</h2>
				{/* 他のコンポーネントやテキストなど */}
				<h3>{playerScore} : {opponentScore}</h3>
				<canvas ref={canvasRef}></canvas>
				{/* 他のコンポーネントやテキストなど */}
			</div>
			<Button variant="contained" endIcon={<UndoIcon />} onClick={returnWhileGaming} sx={{ m: 2 }}>
				Return Back
			</Button>
			<Button variant={isAnimating ? "contained" : "outlined"} onClick={handleStartStop} disabled={isMatching}>
				{buttonText}
			</Button>
			
			{/* <input
				type="range"
				min={20}
				max={100}
				value={parameterValue}
				onChange={handleParameterChange}
				visible={isAnimating ? "hide" : "show"}
			/> */}
			<div>
      {(isAnimating || !isUser1) ? (
    	<input
	  type="range"
	  min={20}
	  max={100}
	  value={parameterValue}
	  onChange={handleParameterChange}
	  style={{ display: 'none' }} // Hide the input element using inline CSS
	/>
	  ) : (
	<input
	  type="range"
	  min={20}
	  max={100}
	  value={parameterValue}
	  onChange={handleParameterChange}
	/>
	  )}
	</div>
		{/* <div>
			 {(isAnimating || !isUser1) ? (
		<p></p>
	  ) : (
	<p> ball size </p>
	  )}</div> */}
			{/* <Button variant="contained" onClick={onClickSubmit} sx={{ m: 2 }}>
				emit
			</Button> */}
		</>
	);
}

export default Game


// function Game() {

// 	useEffect(() => {
// 		socket.on('connect', () => {
// 		  // eslint-disable-next-line no-console
// 		  console.log('connection ID : ', socket.id);
// 		});
// 	}, []);

// 	const onClickSubmit = useCallback(() => {
// 		socket.emit('message', 'hello', socket.id);
// 	}, []);
// 	const onClicPaddle = useCallback(() => {
// 		socket.emit('paddle', 'hello', socket.id);
// 	}, []);
// 	return (
// 		<>
// 			<Button variant="contained" onClick={onClickSubmit} sx={{ m: 2 }}>
// 				emit
// 			</Button>
// 			<Button variant="contained" onClick={onClicPaddle} sx={{ m: 2 }}>
// 				paddle
// 			</Button>
// 		</>
// 	);
// }