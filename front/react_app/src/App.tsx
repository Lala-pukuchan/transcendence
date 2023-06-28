import './App.css'
import Top from './Top.tsx';
import Chat from './Chat.tsx';
import Game from './Game.tsx';
import Account from './Account.tsx';
import SelectRoom from './SelectRoom.tsx';
import CreateRoom from './CreateRoom.tsx';
import ChatRoom from './ChatRoom.tsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/game" element={<Game />} />
          <Route path="/account" element={<Account />} />
          <Route path="/selectRoom" element={<SelectRoom />} />
          <Route path="/chatRoom" element={<ChatRoom />} />
          <Route path="/createRoom" element={<CreateRoom />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
