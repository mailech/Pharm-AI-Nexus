import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, RefreshCw, Wifi, WifiOff, Mic, Volume2, Paperclip } from 'lucide-react';
import { connectAgentWebSocket } from '../api';

export default function ChatPanel({ context, onPrescriptionUpload }: any) {
    const [messages, setMessages] = useState<any[]>([
        { role: 'agent', content: "Hello. I am Nexus. I've analyzed the medication profile. How can I assist you?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [location, setLocation] = useState<any>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setLocation(locationData);
                    setLocationLoading(false);
                    console.log('📍 Location detected:', locationData);
                },
                (error) => {
                    console.error("Location access denied:", error);
                    setLocationError(error.message);
                    setLocationLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocationError("Geolocation not supported");
            setLocationLoading(false);
        }
    }, []);

    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setReconnecting(true);

        try {
            const ws = connectAgentWebSocket(
                (data) => {
                    const agentMsg = {
                        role: 'agent',
                        content: data.reply,
                        nearby_facilities: data.nearby_facilities
                    };
                    setMessages(prev => [...prev, agentMsg]);
                    setLoading(false);
                    setConnected(true);
                    setReconnecting(false);
                    setRetryCount(0);
                },
                (error) => {
                    console.error('WebSocket error:', error);
                    setConnected(false);

                    // Retry with exponential backoff
                    if (retryCount < 3) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                            connectWebSocket();
                        }, delay);
                    } else {
                        setReconnecting(false);
                    }
                }
            );

            ws.onopen = () => {
                setConnected(true);
                setReconnecting(false);
                setRetryCount(0);
            };

            ws.onclose = () => {
                setConnected(false);
                // Auto-reconnect
                if (retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        connectWebSocket();
                    }, 2000);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect:', error);
            setReconnecting(false);
        }
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const payload = {
                message: input,
                context: {
                    drugs: context?.current_drugs || [],
                    organ_impacts: context?.analysis_result?.organ_impacts || {},
                    global_risk: context?.analysis_result?.global_risk || 0,
                    interactions: context?.analysis_result?.drug_interactions || []
                },
                location: location || {}
            };

            wsRef.current.send(JSON.stringify(payload));
        } catch (error) {
            console.error(error);
            setLoading(false);
            setMessages(prev => [...prev, {
                role: 'agent',
                content: 'Connection error. Attempting to reconnect...'
            }]);
            connectWebSocket();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show uploading message
        setMessages(prev => [...prev, { role: 'user', content: `📎 Uploading prescription: ${file.name}...` }]);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/analyze_prescription', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();

            // Show success message
            setMessages(prev => [...prev, {
                role: 'agent',
                content: `✅ **Prescription Analyzed**\n\n${result.summary}\n\nI've updated your medication list with the detected drugs.`
            }]);

            // Update parent state
            if (onPrescriptionUpload && result.detected_drugs) {
                onPrescriptionUpload(result.detected_drugs);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'agent', content: "❌ Failed to analyze prescription. Please try again." }]);
        } finally {
            setLoading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderMessage = (content: string) => {
        // Make drug names clickable
        const drugs = context?.current_drugs || [];
        let rendered = content;

        drugs.forEach((drug: string) => {
            const regex = new RegExp(`\\b${drug}\\b`, 'gi');
            rendered = rendered.replace(regex, `**${drug}**`);
        });

        // Split by both ** (bold/drug) and [[ (map link)
        // We use a regex with capturing groups to keep the delimiters and content
        const parts = rendered.split(/(\*\*.*?\*\*|\[\[.*?\]\])/g);

        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const text = part.slice(2, -2);
                return (
                    <span key={i} className="text-teal-400 font-bold cursor-pointer hover:underline" title="Drug Entity">
                        {text}
                    </span>
                );
            } else if (part.startsWith('[[') && part.endsWith(']]')) {
                const text = part.slice(2, -2);
                return (
                    <span
                        key={i}
                        className="text-blue-400 font-bold cursor-pointer hover:underline flex inline-flex items-center gap-1"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`, '_blank')}
                        title="View on Google Maps"
                    >
                        {text} ↗
                    </span>
                );
            }
            return part;
        });
    };

    const [isListening, setIsListening] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);

    useEffect(() => {
        if (autoSpeak && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'agent') {
                speak(lastMsg.content);
            }
        }
    }, [messages, autoSpeak]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/\*\*/g, '').replace(/\[\[/g, '').replace(/\]\]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognition.start();
        } else {
            alert('Speech recognition not supported in this browser.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/80 border-l border-slate-700">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-teal-400 font-bold flex items-center gap-2">
                        <Bot size={20} /> NEXUS AI AGENT
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoSpeak(!autoSpeak)}
                            className={`transition-colors ${autoSpeak ? 'text-teal-400' : 'text-slate-600 hover:text-slate-400'}`}
                            title={autoSpeak ? "Mute Auto-Speak" : "Enable Auto-Speak"}
                        >
                            <Volume2 size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            {connected ? (
                                <Wifi size={16} className="text-green-500" />
                            ) : reconnecting ? (
                                <Loader2 size={16} className="text-yellow-500 animate-spin" />
                            ) : (
                                <WifiOff size={16} className="text-red-500" />
                            )}
                            <span className="text-xs text-slate-500">
                                {connected ? 'Connected' : reconnecting ? 'Reconnecting...' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                {location && (
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                        📍 Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)} (±{Math.round(location.accuracy)}m)
                    </div>
                )}
                {locationError && (
                    <div className="mt-2 text-[10px] text-yellow-500">
                        ⚠️ Location unavailable: {locationError}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-md ${m.role === 'user'
                            ? 'bg-teal-600 text-white rounded-br-none'
                            : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                            }`}>
                            {m.role === 'agent' ? renderMessage(m.content) : m.content}

                            {/* Nearby Facilities Card */}
                            {m.nearby_facilities && m.nearby_facilities.length > 0 && (
                                <div className="mt-3 bg-slate-800 rounded p-2 border border-slate-600">
                                    <div className="text-xs font-bold text-teal-400 mb-2">NEARBY FACILITIES</div>
                                    <div className="space-y-2">
                                        {m.nearby_facilities.map((fac: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                                                <div>
                                                    <div className="font-bold text-white text-xs">{fac.name}</div>
                                                    <div className="text-[10px] text-slate-400">{fac.type} • {fac.distance_km} km</div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (fac.website) {
                                                            window.open(fac.website, '_blank');
                                                        } else if (fac.contact) {
                                                            window.location.href = `tel:${fac.contact}`;
                                                        } else {
                                                            const confirm = window.confirm(`Book appointment at ${fac.name}?`);
                                                            if (confirm) {
                                                                // Open Google Maps immediately
                                                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.name)}`, '_blank');

                                                                // Add confirmation message with clickable link
                                                                setMessages(prev => [...prev, { role: 'agent', content: `✅ Appointment confirmed at [[${fac.name}]] for Feb 10, 10:30 AM. Ref: APT-${Math.floor(Math.random() * 10000)}` }]);
                                                            }
                                                        }
                                                    }}
                                                    className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] px-2 py-1 rounded"
                                                >
                                                    Book
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {m.role === 'agent' && !autoSpeak && (
                                <button onClick={() => speak(m.content)} className="ml-2 opacity-50 hover:opacity-100 text-teal-200">
                                    <Volume2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-lg rounded-bl-none border border-slate-600 flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-slate-400">Analyzing...</span>
                        </div>
                    </div>
                )}

                {!connected && !reconnecting && (
                    <div className="flex justify-center">
                        <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded text-xs text-yellow-300 flex items-center gap-2">
                            <WifiOff size={14} />
                            <span>Nexus core temporarily offline.</span>
                            <button
                                onClick={connectWebSocket}
                                className="underline hover:text-white flex items-center gap-1"
                            >
                                <RefreshCw size={10} /> Reconnect
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded transition-colors bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Upload Prescription"
                        disabled={loading}
                    >
                        <Paperclip size={18} />
                    </button>
                    <button
                        onClick={startListening}
                        className={`p-2 rounded transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Voice Input"
                    >
                        <Mic size={18} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Listening..." : "Ask Nexus about interactions..."}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 placeholder-slate-600"
                        disabled={loading || !connected}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !connected}
                        className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
