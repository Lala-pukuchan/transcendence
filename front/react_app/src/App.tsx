import './App.css'
import Top from './Top.tsx';
import Chat from './Chat.tsx';
import Game from './Game.tsx';
import Account from './Account.tsx';
import SimpleAccount from './SimpleAccount.tsx';
import SelectRoom from './SelectRoom.tsx';
import CreateRoom from './CreateRoom.tsx';
import ChatRoom from './ChatRoom.tsx';
import Login from './Login.tsx';
import Tfa from "./Tfa.tsx";
import Setup from "./Setup.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuBar from './MenuBar.tsx';

function App() {
  return (
    <>
      <BrowserRouter>
      <MenuBar/>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tfa" element={<Tfa />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/game" element={<Game />} />
          <Route path="/account" element={<Account />} />
          <Route path="/simpleAccount/:username" element={<SimpleAccount />} />
          <Route path="/selectRoom" element={<SelectRoom />} />
          <Route path="/chatRoom" element={<ChatRoom />} />
          <Route path="/createRoom" element={<CreateRoom />} />
          <Route path="/setUp" element={<Setup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
