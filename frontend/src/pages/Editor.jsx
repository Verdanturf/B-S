// frontend/src/pages/Editor.jsx
import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

// --- 防溢出算法 ---
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  let cropWidth, cropHeight;
  const calculatedHeight = mediaWidth / aspect;

  if (calculatedHeight > mediaHeight) {
    cropHeight = mediaHeight;
    cropWidth = cropHeight * aspect;
  } else {
    cropWidth = mediaWidth;
    cropHeight = calculatedHeight;
  }

  return centerCrop(
    makeAspectCrop(
      {
        unit: 'px',
        width: cropWidth * 0.9, // 90% 大小
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const getCroppedImg = async (image, crop, filter) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  ctx.filter = `brightness(${filter.brightness}%) contrast(${filter.contrast}%)`;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas导出失败'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

function Editor() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const imageObj = state?.image;

// 1. 智能初始化图片地址
  // 结合了自动 IP 识别 + 时间戳防缓存 (解决 Canvas Tainted 问题)
  const [imgSrc] = useState(() => {
    if (!imageObj) return '';

    // 自动获取当前协议 (http) 和主机 IP (localhost 或 192.168.x.x)
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = '8000'; // 后端端口固定

    // 拼接基础 URL
    const baseUrl = `${protocol}//${host}:${port}/static/originals/${imageObj.filename}`;

    // 添加随机时间戳参数 (?t=...)
    // 迫使浏览器将其视为新资源请求，从而正确应用后端的 CORS 头，避免 "Canvas is empty" 错误
    return `${baseUrl}?t=${Date.now()}`;
  });

  const [crop, setCrop] = useState(); 
  const [completedCrop, setCompletedCrop] = useState(null); 
  const [aspect, setAspect] = useState(undefined); 
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saving, setSaving] = useState(false);
  
  const imgRef = useRef(null);

  // 图片加载完成：初始化
  const onImageLoad = (e) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleToggleAspectClick = (newAspect) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (newAspect) {
        const newCrop = centerAspectCrop(width, height, newAspect);
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      }
    }
  }

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) {
        alert("请选择有效的裁剪区域");
        return;
    }

    setSaving(true);
    try {
      const blob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        { brightness, contrast }
      );

      const formData = new FormData();
      formData.append('file', blob, imageObj.filename);

      await api.put(`/images/${imageObj.id}/content`, formData);
      
      alert("✅ 编辑保存成功！");
      navigate(`/image/${imageObj.id}`); 
    } catch (err) {
      console.error(err);
      alert(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!imageObj) return <div className="text-white p-10 text-center">参数错误</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          className="shadow-2xl"
          style={{ maxHeight: '80vh' }}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc} // 使用固定的 URL，防止无限重载
            crossOrigin="anonymous"
            style={{ 
                transform: `scale(1) translate(0, 0)`,
                maxHeight: '80vh', 
                filter: `brightness(${brightness}%) contrast(${contrast}%)` 
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>

      <div className="bg-gray-800 p-4 border-t border-gray-700 select-none">
        <div className="container mx-auto max-w-3xl flex flex-col gap-4 text-white">
            
            <div className="flex gap-2 justify-center pb-2 border-b border-gray-700">
                <span className="text-xs text-gray-400 self-center mr-2">裁剪模式:</span>
                {[
                  { label: "自由拖拽", value: undefined },
                  { label: "1:1 正方形", value: 1 },
                  { label: "4:3", value: 4/3 },
                  { label: "16:9", value: 16/9 }
                ].map((ratio) => (
                  <button
                    key={ratio.label}
                    onClick={() => handleToggleAspectClick(ratio.value)}
                    className={`px-3 py-1 text-sm rounded transition ${aspect === ratio.value ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {ratio.label}
                  </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                <div className="flex gap-3 items-center">
                  <span className="w-12 font-bold text-sm text-gray-400">亮度</span>
                  <input type="range" min="50" max="150" value={brightness} onChange={e => setBrightness(e.target.value)} className="flex-1 h-2 bg-gray-600 rounded-lg cursor-pointer accent-blue-500"/>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-12 font-bold text-sm text-gray-400">对比度</span>
                  <input type="range" min="50" max="150" value={contrast} onChange={e => setContrast(e.target.value)} className="flex-1 h-2 bg-gray-600 rounded-lg cursor-pointer accent-blue-500"/>
                </div>
            </div>

            <div className="flex justify-between items-center mt-2">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white font-bold px-4 py-2">取消</button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setBrightness(100); setContrast(100); handleToggleAspectClick(undefined); setCrop(undefined); }} 
                        className="text-gray-300 hover:text-white text-sm px-2 border border-gray-600 rounded"
                    >
                        重置所有
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className={`px-6 py-2 rounded font-bold text-white shadow-lg transition ${
                            saving ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                        }`}
                    >
                        {saving ? "⏳ 处理中..." : "💾 保存修改"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;