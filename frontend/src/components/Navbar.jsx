// frontend/src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCamera, FiUploadCloud, FiLogOut, FiGrid } from 'react-icons/fi'; // 引入图标

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 判断当前是否是选中状态，用于高亮菜单
  const isActive = (path) => location.pathname === path;

  return (
    // sticky + backdrop-blur: 也就是“粘性定位”加“毛玻璃”效果
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* 左侧 Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-blue-500 to-purple-600 text-white p-2 rounded-lg shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:scale-105">
            <FiCamera size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CloudGallery
          </span>
        </Link>

        {/* 右侧菜单 */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium
              ${isActive('/') ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiGrid size={18} />
            <span className="hidden md:inline">图库</span>
          </Link>

          <Link 
            to="/upload" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium
              ${isActive('/upload') ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiUploadCloud size={18} />
            <span className="hidden md:inline">上传</span>
          </Link>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <FiLogOut size={18} />
            <span className="hidden md:inline">退出</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;