import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './(Auth)/Register';
import Login from './(Auth)/Login';
import ForgotPassword from './(Auth)/ForgotPassword';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;