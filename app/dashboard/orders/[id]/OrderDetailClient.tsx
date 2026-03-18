'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Paperclip,
  Download,
  User,
  MoreVertical,
  ShieldCheck,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Order } from '@prisma/client';

// Mock data for chat
const initialMessages = [
  { id: 1, sender: 'system', text: 'Objednávka byla vytvořena.', time: '12. 10. 2024 09:00' },
];

export default function OrderDetailClient({ order, currentUser, technicians = [] }: { order: Order, currentUser: any, technicians?: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleAssign = async () => {
    if (!selectedTechId) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/company/orders/${order.readableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: selectedTechId }),
      });
      if (res.ok) {
        alert('Technik byl úspěšně přiřazen.');
        router.refresh();
      } else {
        alert('Došlo k chybě při přiřazování technika.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při přiřazování technika.');
    } finally {
      setIsAssigning(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleString('cs-CZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/dashboard/orders" className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Objednávka #{order.readableId}</h1>
            <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                order.status === 'COMPLETED' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                order.status === 'IN_PROGRESS' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                order.status === 'CANCELLED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            )}>
              {order.status === 'COMPLETED' ? 'Dokončeno' :
               order.status === 'IN_PROGRESS' ? 'Probíhá' :
               order.status === 'CANCELLED' ? 'Zrušeno' : 'Čeká'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Vytvořeno {new Date(order.createdAt).toLocaleDateString('cs-CZ')}</p>
        </div>
        <div className="ml-auto">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Column: Details & Timeline */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Status Timeline */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Průběh revize</h3>
            <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10"></div>
                <div className="space-y-8 relative">
                    {[
                        { status: 'Objednáno', date: new Date(order.createdAt).toLocaleString('cs-CZ'), active: true, completed: true },
                        { status: 'Přiřazen technik', date: order.technicianId ? 'Ano' : '-', active: !!order.technicianId, completed: !!order.technicianId, desc: order.technicianId ? 'Technik přiřazen' : '' },
                        { status: 'Naplánováno', date: '-', active: false, completed: false, current: false },
                        { status: 'Revize provedena', date: order.status === 'COMPLETED' ? 'Ano' : '-', active: order.status === 'COMPLETED', completed: order.status === 'COMPLETED' },
                        { status: 'Zpráva vystavena', date: order.status === 'COMPLETED' ? 'Ano' : '-', active: order.status === 'COMPLETED', completed: order.status === 'COMPLETED' },
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                            <div className={cn(
                                "relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-[#1A1A1A]",
                                step.completed ? "border-brand-yellow bg-brand-yellow text-black" :
                                step.current ? "border-brand-yellow text-brand-yellow animate-pulse" :
                                "border-gray-700 text-gray-700"
                            )}>
                                {step.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {step.current && <Clock className="w-3.5 h-3.5" />}
                            </div>
                            <div className={cn("pt-0.5", !step.active && "opacity-50")}>
                                <p className={cn("font-medium", step.current ? "text-brand-yellow" : "text-white")}>{step.status}</p>
                                <p className="text-xs text-gray-500">{step.date}</p>
                                {step.desc && <p className="text-sm text-gray-400 mt-1 bg-white/5 p-2 rounded border border-white/5">{step.desc}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Detaily objednávky</h3>
              {currentUser.role === 'COMPANY_ADMIN' && order.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    className="bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-brand-yellow outline-none"
                  >
                    <option value="">Přiřadit technika...</option>
                    {technicians.map((tech: any) => (
                      <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAssign}
                    disabled={isAssigning || !selectedTechId}
                    className="px-4 py-1.5 bg-brand-yellow text-black text-sm font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                  >
                    {isAssigning ? '...' : 'Přiřadit'}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Typ služby</p>
                            <p className="text-white font-medium">{order.serviceType}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Adresa</p>
                            <p className="text-white font-medium">{order.address}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Zákazník ID</p>
                            <p className="text-white font-medium">{order.customerId}</p>
                        </div>
                    </div>
                    {/* @ts-ignore */}
                    {order.technician && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Přiřazený technik</p>
                            {/* @ts-ignore */}
                            <p className="text-white font-medium">{order.technician.name || order.technician.email}</p>
                            {/* @ts-ignore */}
                            {order.technician.phone && <p className="text-xs text-gray-400">{order.technician.phone}</p>}
                        </div>
                      </div>
                    )}
                    {/* @ts-ignore */}
                    {!order.technician && order.company && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Přiřazená firma</p>
                            {/* @ts-ignore */}
                            <p className="text-white font-medium">{order.company.name || order.company.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Poznámka</p>
                            <p className="text-white text-sm">{order.notes || 'Bez poznámky'}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Documents (if any) */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Dokumenty</h3>
            {/* @ts-ignore */}
            {order.reportFile ? (
              <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-yellow/10 text-brand-yellow rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Revizní zpráva</p>
                    <p className="text-xs text-gray-500">PDF Dokument</p>
                  </div>
                </div>
                <a 
                  href={`/api/orders/${order.readableId}/download`} 
                  download 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> Stáhnout
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 border border-dashed border-white/10 rounded-lg text-gray-500">
                  <p>Zatím nebyly nahrány žádné dokumenty.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="w-full lg:w-1/3 flex flex-col bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden h-[600px] lg:h-auto">
            <div className="p-4 border-b border-white/5 bg-[#1A1A1A] flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-yellow" /> Komunikace
                </h3>
                <span className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111]">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        {msg.sender === 'system' ? (
                            <div className="w-full text-center my-2">
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{msg.text}</span>
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "p-3 rounded-xl text-sm",
                                    msg.sender === 'user' 
                                        ? "bg-brand-yellow text-black rounded-tr-none" 
                                        : "bg-[#252525] text-white rounded-tl-none border border-white/5"
                                )}>
                                    {msg.sender === 'technician' && (
                                        // @ts-ignore
                                        <p className="text-xs font-bold mb-1 opacity-70">{msg.name}</p>
                                    )}
                                    <p>{msg.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-600 mt-1 px-1">{msg.time}</span>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-[#1A1A1A] border-t border-white/5">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napište zprávu..." 
                        className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-yellow focus:outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="p-2 bg-brand-yellow text-black rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
