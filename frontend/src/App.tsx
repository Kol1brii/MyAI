import { useState, useMemo, useRef, useEffect } from 'react';
import { Menu, X, Search, Check, ChevronDown, RotateCcw, Sparkles, Plus, LogOut } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ErrorBanner } from './components/ErrorBanner';
import { cn } from './utils/cn';
import { AuthView } from './components/Auth/AuthView';

// Import icons statically to support inlining by viteSingleFile
import groqIcon from './assets/icons/groq.png';
import metaLlamaIcon from './assets/icons/meta-llama.png';
import openaiIcon from './assets/icons/openai.png';
import qwenIcon from './assets/icons/qwen.png';

const iconMap: Record<string, string> = {
  'groq': groqIcon,
  'meta-llama': metaLlamaIcon,
  'openai': openaiIcon,
  'qwen': qwenIcon,
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("[App] Initialization started");
    
    const initAuth = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        console.log("[App] Tokens in storage:", { 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken 
        });

        if (accessToken) {
          console.log("[App] Access token found, setting auth to true");
          setIsAuthenticated(true);
        } else {
          console.log("[App] No access token, setting auth to false");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("[App] Error during auth initialization:", err);
        setIsAuthenticated(false);
      }
    };

    initAuth();

    const handleAuthSuccess = () => {
      console.log("[App] Auth success event received");
      setIsAuthenticated(true);
    };
    const handleUnauthorized = () => {
      console.log("[App] Unauthorized event received");
      setIsAuthenticated(false);
    };

    window.addEventListener('auth_success', handleAuthSuccess);
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth_success', handleAuthSuccess);
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogout = () => {
    console.log("[App] Logging out...");
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    reset,
    models,
    selectedModel,
    setSelectedModel
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [modelSearch, setModelMenuSearch] = useState('');

  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredModels = useMemo(() => {
    return models.filter(m => 
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [models, modelSearch]);

  const isInitial = messages.length === 0 && !isLoading;

  // 1. LOADING STATE: null
  if (isAuthenticated === null) {
    console.log("[App] Rendering LOADING state");
    return <div className="h-screen w-screen bg-[var(--color-canvas)]" />;
  }

  // 2. UNAUTHENTICATED STATE: false
  if (isAuthenticated === false) {
    console.log("[App] Rendering AUTH state");
    return <AuthView />;
  }

  // 3. AUTHENTICATED STATE: true
  console.log("[App] Rendering CHAT state");
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text)]">
      
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside 
        className={cn(
          "relative z-50 flex flex-col bg-[var(--color-surface)] border-r border-[rgba(98,102,114,0.15)] transition-all duration-300 ease-in-out h-full",
          isSidebarOpen ? "w-[240px]" : "w-[68px]"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Menu Toggle & New Chat Row */}
          <div className="flex flex-col gap-4 p-3.5 border-b border-[rgba(98,102,114,0.1)]">
             {/* Toggle Button */}
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[rgba(98,102,114,0.1)] transition-colors shrink-0"
             >
               {isSidebarOpen ? (
                 <X size={20} className="animate-in fade-in spin-in-90 duration-300" />
               ) : (
                 <Menu size={20} className="animate-in fade-in spin-in-negative-90 duration-300" />
               )}
             </button>

             {/* New Chat Button */}
             <button 
               onClick={reset}
               className={cn(
                 "flex items-center justify-center gap-2 h-10 rounded-xl border border-[rgba(98,102,114,0.2)] hover:bg-[rgba(38,203,124,0.05)] hover:border-[var(--color-accent)] transition-all overflow-hidden shrink-0",
                 isSidebarOpen ? "px-4 w-full" : "w-10"
               )}
               title="New Chat"
             >
               <Plus size={18} className={cn("shrink-0", isSidebarOpen ? "" : "m-0")} />
               {isSidebarOpen && (
                 <span className="text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                   New Chat
                 </span>
               )}
             </button>
          </div>

          {/* History Area */}
          <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
             {isSidebarOpen && (
               <>
                 <p className="text-[10px] font-bold text-[var(--color-subtle)] uppercase tracking-[0.1em] mb-4 animate-in fade-in duration-500">History</p>
                 <div className="text-sm text-[var(--color-subtle)] italic px-1 animate-in fade-in duration-500">No chat history yet</div>
               </>
             )}
          </div>

          {/* Logout Button in Sidebar Footer */}
          <div className="p-3.5 border-t border-[rgba(98,102,114,0.1)]">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center justify-center gap-2 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-[var(--color-subtle)] transition-all overflow-hidden shrink-0 w-full",
                isSidebarOpen ? "px-4" : "px-0"
              )}
              title="Выйти"
            >
              <LogOut size={18} className="shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap animate-in fade-in duration-300">
                  Выйти
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* ── Header ────────────────────────────────────────── */}
        <header className="flex items-center h-14 px-4 shrink-0 z-30 bg-[rgba(20,21,26,0.8)] backdrop-blur-md border-b border-[rgba(98,102,114,0.15)]">
          
          {/* Model Selector */}
          <div ref={modelMenuRef} className="relative ml-2">
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent hover:border-[rgba(98,102,114,0.3)] hover:bg-[rgba(98,102,114,0.05)] transition-all group"
            >
              {selectedModel && (
                <img 
                  src={iconMap[selectedModel.icon_key]} 
                  className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                  alt="" 
                  onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(138, 143, 160)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>')}
                />
              )}
              <span className="text-sm font-semibold text-[var(--color-heading)] group-hover:text-white transition-colors">
                {selectedModel?.name || 'Select Model'}
              </span>
              <ChevronDown 
                size={14} 
                className={cn("transition-transform duration-200", isModelMenuOpen ? "rotate-180" : "")} 
              />
            </button>

            {/* Model Dropdown */}
            {isModelMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--color-surface)] border border-[rgba(98,102,114,0.2)] rounded-2xl shadow-2xl overflow-hidden animate-dropdown-in">
                <div className="p-3 border-b border-[rgba(98,102,114,0.1)]">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)]" />
                    <input 
                      type="text" 
                      placeholder="Search models..."
                      value={modelSearch}
                      onChange={(e) => setModelMenuSearch(e.target.value)}
                      className="w-full bg-[rgba(20,21,26,0.5)] border border-[rgba(98,102,114,0.2)] rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto py-2 custom-scrollbar">
                  {filteredModels.map(model => {
                    const isSelected = selectedModel?.id === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelMenuOpen(false);
                          setModelMenuSearch('');
                        }}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2.5 hover:bg-[rgba(38,203,124,0.08)] transition-colors",
                          isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                           <img 
                            src={iconMap[model.icon_key]} 
                            className="w-5 h-5 object-contain opacity-80" 
                            alt="" 
                            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(138, 143, 160)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>')}
                          />
                          <span className="text-sm font-medium">{model.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-[var(--color-accent)]" />}
                      </button>
                    );
                  })}
                  {filteredModels.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-[var(--color-subtle)]">No models found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main Area ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="h-full flex flex-col">
            {isInitial ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full blur-3xl bg-[var(--color-accent)] opacity-20 scale-150" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-[rgba(38,203,124,0.1)] border border-[rgba(38,203,124,0.2)] text-[var(--color-accent)]">
                    <Sparkles size={36} />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-[var(--color-heading)] tracking-tight">How can I help today?</h1>
                <div className="w-full max-w-2xl mt-8 px-4">
                  <ChatInput onSubmit={sendMessage} isLoading={isLoading} placeholder="Ask anything..." />
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-8 pb-32">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                {error && <ErrorBanner message={error} />}
              </div>
            )}
          </div>
        </main>

        {/* ── Bottom Input ──────────────────────────────────── */}
        {!isInitial && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-canvas)] via-[var(--color-canvas)] to-transparent pt-12 pointer-events-none">
            <div className="mx-auto max-w-3xl pointer-events-auto">
              <ChatInput onSubmit={sendMessage} isLoading={isLoading} placeholder="Ask anything..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
