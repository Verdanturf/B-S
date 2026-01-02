// frontend/src/pages/Upload.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiUploadCloud, FiFileText, FiCpu, FiTerminal, FiCheck, FiImage, FiX } from 'react-icons/fi';

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [clientId, setClientId] = useState('');
  const ws = useRef(null); 
  const logsEndRef = useRef(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const id = Date.now().toString();
    setClientId(id);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:8000/ws/${id}`;
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("请先选择图片！");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('client_id', clientId);

    setLoading(true);
    setLogs(["⏳ 建立加密通道...", "🚀 准备上传请求..."]);

    try {
      await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTimeout(() => { navigate('/'); }, 1500);
    } catch (err) {
      setLogs((prev) => [...prev, "❌ 上传过程发生错误！"]);
      alert("上传失败，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      <Navbar />
      
      <div className="container mx-auto p-4 flex justify-center mt-10">
        <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          
          {/* --- 顶部标题栏 (紫色+靛蓝 渐变) --- */}
          <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-10 text-white relative overflow-hidden">
            {/* 装饰背景圆圈 */}
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
                <FiUploadCloud className="text-purple-200" />
                上传新照片
              </h2>
              <p className="text-indigo-100 mt-2 font-medium opacity-90">
                AI 视觉引擎已就绪 · 准备识别场景与物体
              </p>
            </div>
          </div>

          <div className="p-10">
            <form onSubmit={handleUpload} className="space-y-8">
              
              {/* 1. 文件选择区 (配色优化) */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-600 p-1.5 rounded-lg"><FiImage size={18}/></span> 
                  选择图片
                </label>
                
                <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer group
                  ${file 
                    ? 'border-emerald-400 bg-emerald-50/50' 
                    : 'border-slate-300 hover:border-violet-500 hover:bg-violet-50/50 hover:shadow-inner'
                  }`}
                >
                  
                  {!file && (
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  )}
                  
                  {preview ? (
                    <div className="relative z-20">
                      <img src={preview} alt="Preview" className="h-64 mx-auto rounded-xl shadow-lg object-contain bg-white border border-slate-100" />
                      <div className="mt-5 flex flex-col items-center gap-3">
                        <div className="text-emerald-600 font-bold text-sm flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-100">
                          <FiCheck /> 已就绪: {file.name}
                        </div>
                        <button 
                          type="button" 
                          onClick={clearFile}
                          className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors font-medium px-3 py-1 rounded-full hover:bg-red-50"
                        >
                          <FiX size={14} /> 更换文件
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="bg-white p-5 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg">
                        <FiUploadCloud size={36} className="text-violet-500" />
                      </div>
                      <p className="font-bold text-lg text-slate-700">点击或拖拽上传</p>
                      <p className="text-sm mt-2 text-slate-400">支持 JPG, PNG, WEBP 高清原图</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 描述输入区 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg"><FiFileText size={18}/></span>
                  智能描述
                  <span className="text-[10px] font-bold tracking-wide text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 rounded-full shadow-sm shadow-indigo-200">
                    AI Powered
                  </span>
                </label>
                <textarea 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400 resize-none"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="试试描述拍摄的时间和地点，AI 会自动提取并填入..."
                ></textarea>
              </div>

              {/* 3. 极客终端 (配色微调) */}
              {loading && (
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#0f172a] font-mono text-sm transform transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[#1e293b] px-4 py-2.5 flex items-center gap-2 border-b border-gray-700/50">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="ml-3 text-slate-400 text-xs flex items-center gap-1.5 font-medium opacity-80">
                      <FiTerminal /> System_Process_v2.0
                    </div>
                  </div>
                  
                  <div className="p-5 h-48 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {logs.map((log, index) => (
                      <div key={index} className="flex gap-3 text-xs md:text-sm font-medium">
                        <span className="text-violet-400 select-none">➜</span>
                        <span className="text-slate-300 break-all leading-relaxed">{log}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}

              {/* 提交按钮 (紫色渐变) */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group
                  ${loading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transform hover:-translate-y-1'
                  }`}
              >
                {/* 按钮光效 */}
                {!loading && <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                
                {loading ? (
                  <>
                    <FiCpu className="animate-spin text-xl text-violet-500" /> 
                    <span className="text-slate-500">正在进行云端计算...</span>
                  </>
                ) : (
                  '开始上传与分析'
                )}
              </button>

            </form>
          </div>
        </div>
        
        {/* 底部版权 */}
        <div className="fixed bottom-4 text-slate-400 text-xs font-medium opacity-60">
          Powered by PyTorch & React
        </div>
      </div>
    </div>
  );
}

export default Upload;