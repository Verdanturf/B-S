// frontend/src/pages/ImageDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { FiEdit2, FiSave, FiX, FiCalendar, FiMapPin, FiInfo, FiTrash2, FiScissors, FiArrowLeft, FiFileText, FiTag, FiHardDrive, FiImage } from 'react-icons/fi';

function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    description: '',
    location: '',
    capture_date: ''
  });

  // 计算图片完整 URL
  const imageUrl = image ? `http://${window.location.hostname}:8000/static/originals/${image.filename}?t=${refreshKey}` : '';

  useEffect(() => {
    const fetchImageDetail = async () => {
      try {
        const res = await api.get(`/images/${id}`);
        setImage(res.data);
        setRefreshKey(Date.now());
        
        let dateStr = '';
        if (res.data.capture_date) {
            dateStr = new Date(res.data.capture_date).toISOString().slice(0, 16);
        }
        
        setEditForm({
            description: res.data.description || '',
            location: res.data.location || '',
            capture_date: dateStr
        });

      } catch (err) {
        console.error(err);
        alert("无法加载图片信息");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchImageDetail();
  }, [id, navigate, location.key]);

  const handleDelete = async () => {
    if (!window.confirm("确定要永久删除这张照片吗？")) return;
    try {
      await api.delete(`/images/${id}`);
      navigate('/');
    } catch (err) {
      alert("删除失败");
    }
  };

  const handleSaveInfo = async () => {
    try {
        const payload = {
            description: editForm.description,
            location: editForm.location,
            capture_date: editForm.capture_date || null
        };
        
        const res = await api.put(`/images/${id}`, payload);
        setImage(res.data);
        setIsEditing(false);
        alert("✅ 信息更新成功！");
    } catch (err) {
        alert("保存失败，请检查数据格式");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
  if (!image) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      <Navbar />
      <div className="container mx-auto p-4 mt-8 max-w-6xl">
        
        {/* 顶部导航 */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white">
            <FiArrowLeft /> 返回相册
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[650px]">
          
          {/* --- 左侧：大图展示区 (升级版：高级深空灰 + 噪点纹理) --- */}
          <div className="lg:w-2/3 relative flex justify-center items-center p-8 overflow-hidden bg-[#0f172a] group">
            
            {/* 1. 背景纹理：微妙的噪点，增加质感 */}
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
            
            {/* 2. 背景光晕：中心稍微亮一点，四周暗下去，营造聚光灯效果 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] to-[#0f172a] opacity-80"></div>

            {/* 3. 图片容器：增加一点点倒影效果 (可选，看起来更高级) */}
            <div className="relative z-10 w-full h-full flex justify-center items-center">
                <img 
                  src={`http://${window.location.hostname}:8000/static/originals/${image.filename}?t=${refreshKey}`} 
                  alt="full screen" 
                  className="max-w-full max-h-[75vh] object-contain shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-md transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                />
            </div>
            
            {/* 4. 底部装饰：极简的页码或装饰线 (纯装饰) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-20">
                <div className="w-12 h-1 rounded-full bg-white"></div>
            </div>

          </div>

          {/* --- 右侧：信息与控制区 (保持不变) --- */}
          <div className="lg:w-1/3 p-8 flex flex-col bg-white relative border-l border-slate-50">
            
            {/* 1. 顶部 Header & 编辑开关 */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-600 p-2.5 rounded-xl shadow-sm"><FiInfo size={20} /></span>
                    <div>
                        <h3 className="font-extrabold text-slate-800 text-2xl tracking-tight">图片详情</h3>
                        <p className="text-xs text-slate-400 mt-1 font-mono">ID: {image.id}</p>
                    </div>
                </div>
                
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-all font-medium text-sm border border-slate-100 hover:border-violet-100"
                    >
                        <FiEdit2 className="group-hover:scale-110 transition-transform" /> 编辑
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditing(false)} 
                            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                            title="取消"
                        >
                            <FiX size={20} />
                        </button>
                        <button 
                            onClick={handleSaveInfo} 
                            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all transform active:scale-95 text-sm font-bold"
                        >
                            <FiSave /> 保存
                        </button>
                    </div>
                )}
            </div>

            {/* 2. 信息滚动区 */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* --- 描述 --- */}
                <div className={`transition-all duration-300 ${isEditing ? 'bg-violet-50/50 p-4 rounded-2xl border border-violet-100' : ''}`}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FiFileText /> 图片描述
                    </label>
                    {isEditing ? (
                        <textarea 
                            className="w-full bg-white border-0 rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 p-4 text-slate-700 leading-relaxed resize-none transition-shadow text-sm"
                            rows="4"
                            placeholder="写下这张照片的故事..."
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        />
                    ) : (
                        <p className="text-slate-700 leading-relaxed font-medium text-lg">
                            {image.description || <span className="text-slate-300 italic font-normal">暂无描述...</span>}
                        </p>
                    )}
                </div>

                {/* --- 地点 --- */}
                <div className={`transition-all duration-300 ${isEditing ? 'bg-violet-50/50 p-4 rounded-2xl border border-violet-100' : ''}`}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiMapPin /> 拍摄地点
                    </label>
                    {isEditing ? (
                        <input 
                            type="text"
                            className="w-full bg-white border-0 rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 py-3 pl-4 pr-4 text-slate-700 transition-shadow text-sm font-medium"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            placeholder="例如：杭州西湖"
                        />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl">
                                <FiMapPin size={18} />
                            </div>
                            <span className="font-medium text-slate-700 text-sm">
                                {image.location && image.location !== "Unknown" ? image.location : <span className="text-slate-400">未知地点</span>}
                            </span>
                        </div>
                    )}
                </div>

                {/* --- 时间 --- */}
                <div className={`transition-all duration-300 ${isEditing ? 'bg-violet-50/50 p-4 rounded-2xl border border-violet-100' : ''}`}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiCalendar /> 拍摄时间
                    </label>
                    {isEditing ? (
                        <input 
                            type="datetime-local"
                            className="w-full bg-white border-0 rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 py-3 pl-4 pr-4 text-slate-700 transition-shadow text-sm font-medium"
                            value={editForm.capture_date}
                            onChange={(e) => setEditForm({...editForm, capture_date: e.target.value})}
                        />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl">
                                <FiCalendar size={18} />
                            </div>
                            <span className="font-medium text-slate-700 font-mono text-sm">
                                {image.capture_date ? new Date(image.capture_date).toLocaleString() : <span className="text-slate-400">未知时间</span>}
                            </span>
                        </div>
                    )}
                </div>

                {/* --- AI 标签 (只读) --- */}
                {image.ai_tags && (
                    <div className="pt-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FiTag /> AI 识别标签
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {image.ai_tags.split(', ').map((tag, index) => (
                                <span key={index} className="bg-violet-50 text-violet-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-violet-100 transition-colors hover:bg-violet-100 cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 底部文件信息 (只读) --- */}
                <div className="pt-6 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiImage/> 分辨率</label>
                        <p className="font-mono text-xs text-slate-600">{image.resolution}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiHardDrive/> 原始文件名</label>
                        <p className="truncate text-xs text-slate-600" title={image.filename}>{image.filename}</p>
                    </div>
                </div>

            </div>

            {/* 3. 底部功能按钮区 */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/editor', { state: { image } })} 
                  className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 hover:shadow-slate-300 flex items-center justify-center gap-2 group"
                >
                  <FiScissors className="group-hover:-rotate-45 transition-transform" /> 
                  图片裁剪 / 滤镜
                </button>

                <button 
                  onClick={handleDelete}
                  className="w-full bg-white text-slate-400 border border-slate-200 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FiTrash2 /> 删除这张照片
                </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ImageDetail;