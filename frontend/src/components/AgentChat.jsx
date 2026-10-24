import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Bot, 
  User, 
  Sparkles, 
  Layers, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Volume2
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function AgentChat({ initialQuery = '', onSelectTicket }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "👋 Welcome to **CivicPulse AI**! I am your autonomous AMC municipal assistant.\n\nYou can ask me:\n• *\"What is the status of ticket AMC-2026-WZ-88412?\"*\n• *\"Report a deep pothole on SG Highway\"*\n• *\"Why is my complaint taking so long?\"*\n\nHow can I help you today?",
      tools: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [expandedTools, setExpandedTools] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Web Speech API for voice input
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSpeechSynthesis = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown symbols
      const clean = text.replace(/[*#`_>]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() && !attachedImage) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      image: attachedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const currentAttachment = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend, currentAttachment);
      const agentMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: res.reply,
        tools: res.tools_called || [],
        ticketData: res.ticket_data,
        socialAdvocacy: res.social_advocacy,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: `⚠️ Error communicating with civic agent: ${err.message}`,
          tools: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleToolExpand = (msgId, toolIdx) => {
    const key = `${msgId}-${toolIdx}`;
    setExpandedTools((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const quickPrompts = [
    "What's the status of ticket AMC-2026-WZ-88412?",
    "Check status of AMC-2026-NW-39185 (SLA Breached)",
    "Report deep road crater on SG Highway",
    "What is AMC's guaranteed SLA for potholes?"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[760px] overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">CivicPulse Conversational AI</h2>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  ReAct Agent Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous reasoning, multi-turn dialogue, tool execution</p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isAgent ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isAgent
                      ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/40'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAgent
                        ? 'bg-slate-950/90 border border-slate-800 text-slate-200'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-md'
                    }`}
                  >
                    {msg.image && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 max-h-48">
                        <img src={msg.image} alt="User attachment" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {isAgent && (
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleSpeechSynthesis(msg.text)}
                          className="hover:text-cyan-400 flex items-center space-x-1"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Voice</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tool Call Traces Accordion */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="space-y-1.5 pl-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Agent Reasoning & Tool Invocations ({msg.tools.length})</span>
                      </div>
                      {msg.tools.map((t, idx) => {
                        const key = `${msg.id}-${idx}`;
                        const isExpanded = Boolean(expandedTools[key]);
                        const toolName = t.tool || (t.output && t.output.tool) || `tool_${idx + 1}`;

                        return (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800/90 rounded-xl overflow-hidden text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => toggleToolExpand(msg.id, idx)}
                              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/40 text-slate-300 font-mono"
                            >
                              <span className="text-cyan-400 font-bold">{toolName}()</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">Executed</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="p-3 border-t border-slate-800 bg-black/40 text-[11px] font-mono text-slate-400 space-y-2">
                                <div>
                                  <span className="text-slate-500 uppercase block text-[9px]">Inputs:</span>
                                  <pre className="text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(t.inputs, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-slate-500 uppercase block text-[9px]">Output:</span>
                                  <pre className="text-emerald-300 bg-slate-900 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(t.output, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Agent reasoning: evaluating intent and orchestrating AMC tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Try:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          {attachedImage && (
            <div className="mb-2 flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              <span className="flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Photo attached ready for computer vision</span>
              </span>
              <button
                onClick={() => setAttachedImage(null)}
                className="text-red-400 hover:text-red-300 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Attachment Button */}
            <label className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition-colors">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setAttachedImage(reader.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={isListening ? 'Listening...' : 'Speak using microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything (e.g. 'What is the status of AMC-2026-WZ-88412?')..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />

            {/* Send Button */}
            <button
              type="button"
              disabled={loading || (!input.trim() && !attachedImage)}
              onClick={() => handleSend()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-md shadow-cyan-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
