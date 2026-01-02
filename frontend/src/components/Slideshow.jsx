// frontend/src/components/Slideshow.jsx
import { useEffect, useState, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiImage } from 'react-icons/fi';

function Slideshow({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false); //用于鼠标悬停显示/隐藏控制栏

  // 智能获取后端地址 (自动适配 localhost 或 192.168.x.x)
  const getImageUrl = (filename) => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    // 假设后端端口固定为 8000
    return `${protocol}//${host}:8000/static/originals/${filename}`;
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // 自动播放定时器
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 3500); // 改为 3.5秒，节奏更舒缓
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, nextSlide]);

  const currentImg = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#0f172a]/95 backdrop-blur-xl flex items-center justify-center transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- 顶部栏 --- */}
      <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
        <div className="text-white/60 text-sm font-medium tracking-widest uppercase flex items-center gap-2">
          <FiImage /> CloudGallery Theater
        </div>
        
        {/* 关闭按钮 (圆形玻璃质感) */}
        <button 
          onClick={onClose} 
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md border border-white/5 transition-all hover:scale-110 active:scale-95"
          title="关闭 (Esc)"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* --- 左右切换箭头 (悬浮) --- */}
      <button 
        onClick={prevSlide}
        className={`absolute left-6 text-white p-4 rounded-full bg-black/20 hover:bg-black/50 border border-white/5 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-40 hidden md:flex ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <FiChevronLeft size={32} />
      </button>

      <button 
        onClick={nextSlide}
        className={`absolute right-6 text-white p-4 rounded-full bg-black/20 hover:bg-black/50 border border-white/5 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-40 hidden md:flex ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <FiChevronRight size={32} />
      </button>

      {/* --- 图片主体 --- */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
        <img 
          key={currentImg.id} // 添加 key 触发 React 重新渲染动画
          src={getImageUrl(currentImg.filename)} 
          className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm animate-in fade-in zoom-in-95 duration-500" 
          alt="slideshow"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
        />
      </div>

      {/* --- 底部控制胶囊 (悬浮) --- */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 md:opacity-100 md:translate-y-0'}`}>
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6 shadow-2xl">
          
          {/* 信息区 */}
          <div className="flex flex-col min-w-[120px] max-w-[300px]">
            <span className="text-white font-bold truncate text-sm md:text-base">
              {currentImg.description || currentImg.filename}
            </span>
            <span className="text-white/50 text-xs flex items-center gap-2">
              {new Date(currentImg.capture_date || Date.now()).toLocaleDateString()} 
              <span className="w-1 h-1 rounded-full bg-white/30"></span>
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* 分割线 */}
          <div className="w-px h-8 bg-white/10"></div>

          {/* 播放控制 */}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            title="空格键切换"
          >
            {isPlaying ? (
              <>
                <FiPause className="animate-pulse text-blue-400" size={20} />
                <span className="text-xs font-medium text-blue-400">播放中</span>
              </>
            ) : (
              <>
                <FiPlay size={20} className="ml-1" />
                <span className="text-xs font-medium">暂停</span>
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
}

export default Slideshow;