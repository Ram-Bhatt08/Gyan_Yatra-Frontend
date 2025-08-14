import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Quiz from './Components/Quiz/Quiz';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import Profile from './Components/Profile/Profile';
import Navbar from './Components/Navbar/Navbar';

function AppLayout() {
  const location = useLocation();
  const hideNavbarOn = ["/", "/login", "/register"];

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
