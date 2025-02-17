import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginModal/>} />
        <Route path="/signup" element={<SignupModal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
