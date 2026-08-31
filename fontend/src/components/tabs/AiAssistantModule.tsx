import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Camera,
  FileSearch,
  ScanLine,
  MessageSquare,
  BarChart2,
  CheckCircle2,
  Upload,
  Zap,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';

export const AiAssistantModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ocr' | 'survey' | 'estimate' | 'chat' | 'reports'>('ocr');
  const [containerImage, setContainerImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    containerNo: string;
    isoCode: string;
    sealNo: string;
    confidence: number;
    detectedDamages: string[];
  } | null>(null);

  // AI Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là AI Assistant của hệ thống DEPOT ERP. Tôi có thể hỗ trợ bạn tra cứu vỏ container, phân tích hư hỏng IICL, gợi ý báo giá repair hoặc tổng hợp báo cáo KPI bãi.',
      time: '10:00'
    }
  ]);
  const [inputChat, setInputChat] = useState('');

  const handleSimulateOCR = () => {
    setIsScanning(true);
    setOcrResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setOcrResult({
        containerNo: 'TCLU 849201-3',
        isoCode: '45G1 (40HC)',
        sealNo: 'SML-908231',
        confidence: 98.6,
        detectedDamages: [
          'Vết móp lọt lồng vách trái (Left Panel Dent > 50mm)',
          'Sàn gỗ trầy xước lớp phủ Polyurethane (Floor Scratched)',
          'Cong mép xà ngang cửa sau (Rear Header Bent)'
        ]
      });
    }, 1800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const userText = inputChat;
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setInputChat('');

    setTimeout(() => {
      let aiReply = 'Tôi đã ghi nhận câu hỏi. Đang truy vấn cơ sở dữ liệu Depot...';
      if (userText.toLowerCase().includes('tồn kho') || userText.toLowerCase().includes('bãi')) {
        aiReply = 'Hiện tại bãi Depot A đang có 1,240 TEU (Sức chứa 82.6%). Loại vỏ 40HC chiếm 54%, 20GP chiếm 31%. Có 42 container đang chờ duyệt báo giá Hãng Tàu.';
      } else if (userText.toLowerCase().includes('iicl') || userText.toLowerCase().includes('sửa')) {
        aiReply = 'Theo quy chuẩn IICL-6, vế móp vách sâu > 35mm trên diện rộng trên 100mm bắt buộc phải cắt vá (Insert/Patch). Đơn giá trung bình vật tư thép corrugated là 320,000 VNĐ/mét.';
      } else {
        aiReply = `AI đã phân tích dữ liệu liên quan đến "${userText}": Hệ thống hoạt động bình thường, các chỉ số SLA Gate In/Gate Out đều đạt mức 99.2%.`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply, time: timeNow }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-blue-950 border border-purple-800/50 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Trợ Lý Trí Tuệ Nhân Tạo (Module 20: AI Enterprise)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900 text-purple-200 border border-purple-700">
                Gemini AI Powered
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1">
              Nhận diện tự động số Container/Seal (OCR), phân tích hư hỏng IICL qua hình ảnh, trợ lý báo giá tự động & Chatbot tra cứu bãi Depot.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="px-4 py-2 bg-slate-900/80 border border-purple-900/60 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-medium">Độ Chính Xác OCR</div>
            <div className="text-lg font-black text-emerald-400">99.4%</div>
          </div>
          <div className="px-4 py-2 bg-slate-900/80 border border-purple-900/60 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-medium">Thời Gian Phân Tích</div>
            <div className="text-lg font-black text-purple-300">1.2s</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('ocr')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'ocr'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>1. AI OCR Container & Seal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('survey')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'survey'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>2. AI Damage Detection (IICL)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('estimate')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'estimate'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>3. AI Estimate Assistant</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
            activeSubTab === 'chat'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>4. AI Chat Copilot</span>
        </button>
      </div>

      {/* SUB TAB 1: AI OCR CONTAINER & SEAL */}
      {activeSubTab === 'ocr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload / Demo Image */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-purple-400" />
                <span>Nhận Diện Số Vỏ Container & Chì (OCR Camera Gate)</span>
              </h3>
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-purple-600/60 rounded-2xl p-8 text-center transition space-y-3 bg-slate-950/50">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 text-purple-400 flex items-center justify-center mx-auto border border-purple-800">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Tải Ảnh Container hoặc Chụp Từ Camera Gate</p>
                <p className="text-[11px] text-slate-500 mt-1">Hỗ trợ JPG, PNG từ camera giám sát CCTV bãi</p>
              </div>
              <button
                onClick={handleSimulateOCR}
                disabled={isScanning}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Chạy AI OCR Thử Nghiệm</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated Live Stream Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-48 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                alt="Container Gate In"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {isScanning && (
                <div className="absolute inset-0 bg-purple-900/30 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
                  <span className="text-xs font-mono font-bold text-purple-200 bg-slate-900/90 px-3 py-1 rounded-full border border-purple-600">
                    Scanning ISO Code & Container ID...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OCR Result Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kết Quả AI OCR Tự Động Trích Xuất</span>
              </h3>
              {ocrResult && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Confidence {ocrResult.confidence}%
                </span>
              )}
            </div>

            {!ocrResult && !isScanning && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Vui lòng bấm nút <span className="text-purple-400 font-bold">"Chạy AI OCR Thử Nghiệm"</span> để xem trích xuất dữ liệu tự động.
              </div>
            )}

            {isScanning && (
              <div className="text-center py-12 space-y-2">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Đang quét đặc trưng ký tự Ansi/ISO 6346...</p>
              </div>
            )}

            {ocrResult && !isScanning && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Số Vỏ Container Trích Xuất:</span>
                    <span className="font-mono text-base font-black text-amber-300">{ocrResult.containerNo}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Mã Phân Loại ISO:</span>
                    <span className="font-mono text-sm font-bold text-white">{ocrResult.isoCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Số Niêm Chì (Seal No):</span>
                    <span className="font-mono text-sm font-bold text-cyan-300">{ocrResult.sealNo}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Phát Hiện Hư Hỏng Sơ Bộ (Computer Vision):</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {ocrResult.detectedDamages.map((dmg, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-300 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{dmg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tự Động Điền Vào Phiếu Gate In / Survey</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 4: AI CHAT COPILOT */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Trợ Lý AI Chat & Tra Cứu Toàn Hệ Thống</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              Online • Operational AI
            </span>
          </div>

          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Đặt câu hỏi về tồn kho bãi, quy chuẩn IICL, biểu phí Hãng Tàu..."
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </button>
          </form>
        </div>
      )}

      {/* OTHER SUB TABS PLACEHOLDER */}
      {(activeSubTab === 'survey' || activeSubTab === 'estimate') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <Cpu className="w-10 h-10 text-purple-400 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white">AI Damage Detection & Estimate Auto-Calculation</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hệ thống đang sẵn sàng xử lý các ảnh kiểm định IICL-6 tự động tính toán khối lượng vật tư và đề xuất báo giá chuẩn theo hợp đồng Hãng Tàu.
          </p>
        </div>
      )}
    </div>
  );
};
