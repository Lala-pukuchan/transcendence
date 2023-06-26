import './App.css'
import Top from './Top.tsx';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Top />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
