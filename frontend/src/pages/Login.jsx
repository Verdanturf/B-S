// frontend/src/pages/Login.jsx
import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowRight, FiCamera } from 'react-icons/fi';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem('token');
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await api.post('/token', formData);
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setError('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {/* 动态背景层 (极光效果) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* 登录卡片 */}
      <div className="glass-card relative z-10 w-full max-w-md p-8 rounded-3xl mx-4">
        
        {/* 顶部 Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg mb-4 text-white">
            <FiCamera size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">欢迎回来</h2>
          <p className="text-gray-500 mt-2 text-sm">CloudGallery 智能云相册</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100/80 text-red-600 text-sm rounded-xl border border-red-200 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="用户名"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="password"
                placeholder="密码"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {loading ? '登录中...' : '开始探索'}
            {!loading && <FiArrowRight />}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            还没有账号？ 
            <Link to="/register" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-80 transition-opacity ml-1">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;