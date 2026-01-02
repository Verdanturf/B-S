// frontend/src/pages/Register.jsx
import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCheck } from 'react-icons/fi';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/register', formData);
      alert('🎉 注册成功！请登录');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      {/* 动态背景层 (注册页换个色系：蓝/青/绿) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* 注册卡片 */}
      <div className="glass-card relative z-10 w-full max-w-md p-8 rounded-3xl mx-4">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">创建账号</h2>
          <p className="text-gray-500 mt-2 text-sm">加入 CloudGallery，记录美好生活</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100/80 text-red-600 text-sm rounded-xl border border-red-200 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="用户名"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              </div>
              <input 
                type="email"
                placeholder="电子邮箱"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              </div>
              <input 
                type="password"
                placeholder="密码 (至少6位)"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 mt-2"
          >
            {loading ? '注册中...' : '立即注册'}
            {!loading && <FiCheck />}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            已经有账号了？ 
            <Link to="/login" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-80 transition-opacity ml-1">
              直接登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;