import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard.jsx';
import { PrivateRoute } from './components/PrivateRoute';
import { DarkModeProvider } from './context/DarkModeContext'; // ← import this

function App() {
  return (
    <DarkModeProvider> 
      <>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginModal />} />
            <Route path="/signup" element={<SignupModal />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </>
    </DarkModeProvider>
  );
}

export default App;
