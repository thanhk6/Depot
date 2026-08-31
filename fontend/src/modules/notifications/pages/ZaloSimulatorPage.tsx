import React, { useState } from 'react';
import {
  Smartphone,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  Sparkles,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface SimulatedMessage {
  id: string;
  sender: 'DEPOT_BOT' | 'USER';
  time: string;
  title?: string;
  content: string;
  templateCode?: string;
  actions?: {
    label: string;
    actionId: string;
    type: 'primary' | 'success' | 'danger' | 'secondary';
  }[];
  isActionDone?: boolean;
  actionDoneText?: string;
}

export const ZaloSimulatorPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [selectedPersona, setSelectedPersona] = useState<'SURVEYOR' | 'REPAIR_LEAD' | 'MAERSK_CUST' | 'TRUCKING'>('MAERSK_CUST');
  const [inputMessage, setInputMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat message histories for each persona
  const [chatMessages, setChatMessages] = useState<Record<string, SimulatedMessage[]>>({
    MAERSK_CUST: [
      {
        id: 'msg-m1',
        sender: 'DEPOT_BOT',
        time: '16:30',
        title: '🟢 [GATE-IN THÀNH CÔNG] - Container MRKU3322110',
        content:
          'Kính gửi Hãng tàu MAERSK LINE,\n\nContainer: MRKU3322110 (40HC)\nĐã hoàn tất hạ bãi lúc: 16:30 17/08/2026\nVị trí lưu bãi: Block A-04-02\nSố xe: 51C-889.22 (Tài xế: Nguyễn Văn Hùng)\n\nDepot đang tiến hành khảo sát IICL.',
        actions: [
          { label: '🔍 Tra Cứu Vị Trí Vỏ', actionId: 'TRACK_CONT', type: 'secondary' }
        ]
      },
      {
        id: 'msg-m2',
        sender: 'DEPOT_BOT',
        time: '16:45',
        title: '📝 [BÁO GIÁ SỬA CHỮA MỚI] - EST-2026-0842',
        content:
          'Kính gửi Hãng tàu MAERSK LINE,\n\nDepot đã phát hành Báo giá sửa chữa MNR:\n- Mã Estimate: EST-2026-0842\n- Container: MAEU5566778\n- Tổng chi phí dự toán: 4,550,000 VND (gồm 1,800,000 VND nhân công + 2,750,000 VND vật tư)\n- Hạn duyệt dự kiến: 18/08/2026',
        actions: [
          { label: '✅ Phê Duyệt Estimate', actionId: 'APPROVE_ESTIMATE', type: 'success' },
          { label: '❌ Từ Chối Báo Giá', actionId: 'REJECT_ESTIMATE', type: 'danger' }
        ]
      }
    ],
    REPAIR_LEAD: [
      {
        id: 'msg-r1',
        sender: 'DEPOT_BOT',
        time: '16:46',
        title: '✅ [BÁO GIÁ ĐÃ DUYỆT] - EST-2026-0842',
        content:
          'Estimate: EST-2026-0842 (Cont MAEU5566778) đã được Hãng tàu Maersk duyệt.\nLệnh WO-2026-00125 được kích hoạt.',
        actions: [
          { label: '📦 Yêu Cầu Cấp Vật Tư Cho WO', actionId: 'REQUEST_MATERIAL', type: 'primary' }
        ]
      },
      {
        id: 'msg-r2',
        sender: 'DEPOT_BOT',
        time: '17:35',
        title: '❌ [QC KHÔNG ĐẠT] - Yêu cầu sửa lại Cont MSKU1234567',
        content:
          'Lỗi chưa đạt: Mối hàn vách tôn L3 bị rỗ khí, keo dán góc chưa phẳng.\nQC Inspector: Phạm Minh Đức\nVui lòng xử lý dứt điểm trước 18:00.',
        actions: [
          { label: '🔧 Báo Đã Sửa Lại Xong (Yêu Cầu QC)', actionId: 'REWORK_DONE', type: 'success' }
        ]
      }
    ],
    SURVEYOR: [
      {
        id: 'msg-s1',
        sender: 'DEPOT_BOT',
        time: '16:00',
        title: '📋 [LỆNH KHẢO SÁT GIÁM ĐỊNH MỚI]',
        content:
          'Xe 51C-889.22 vừa hạ rỗng Cont MRKU3322110 tại Block A-04. Kính mời Giám định viên Nguyễn Văn An chụp ảnh e-EIR IICL-6.',
        actions: [
          { label: '📸 Mở Form Giám Định e-EIR', actionId: 'OPEN_SURVEY', type: 'primary' }
        ]
      }
    ],
    TRUCKING: [
      {
        id: 'msg-t1',
        sender: 'DEPOT_BOT',
        time: '15:15',
        title: '🚛 [SẴN SÀNG CẤP VỎ] - Lệnh DO BK-2026-8812',
        content:
          'Container TEMU5544332 (40HC) đã sẵn sàng tại Block B-05-01. Tài xế Tân Cảng STC có thể cho xe vào bốc vỏ.',
        actions: [
          { label: '📱 Lấy Mã QR Cổng Gate-Out', actionId: 'GET_GATEOUT_QR', type: 'primary' }
        ]
      }
    ]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteAction = (persona: string, msgId: string, actionId: string) => {
    const currentList = chatMessages[persona] || [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (actionId === 'APPROVE_ESTIMATE') {
      // Mark action done and append reply message
      const updated = currentList.map((m) =>
        m.id === msgId ? { ...m, isActionDone: true, actionDoneText: 'Đã phê duyệt báo giá EST-2026-0842 thành công' } : m
      );
      const replyUser: SimulatedMessage = {
        id: `reply-${Date.now()}`,
        sender: 'USER',
        time: now,
        content: 'Tôi đã bấm phê duyệt báo giá EST-2026-0842 cho cont MAEU5566778. Xin tiến hành sửa chữa nhanh chóng.'
      };
      const botAck: SimulatedMessage = {
        id: `ack-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '🎉 [XÁC NHẬN DUYỆT BÁO GIÁ THÀNH CÔNG]',
        content:
          'Cảm ơn Quý Hãng tàu MAERSK LINE!\nLệnh sửa chữa WO-2026-00125 đã được chuyển ngay đến Đội thợ EMR để bắt đầu thi công.'
      };
      setChatMessages({ ...chatMessages, [persona]: [...updated, replyUser, botAck] });
      showToast('✅ Đã gửi lệnh Phê Duyệt Estimate qua cổng Zalo OA Gateway!');
    } else if (actionId === 'REJECT_ESTIMATE') {
      const updated = currentList.map((m) =>
        m.id === msgId ? { ...m, isActionDone: true, actionDoneText: 'Đã từ chối báo giá' } : m
      );
      const replyUser: SimulatedMessage = {
        id: `reply-${Date.now()}`,
        sender: 'USER',
        time: now,
        content: 'Yêu cầu kiểm tra lại đơn giá nhân công của Estimate EST-2026-0842.'
      };
      setChatMessages({ ...chatMessages, [persona]: [...updated, replyUser] });
      showToast('⚠️ Đã gửi phản hồi từ chối báo giá đến MNR Estimator');
    } else if (actionId === 'REQUEST_MATERIAL') {
      const replyUser: SimulatedMessage = {
        id: `reply-${Date.now()}`,
        sender: 'USER',
        time: now,
        content: 'Đã gửi yêu cầu cấp 02 Tấm tôn vách Corten cho lệnh WO-2026-00125.'
      };
      const botAck: SimulatedMessage = {
        id: `ack-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '📦 [KHO ĐÃ TIẾP NHẬN YÊU CẦU VẬT TƯ]',
        content: 'Thủ kho Lê Hoàng Cường đã nhận yêu cầu cấp vật tư. Phiếu PXK đang được in ra tại quầy xuất kho.'
      };
      setChatMessages({ ...chatMessages, [persona]: [...currentList, replyUser, botAck] });
      showToast('📦 Đã tạo phiếu yêu cầu cấp vật tư EMR');
    } else if (actionId === 'REWORK_DONE') {
      const replyUser: SimulatedMessage = {
        id: `reply-${Date.now()}`,
        sender: 'USER',
        time: now,
        content: 'Tổ thợ đã hàn mài lại vách tôn L3 Cont MSKU1234567. Kính mời QC kiểm tra lại.'
      };
      const botAck: SimulatedMessage = {
        id: `ack-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '🔍 [ĐÃ ĐẶT LỊCH QC LẠI]',
        content: 'Thông báo đã gửi đến Kỹ sư QC Phạm Minh Đức để nghiệm thu lại.'
      };
      setChatMessages({ ...chatMessages, [persona]: [...currentList, replyUser, botAck] });
      showToast('✨ Đã gửi thông báo nghiệm thu lại cho QC');
    } else if (actionId === 'OPEN_SURVEY') {
      if (onNavigateTab) onNavigateTab('survey');
      showToast('Chuyển hướng sang màn hình Giám Định e-EIR...');
    } else if (actionId === 'GET_GATEOUT_QR') {
      const botAck: SimulatedMessage = {
        id: `ack-${Date.now()}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '📲 [MÃ QR CỔNG XUẤT GATE-OUT]',
        content: 'Mã QR cấp vỏ: QR-GO-88129-TEMU5544332. Vui lòng trình mã này tại cabin Cổng Xuất.'
      };
      setChatMessages({ ...chatMessages, [persona]: [...currentList, botAck] });
      showToast('Đã phát hành mã QR Gate-Out');
    } else {
      showToast(`Đã thực thi thao tác: ${actionId}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SimulatedMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      time: now,
      content: inputMessage
    };

    let botReply: SimulatedMessage;
    const lower = inputMessage.toLowerCase();

    if (lower.includes('tracuu') || lower.includes('cont') || lower.includes('msku') || lower.includes('maeu')) {
      botReply = {
        id: `bot-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '🔍 [KẾT QUẢ TRA CỨU CONTAINER]',
        content:
          'Thông tin Container MAEU5566778 (40HC):\n- Hãng tàu: MAERSK LINE\n- Trạng thái: SỬA CHỮA (WO-2026-00125)\n- Vị trí: Block Bay 4 (Khu Sửa Chữa)\n- Tiến độ: 65% (Dự kiến xong 18:00)'
      };
    } else if (lower.includes('estimate') || lower.includes('baogia')) {
      botReply = {
        id: `bot-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '📋 [DANH SÁCH BÁO GIÁ ĐANG CHỜ]',
        content: 'Quý khách đang có 02 báo giá chờ duyệt:\n1. EST-2026-0842 (MAEU5566778 - 4.55tr)\n2. EST-2026-0841 (CMAU7788990 - 3.2tr)'
      };
    } else {
      botReply = {
        id: `bot-${Date.now() + 1}`,
        sender: 'DEPOT_BOT',
        time: now,
        title: '🤖 [TỰ ĐỘNG PHẢN HỒI ZALO OA]',
        content: `Cảm ơn quý khách đã gửi tin: "${inputMessage}". Tổng đài CSKH Depot đã ghi nhận và phản hồi trong ít phút.`
      };
    }

    setChatMessages({
      ...chatMessages,
      [selectedPersona]: [...(chatMessages[selectedPersona] || []), userMsg, botReply]
    });
    setInputMessage('');
  };

  const currentMessages = chatMessages[selectedPersona] || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-blue-400">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode Header Banner */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">CHẾ ĐỘ MÔ PHỎNG ZALO CHAT TƯƠNG TÁC (SIMULATOR)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                LIVE INTERACTION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trải nghiệm thực tế góc nhìn người nhận khi hệ thống Depot gửi tin nhắn Zalo OA & ZNS
            </p>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setSelectedPersona('MAERSK_CUST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedPersona === 'MAERSK_CUST'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hãng Tàu Maersk</span>
          </button>

          <button
            onClick={() => setSelectedPersona('REPAIR_LEAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedPersona === 'REPAIR_LEAD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Tổ Trưởng Thợ Sửa Chữa</span>
          </button>

          <button
            onClick={() => setSelectedPersona('SURVEYOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedPersona === 'SURVEYOR'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Giám Định Viên</span>
          </button>

          <button
            onClick={() => setSelectedPersona('TRUCKING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedPersona === 'TRUCKING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Đơn Vị Vận Tải</span>
          </button>
        </div>
      </div>

      {/* Main Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Persona Profile & Quick Triggers */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-base text-sky-400 border border-slate-700">
                {selectedPersona === 'MAERSK_CUST'
                  ? 'MSK'
                  : selectedPersona === 'REPAIR_LEAD'
                  ? 'TB'
                  : selectedPersona === 'SURVEYOR'
                  ? 'AN'
                  : 'STC'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {selectedPersona === 'MAERSK_CUST'
                    ? 'David Phạm (Maersk EMR Desk)'
                    : selectedPersona === 'REPAIR_LEAD'
                    ? 'Trần Thị Bích (Repair Lead)'
                    : selectedPersona === 'SURVEYOR'
                    ? 'Nguyễn Văn An (Senior Surveyor)'
                    : 'Nguyễn Văn Hùng (Tân Cảng STC)'}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedPersona === 'MAERSK_CUST'
                    ? 'Hãng Tàu Khách Hàng • Zalo ID: zalo_maersk_mnr_vn'
                    : selectedPersona === 'REPAIR_LEAD'
                    ? 'Kỹ Thuật Sửa Chữa • Zalo ID: zalo_bich_tran_0912'
                    : selectedPersona === 'SURVEYOR'
                    ? 'Đội Giám Định • Zalo ID: zalo_an_nguyen_0903'
                    : 'Đội Xe Nâng/Vận Tải • Zalo ID: zalo_tancang_stc_ops'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Trạng thái Zalo OA:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Đang hoạt động (Followed OA)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Loại tin nhận:</span>
                <span className="font-semibold text-slate-200">Zalo OA Message & ZNS Zalo</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Quyền tương tác:</span>
                <span className="font-semibold text-sky-400">Duyệt Báo Giá, Tra Cứu, Tạo WO</span>
              </div>
            </div>

            {/* Quick Testing Actions */}
            <div className="pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Bắn Thử Thông Báo Mẫu Tức Thì:
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const newMsg: SimulatedMessage = {
                      id: `quick-${Date.now()}`,
                      sender: 'DEPOT_BOT',
                      time: now,
                      title: '🔔 [CẢNH BÁO TIẾN ĐỘ SỬA CHỮA] - WO-2026-00125',
                      content:
                        'Container MAEU5566778 đang hoàn thiện 80%. Dự kiến chuyển qua khu vực QC lúc 17:30.',
                      actions: [{ label: '🔍 Mở Work Order', actionId: 'OPEN_WO', type: 'secondary' }]
                    };
                    setChatMessages({
                      ...chatMessages,
                      [selectedPersona]: [...currentMessages, newMsg]
                    });
                    showToast('Đã gửi thông báo mẫu vào điện thoại!');
                  }}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition cursor-pointer"
                >
                  <span>⚡ Gửi Báo Cáo Tiến Độ Sửa Chữa</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const newMsg: SimulatedMessage = {
                      id: `quick-${Date.now()}`,
                      sender: 'DEPOT_BOT',
                      time: now,
                      title: '💰 [CẬP NHẬT BIÊN LAI VIETQR] - 500,000 VND',
                      content:
                        'Đã ghi nhận thanh toán phí vệ sinh cho Cont ONEU4433221. Biên lai điện tử: BL-2026-9901.',
                      actions: [{ label: '📄 Tải Biên Lai Thu', actionId: 'GET_RECEIPT', type: 'secondary' }]
                    };
                    setChatMessages({
                      ...chatMessages,
                      [selectedPersona]: [...currentMessages, newMsg]
                    });
                    showToast('Đã gửi biên lai VietQR!');
                  }}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition cursor-pointer"
                >
                  <span>⚡ Gửi Xác Nhận Thanh Toán VietQR</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Smartphone Live Interactive Screen */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-[460px] bg-[#0c1428] border-8 border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative text-slate-100">
            {/* Phone Top Speaker & Notch */}
            <div className="h-7 bg-slate-950 flex items-center justify-between px-6 text-[11px] text-slate-400 select-none">
              <span className="font-semibold text-white">09:41</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Zalo Header Bar */}
            <div className="bg-[#0068ff] px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-xs text-[#0068ff] shadow">
                  EMR
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-white">EMR Depot Container Official</span>
                    <CheckCircle2 className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  </div>
                  <span className="text-[10px] text-blue-100 block">Zalo Official Account Doanh Nghiệp</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-700 text-white">
                Depot Bot
              </span>
            </div>

            {/* Messages Chat Area */}
            <div className="p-3.5 bg-[#e5ebf0] min-h-[480px] max-h-[520px] overflow-y-auto flex flex-col gap-3 text-slate-800 font-sans">
              <div className="flex justify-center my-1">
                <span className="px-3 py-1 rounded-full bg-slate-300/80 text-[10px] font-bold text-slate-600">
                  Tin nhắn tự động từ Hệ Thống Depot EMR
                </span>
              </div>

              {currentMessages.map((msg) => {
                const isBot = msg.sender === 'DEPOT_BOT';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-fade-in`}
                  >
                    {isBot ? (
                      /* Official Zalo Notification Card */
                      <div className="max-w-[92%] bg-white rounded-2xl p-3.5 shadow-md border border-slate-200/80 flex flex-col gap-2">
                        {msg.title && (
                          <div className="pb-1.5 border-b border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 leading-snug">
                              {msg.title}
                            </h4>
                          </div>
                        )}

                        <div className="text-[11.5px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>

                        {/* Interactive Buttons */}
                        {msg.actions && msg.actions.length > 0 && !msg.isActionDone && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                            {msg.actions.map((act) => (
                              <button
                                key={act.actionId}
                                onClick={() => handleExecuteAction(selectedPersona, msg.id, act.actionId)}
                                className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95 ${
                                  act.type === 'success'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : act.type === 'danger'
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : act.type === 'primary'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                }`}
                              >
                                <span>{act.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {msg.isActionDone && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>{msg.actionDoneText || 'Thao tác đã hoàn thành'}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            EMR Verified
                          </span>
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    ) : (
                      /* User Chat Bubble */
                      <div className="max-w-[85%] bg-[#0068ff] text-white rounded-2xl rounded-tr-sm p-3 shadow-md text-xs leading-relaxed">
                        <p>{msg.content}</p>
                        <span className="text-[9px] text-blue-200 block text-right mt-1 font-mono">
                          {msg.time} • Đã xem
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white p-2.5 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn hoặc gõ 'tracuu CONT', 'estimate'..."
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2 bg-[#0068ff] hover:bg-[#0057d6] text-white rounded-xl transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Home Indicator */}
            <div className="h-5 bg-slate-950 flex items-center justify-center">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
