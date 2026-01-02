// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import Slideshow from '../components/Slideshow';
import { FiSearch, FiPlay, FiMapPin, FiCalendar, FiX, FiCheckCircle, FiCircle, FiCheckSquare } from 'react-icons/fi';

function Home() {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSlides, setShowSlides] = useState(false);
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [timestamp, setTimestamp] = useState(Date.now());

  // --- 动态获取后端地址 ---
  // 这样无论是 localhost 还是 192.168.x.x，图片都能找到
  const getBaseUrl = () => {
    return `http://${window.location.hostname}:8000`;
  };

  const fetchImages = async (query = '') => {
    try {
      const url = query ? `/search/?q=${query}` : '/my-images/';
      const res = await api.get(url);
      setImages(res.data);
      setTimestamp(Date.now());
    } catch (err) {
      console.error("获取失败", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchImages(searchTerm);
  };

  const toggleSelection = (e, id) => {
    e.preventDefault(); 
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectMode = () => {
    if (isSelectMode) {
      setSelectedIds(new Set());
    }
    setIsSelectMode(!isSelectMode);
  };

  const slideshowImages = selectedIds.size > 0 
    ? images.filter(img => selectedIds.has(img.id)) 
    : images;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4">
        
        {/* --- Hero 搜索与控制区 --- */}
        <div className="py-8 flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input 
                type="text" 
                placeholder="🔍 搜标签、地点、描述..." 
                className="w-full pl-12 pr-24 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 text-gray-700 transition-all"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => { setSearchTerm(''); fetchImages(''); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX />
                </button>
              )}
            </form>

            {/* 功能按钮组 */}
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <button 
                onClick={toggleSelectMode}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm
                  ${isSelectMode 
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FiCheckSquare className={isSelectMode ? "fill-current" : ""} />
                {isSelectMode ? '完成选择' : '选择图片'}
              </button>

              <button 
                onClick={() => setShowSlides(true)} 
                disabled={images.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-95
                  ${selectedIds.size > 0 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-violet-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <FiPlay className="fill-current" /> 
                {selectedIds.size > 0 ? `播放选中 (${selectedIds.size})` : '播放全部'}
              </button>
            </div>
          </div>
        </div>

        {/* --- 图片瀑布流 --- */}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 opacity-60">
            <p className="text-xl text-gray-500">这里还是一片荒原...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => {
              const isSelected = selectedIds.has(img.id);
              
              return (
                <Link 
                  to={isSelectMode ? '#' : `/image/${img.id}`} 
                  key={img.id}
                  onClick={(e) => isSelectMode && toggleSelection(e, img.id)}
                  className={`group relative block bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-300
                    ${isSelectMode ? 'cursor-pointer' : 'hover:-translate-y-1 hover:shadow-xl'}
                    ${isSelected ? 'ring-4 ring-blue-500 shadow-blue-200 transform scale-[0.98]' : ''}
                  `}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    {/* 使用 getBaseUrl() 动态拼接地址 */}
                    <img 
                      src={`${getBaseUrl()}/static/thumbnails/${img.thumbnail}?t=${timestamp}`} 
                      alt="photo" 
                      className={`object-cover w-full h-full transition-transform duration-700 ease-in-out
                        ${isSelectMode ? '' : 'group-hover:scale-110'}
                        ${isSelected ? 'opacity-90' : ''}
                      `}
                    />
                    
                    {isSelectMode && (
                      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200
                        ${isSelected ? 'bg-blue-500/20' : 'bg-black/0 group-hover:bg-black/10'}
                      `}>
                        <div className={`absolute top-3 right-3 text-2xl drop-shadow-md transition-transform duration-200 ${isSelected ? 'scale-110' : 'scale-100'}`}>
                          {isSelected ? (
                            <FiCheckCircle className="text-blue-500 fill-white" />
                          ) : (
                            <FiCircle className="text-white/80 hover:text-white" />
                          )}
                        </div>
                      </div>
                    )}

                    {!isSelectMode && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium truncate">点击查看详情</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className={`font-bold mb-2 truncate text-lg transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                      {img.description || img.filename}
                    </h3>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                        <FiCalendar />
                        <span>{img.capture_date ? new Date(img.capture_date).toLocaleDateString() : '未知'}</span>
                      </div>
                      {img.location && img.location !== "Unknown" && (
                        <div className="flex items-center gap-1 max-w-[50%]">
                          <FiMapPin className="flex-shrink-0 text-blue-500" />
                          <span className="truncate" title={img.location}>{img.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        {showSlides && slideshowImages.length > 0 && (
          <Slideshow 
            images={slideshowImages} 
            initialIndex={0} 
            onClose={() => setShowSlides(false)} 
          />
        )}
      </div>
    </div>
  );
}

export default Home;