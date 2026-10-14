import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Headphones,
  MessageSquare,
  Ticket,
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Bot,
  User,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  SendHorizontal,
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  accountId: string;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface SupportTicketItem {
  id: string;
  subject: string;
  department: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  lastReply: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  accountId,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq' | 'contact'>('chat');

  // Live Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hello! Welcome to Quotex Pro 24/7 Support Center. I am Sarah from the Priority Support team. How can I assist you with your trading, deposits, or account today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicketItem[]>([
    {
      id: 'TKT-94812',
      subject: 'Verification status inquiry',
      department: 'Verification & KYC',
      status: 'resolved',
      date: 'Yesterday, 14:22',
      lastReply: 'Your identity documents have been pre-approved.',
    },
  ]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDept, setNewTicketDept] = useState('Deposits & Withdrawals');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // FAQ Accordion State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I place a trade on Quotex Pro?',
      a: 'Select your preferred asset from the top tabs (e.g., EUR/USD OTC, UKBrent, Gold). Choose your trade duration (default 1 minute) and your investment amount. Click the green "Buy" button if you expect the price to rise, or the red "Sell" button if you expect the price to fall. When your trade is placed, it appears immediately on the chart dashboard and in your active trades list.',
    },
    {
      q: 'Why didn’t my trade line appear on the chart?',
      a: 'In the updated Quotex Pro interface, long screen-crossing lines have been replaced with a clean, high-definition Trade Entry Badge directly on the candle. Active trades are also shown prominently in the Live Trades Dock on your dashboard and in the right trading panel.',
    },
    {
      q: 'How fast are deposits credited to my account?',
      a: 'Deposits via Cryptocurrency (USDT, BTC, ETH), Binance Pay, E-wallets, and Local Banking are credited instantly (within 1 to 3 minutes) with 0% commission. You also receive up to a 50% deposit bonus.',
    },
    {
      q: 'How do I withdraw my trading profits?',
      a: 'Click the "Withdrawal" button in the top header. Enter your desired withdrawal amount (minimum $10) and select your payout wallet or account. Withdrawals are processed within 15 to 60 minutes with 0% platform fee.',
    },
    {
      q: 'How do I reset my Demo Account balance?',
      a: 'You can reset your Demo Account to the initial $10,000.00 at any time by clicking the account dropdown in the top header and choosing "Reset Demo Balance".',
    },
    {
      q: 'What is the minimum investment per trade?',
      a: 'The minimum investment is just $1 (or 19 $ recommended for standard contracts), allowing traders of all experience levels to practice risk management.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  if (!isOpen) return null;

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsTyping(true);

    // Realistic intelligent agent responses tailored to Quotex trading
    setTimeout(() => {
      let replyText =
        'Thank you for reaching out! Our Quotex support team is actively reviewing your request. All features are running at 100% operational capacity.';

      const lower = textToSend.toLowerCase();
      if (lower.includes('trade') || lower.includes('tread') || lower.includes('lagata') || lower.includes('dashboard')) {
        replyText =
          'When you click Buy (▲) or Sell (▼), your trade is recorded with real-time entry price and countdown. It shows on the dashboard chart pin and in the right panel "Trades" tab with live payout calculations.';
      } else if (lower.includes('deposit') || lower.includes('paisa') || lower.includes('bonus')) {
        replyText =
          'You can deposit easily using the green "Deposit" button in the top bar. Choose Crypto (USDT TRC20/ERC20), Binance Pay, or Local Banks. Enjoy a 50% extra bonus on your deposit!';
      } else if (lower.includes('withdraw') || lower.includes('nikalna') || lower.includes('cashout')) {
        replyText =
          'Withdrawals are processed 24/7 with 0% fee. Average payout processing time is between 15 to 45 minutes to your designated wallet.';
      } else if (lower.includes('demo') || lower.includes('reset') || lower.includes('10000')) {
        replyText =
          'You can reset your Demo Account balance back to $10,000.00 anytime from the top-right account dropdown by clicking "Reset Demo Balance".';
      } else if (lower.includes('hd') || lower.includes('quality') || lower.includes('display')) {
        replyText =
          'Quotex Pro is optimized in ultra Full HD with 2x High-DPI canvas rendering, subpixel smoothing, and high-frequency real-time tick streaming.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1100);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;

    const newTicket: SupportTicketItem = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: newTicketSubject,
      department: newTicketDept,
      status: 'open',
      date: 'Just now',
      lastReply: 'Ticket received by Quotex Senior Support Team.',
    };

    setTickets((prev) => [newTicket, ...prev]);
    setTicketSubmitted(true);
    setNewTicketSubject('');
    setNewTicketMsg('');

    setTimeout(() => {
      setTicketSubmitted(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#131722] border border-[#232d3f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#181d2a] border-b border-[#232d3f] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070f3]/20 border border-[#0070f3]/40 flex items-center justify-center text-[#0070f3]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  QUOTEX 24/7 SUPPORT CENTER
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Account ID: <span className="font-mono text-slate-300 font-bold">{accountId}</span> •{' '}
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#202738] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#232d3f] bg-[#141924]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-[#0070f3] text-white bg-[#1a202e]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#0070f3]" />
            <span>Live Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'border-[#0070f3] text-white bg-[#1a202e]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>Support Tickets</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#252f44] text-slate-300">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-[#0070f3] text-white bg-[#1a202e]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Knowledge Base & FAQs</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-[#0070f3] text-white bg-[#1a202e]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Official Contacts</span>
          </button>
        </div>

        {/* Tab 1: Live Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-[420px]">
            {/* Agent Header banner */}
            <div className="p-2.5 rounded-xl bg-[#181f2c] border border-[#263145] flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0070f3] to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                    SM
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#181f2c]" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Sarah Miller
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Senior Support Officer • Avg response: &lt; 1 min
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                Priority Tier
              </span>
            </div>

            {/* Quick Questions Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" /> Quick help:
              </span>
              {[
                'How to deposit funds? 💳',
                'Trade not showing on dashboard? 📈',
                'How fast is withdrawal? ⏱️',
                'Reset demo balance to $10,000 🔄',
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(pill)}
                  className="px-2.5 py-1 rounded-lg bg-[#192130] hover:bg-[#222d42] border border-[#29364f] text-[10px] font-semibold text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-[#0e121a] rounded-xl border border-[#1e2535]">
              {messages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAgent && (
                      <div className="w-7 h-7 rounded-full bg-[#0070f3] flex items-center justify-center text-white shrink-0 text-xs font-bold">
                        Q
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-[#1a2130] text-slate-200 border border-[#27334a]'
                          : 'bg-[#0070f3] text-white shadow-md shadow-blue-500/20'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right font-mono ${
                          isAgent ? 'text-slate-500' : 'text-blue-200'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                    {!isAgent && (
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                  <div className="w-6 h-6 rounded-full bg-[#0070f3]/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#0070f3]" />
                  </div>
                  <div className="flex gap-1 items-center bg-[#1a2130] px-3 py-1.5 rounded-full border border-[#27334a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your question here (e.g. trading, deposit, withdrawal)..."
                className="flex-1 bg-[#161c28] border border-[#263145] focus:border-[#0070f3] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#0070f3] hover:bg-[#0060d0] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Send</span>
                <SendHorizontal className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Tickets */}
        {activeTab === 'tickets' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 min-h-[420px]">
            {ticketSubmitted && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Ticket created successfully! Our team will respond shortly.
              </div>
            )}

            {/* Create Ticket Form */}
            <div className="bg-[#181f2c] border border-[#263145] rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#0070f3]" />
                Create a New Support Ticket
              </h3>

              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Brief summary of your question"
                      className="w-full bg-[#10141d] border border-[#263145] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0070f3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Department</label>
                    <select
                      value={newTicketDept}
                      onChange={(e) => setNewTicketDept(e.target.value)}
                      className="w-full bg-[#10141d] border border-[#263145] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0070f3]"
                    >
                      <option value="Deposits & Withdrawals">Deposits & Withdrawals</option>
                      <option value="Trading Platform & Execution">Trading Platform & Execution</option>
                      <option value="Verification & KYC">Verification & KYC</option>
                      <option value="Account Settings & Security">Account Settings & Security</option>
                      <option value="General Inquiries">General Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Detailed Message</label>
                  <textarea
                    rows={3}
                    required
                    value={newTicketMsg}
                    onChange={(e) => setNewTicketMsg(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-[#10141d] border border-[#263145] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0070f3] resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0070f3] hover:bg-[#0060d0] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>

            {/* Ticket List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Your Tickets ({tickets.length})
              </h3>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-[#161c27] border border-[#263145] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400 text-[11px]">{t.id}</span>
                      <span className="font-bold text-white">{t.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{t.lastReply}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>Dept: {t.department}</span>
                      <span>Date: {t.date}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      t.status === 'resolved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: FAQ */}
        {activeTab === 'faq' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 min-h-[420px]">
            {/* Search FAQ */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help topics (e.g. trade, deposit, withdrawal, demo)..."
                className="w-full bg-[#181f2c] border border-[#263145] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0070f3]"
              />
            </div>

            {/* Accordions */}
            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#263145] rounded-xl bg-[#161c27] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-bold text-white hover:text-[#0070f3] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#1f283a]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Official Contacts */}
        {activeTab === 'contact' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[420px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#181f2c] border border-[#263145] rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#0070f3] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Official Email Support</h4>
                <p className="text-[11px] text-slate-400">
                  Send your inquiries or verification proofs directly to our financial and technical desk.
                </p>
                <div className="pt-2 font-mono text-xs font-bold text-[#0070f3]">
                  support@quotex.io
                </div>
              </div>

              <div className="p-4 bg-[#181f2c] border border-[#263145] rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Working Hours</h4>
                <p className="text-[11px] text-slate-400">
                  Our trading operations and support engineers operate 24 hours a day, 7 days a week, including OTC weekends.
                </p>
                <div className="pt-2 text-xs font-bold text-emerald-400">
                  24/7/365 Non-Stop Support
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#141924] border border-[#232d3f] rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white">Telegram Community & Signals</div>
                <div className="text-[11px] text-slate-400">
                  Get official announcements, market insights, and trading signals.
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-[#0070f3] text-white font-bold text-xs">
                @QuotexOfficial
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
