// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ImageDetail from './pages/ImageDetail';
import Editor from './pages/Editor'; // 编辑页组件

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 受保护路由 */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        
        <Route path="/upload" element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        } />
        
        <Route path="/image/:id" element={
          <PrivateRoute>
            <ImageDetail />
          </PrivateRoute>
        } />

        {/* 图片编辑页面的路由 */}
        <Route path="/editor" element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;