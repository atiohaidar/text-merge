import React, { useState, useEffect, useRef } from 'react';
import { MergeSegment, SegmentType } from '../types';
import { Check, X, ArrowLeftRight, Copy, Eye, List, ArrowDown, ArrowUp, ScanLine, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from './Button';

interface MergeEditorProps {
  segments: MergeSegment[];
  onReset: () => void;
  labelA?: string;
  labelB?: string;
  animate?: boolean;
}

export const MergeEditor: React.FC<MergeEditorProps> = ({ 
    segments, 
    onReset, 
    labelA = "Versi 1", 
    labelB = "Versi 2",
    animate = false
}) => {
  // Map of segment index to decision ('A' | 'B' | 'A+B' | 'B+A')
    const [decisions, setDecisions] = useState<Record<number, 'A' | 'B' | 'A+B' | 'B+A'>>({});
    // Undo / Redo stacks for decisions
    const [undoStack, setUndoStack] = useState<Record<number, 'A' | 'B' | 'A+B' | 'B+A' | undefined>[]>([]);
    const [redoStack, setRedoStack] = useState<Record<number, 'A' | 'B' | 'A+B' | 'B+A' | undefined>[]>([]);
  const [finalText, setFinalText] = useState('');
  const [isViewingResult, setIsViewingResult] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Animation state: How many segments are currently visible (for scanning effect)
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : segments.length);

  // Trigger Scanning Effect on Mount
  useEffect(() => {
    if (!animate) {
        setVisibleCount(segments.length);
        return;
    }
    
    setVisibleCount(0);
    // Determine speed based on length (max 2 seconds total, min 20ms per item)
    const speed = Math.max(20, Math.min(100, 2000 / segments.length));
    
    const interval = setInterval(() => {
        setVisibleCount(prev => {
            if (prev >= segments.length) {
                clearInterval(interval);
                return prev;
            }
            return prev + 1;
        });
    }, speed);

    return () => clearInterval(interval);
  }, [segments, animate]);

  // Auto-generate preview text based on decisions
  useEffect(() => {
    const text = segments.map((seg, index) => {
      if (seg.type === SegmentType.CONTENT) return seg.content || '';
      if (seg.type === SegmentType.CONFLICT) {
        const choice = decisions[index];
        
        // Smart separator: use newline if either option has multiline content, otherwise space
        const hasNewline = (seg.optionA && seg.optionA.includes('\n')) || (seg.optionB && seg.optionB.includes('\n'));
        const separator = hasNewline ? '\n' : ' ';

        if (choice === 'A') return seg.optionA || '';
        if (choice === 'B') return seg.optionB || '';
        if (choice === 'A+B') return (seg.optionA || '') + separator + (seg.optionB || '');
        if (choice === 'B+A') return (seg.optionB || '') + separator + (seg.optionA || '');
        
        // If undecided, show a placeholder
        return `[CONFLICT: ${seg.reason || 'Select Option'}]`;
      }
      return '';
    }).join('');
    setFinalText(text);
  }, [segments, decisions]);

    const handleDecision = (index: number, choice: 'A' | 'B' | 'A+B' | 'B+A') => {
        setDecisions(prev => {
            // push previous state to undo stack
            setUndoStack(u => [...u.slice(-49), { ...prev }]);
            setRedoStack([]);
            return { ...prev, [index]: choice };
        });
    };

    const canUndo = undoStack.length > 0;
    const canRedo = redoStack.length > 0;

    const handleUndo = () => {
        if (!canUndo) return;
        const last = undoStack[undoStack.length - 1];
        setUndoStack(u => u.slice(0, -1));
        setRedoStack(r => [...r, { ...decisions }]);
        setDecisions(last || {});
    };

    const handleRedo = () => {
        if (!canRedo) return;
        const next = redoStack[redoStack.length - 1];
        setRedoStack(r => r.slice(0, -1));
        setUndoStack(u => [...u, { ...decisions }]);
        setDecisions(next || {});
    };

    // Inline/token diff helper — returns array of { text, changed }
    const tokenizeForInline = (text: string) => {
        if (!text) return [] as string[];
        return text.split(/(\s+|[.,!?;:\"'()\[\]{}])/g).filter(Boolean);
    };

    const inlineDiff = (a?: string, b?: string) => {
        const A = tokenizeForInline(a || '');
        const B = tokenizeForInline(b || '');

        // simple LCS to mark equal tokens
        const m = A.length;
        const n = B.length;
        const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (A[i-1] === B[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }

        // walk to get matching positions
        let i = m, j = n;
        const matchA: boolean[] = Array(m).fill(false);
        const matchB: boolean[] = Array(n).fill(false);
        while (i > 0 && j > 0) {
            if (A[i-1] === B[j-1]) {
                matchA[i-1] = true;
                matchB[j-1] = true;
                i--; j--;
            } else if (dp[i-1][j] >= dp[i][j-1]) i--; else j--;
        }

        // Build arrays describing tokens with change flag for A and B
        const outA = A.map((t, idx) => ({ text: t, changed: !matchA[idx] }));
        const outB = B.map((t, idx) => ({ text: t, changed: !matchB[idx] }));
        return { outA, outB };
    };

  const conflictCount = segments.filter(s => s.type === SegmentType.CONFLICT).length;
  const resolvedCount = Object.keys(decisions).length;
  const isFullyResolved = resolvedCount === conflictCount;
  const isScanning = visibleCount < segments.length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-tech-light/30 shadow-sm z-20">
        <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="secondary" onClick={onReset} icon={<ArrowLeftRight size={16} />}>
                        <span className="hidden sm:inline">Merge Baru</span>
                        <span className="sm:hidden">Baru</span>
                    </Button>
            <div className="h-6 w-px bg-tech-light/30 mx-1 hidden sm:block"></div>
            <div className="text-sm font-medium text-tech-dim hidden sm:block font-mono">
                {isScanning 
                            ? <span className="text-tech-dim animate-pulse flex items-center gap-2"><ScanLine size={16} /> Memindai Perbedaan...</span>
                            : conflictCount === 0
                                ? <span className="text-emerald-600 flex items-center gap-1"><Check size={16} /> Tidak Ada Konflik</span>
                                : <span className={`${isFullyResolved ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {resolvedCount}/{conflictCount} Terselesaikan
                                </span>
                }
            </div>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={handleUndo} disabled={!canUndo} title="Urungkan keputusan">
                    <RotateCcw size={16} />
                </Button>
                        <Button variant="ghost" onClick={handleRedo} disabled={!canRedo} title="Ulangi keputusan">
                    <RotateCw size={16} />
                </Button>
            </div>
            <Button 
                variant="ghost" 
                onClick={() => setIsViewingResult(!isViewingResult)}
                        className={isViewingResult ? "bg-tech-black text-white hover:bg-tech-base hover:text-white" : ""}
                        title={isViewingResult ? "Kembali ke Konflik" : "Lihat & Sunting Hasil"}
            >
                {isViewingResult ? (
                    <>
                        <List size={18} className="mr-2" />
                                <span className="hidden sm:inline">Konflik</span>
                    </>
                ) : (
                    <>
                        <Eye size={18} className="mr-2" />
                                <span className="hidden sm:inline">Lihat Hasil</span>
                                <span className="sm:hidden">Hasil</span>
                    </>
                )}
            </Button>
                    <Button
                variant="primary" 
                onClick={copyToClipboard} 
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                className={copied ? "bg-emerald-600 hover:bg-emerald-700 border-transparent" : ""}
            >
                        <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin'}</span>
            </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left: Conflict Resolver */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:border-r border-tech-light/30 bg-gray-50/50 transition-all duration-300 relative
            ${isViewingResult ? 'hidden md:hidden' : 'block'}`}>
             
             {/* Progress Bar (Visible only when scanning) */}
             {isScanning && (
                <div className="fixed top-[73px] left-0 h-1 bg-emerald-500 z-50 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                     style={{ width: `${(visibleCount / segments.length) * 50}%` }} // Approximate width relative to left pane
                />
             )}

             <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {/* Mobile Status Bar */}
                <div className="sm:hidden mb-4 p-3 bg-white rounded-lg border border-tech-light/30 shadow-sm flex justify-between items-center">
                    <span className="text-xs font-bold font-heading text-tech-dim uppercase">Progres</span>
                    <span className={`text-sm font-bold font-mono ${isFullyResolved ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isScanning ? 'Memindai...' : `${resolvedCount} dari ${conflictCount} Terselesaikan`}
                    </span>
                </div>

                {segments.length === 0 && <p className="text-center text-tech-light mt-10">Tidak ada konten untuk ditampilkan.</p>}
                
                {segments.map((seg, idx) => {
                  // Scanning Logic: Hide segments that haven't been "scanned" yet
                  if (idx >= visibleCount) return null;

                  if (seg.type === SegmentType.CONTENT) {
                    return (
                        <div key={idx} className={`p-4 bg-white rounded-lg border border-tech-light/30 shadow-sm hover:border-tech-light transition-all duration-500 ease-out ${animate ? 'opacity-0 translate-y-4 animate-slide-up' : ''}`}>
                            <p className="whitespace-pre-wrap text-tech-black leading-relaxed font-mono text-sm">{seg.content}</p>
                        </div>
                    );
                  }

                  const choice = decisions[idx];
                  
                  return (
                    <div key={idx} className={`rounded-xl border overflow-hidden transition-all duration-500 ease-out
                        ${animate ? 'opacity-0 translate-y-4 animate-slide-up' : ''}
                        ${choice 
                            ? 'border-emerald-200 bg-emerald-50/10' 
                            : 'border-amber-300 bg-amber-50/20'
                        }`}>
                        <div className="p-3 border-b border-tech-light/20 bg-white/60 flex justify-between items-center px-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2 font-heading">
                                <span className={`w-2 h-2 rounded-full bg-amber-500 ${!choice ? 'animate-pulse' : ''}`}></span>
                                Conflict #{segments.slice(0, idx + 1).filter(s => s.type === SegmentType.CONFLICT).length}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                            {/* Option A */}
                            <div 
                                onClick={() => handleDecision(idx, 'A')}
                                className={`cursor-pointer rounded-lg p-3 border relative group
                                    transition-all ${animate ? 'duration-300 ease-out active:scale-95' : 'duration-150'}
                                    ${choice === 'A' 
                                        ? 'bg-tech-black text-white border-tech-black shadow-lg transform scale-[1.02]' 
                                        : 'bg-white border-tech-light/50 hover:border-tech-dim hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider truncate pr-2 font-heading ${choice === 'A' ? 'text-gray-400' : 'text-tech-light'}`} title={labelA}>{labelA}</span>
                                    {choice === 'A' && <Check size={16} className="text-white flex-shrink-0 animate-fade-in" />}
                                </div>
                                <p className={`text-sm whitespace-pre-wrap font-mono ${choice === 'A' ? 'text-gray-100' : 'text-tech-black'}`}>
                                    {(() => {
                                        const { outA } = inlineDiff(seg.optionA, seg.optionB);
                                        return outA.map((t, i) => (
                                            <span key={i} className={`${t.changed ? 'bg-amber-100 text-amber-800 rounded-sm px-[2px]' : ''}`}>{t.text}</span>
                                        ));
                                    })()}
                                </p>
                            </div>

                            {/* Option B */}
                            <div 
                                onClick={() => handleDecision(idx, 'B')}
                                className={`cursor-pointer rounded-lg p-3 border relative group
                                    transition-all ${animate ? 'duration-300 ease-out active:scale-95' : 'duration-150'}
                                    ${choice === 'B' 
                                        ? 'bg-tech-black text-white border-tech-black shadow-lg transform scale-[1.02]' 
                                        : 'bg-white border-tech-light/50 hover:border-tech-dim hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider truncate pr-2 font-heading ${choice === 'B' ? 'text-gray-400' : 'text-tech-light'}`} title={labelB}>{labelB}</span>
                                    {choice === 'B' && <Check size={16} className="text-white flex-shrink-0 animate-fade-in" />}
                                </div>
                                <p className={`text-sm whitespace-pre-wrap font-mono ${choice === 'B' ? 'text-gray-100' : 'text-tech-black'}`}>
                                    {(() => {
                                        const { outB } = inlineDiff(seg.optionA, seg.optionB);
                                        return outB.map((t, i) => (
                                            <span key={i} className={`${t.changed ? 'bg-amber-100 text-amber-800 rounded-sm px-[2px]' : ''}`}>{t.text}</span>
                                        ));
                                    })()}
                                </p>
                            </div>
                        </div>

                        {/* Merge Actions */}
                        <div className="bg-white/40 border-t border-tech-light/20 p-2 flex flex-wrap justify-center gap-2">
                             <button
                                onClick={() => handleDecision(idx, 'A+B')}
                                className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border font-medium font-sans
                                    transition-all ${animate ? 'duration-300 active:scale-95' : ''}
                                    ${choice === 'A+B'
                                    ? 'bg-tech-black text-white border-tech-black shadow-sm'
                                    : 'bg-white text-tech-dim border-tech-light/50 hover:border-tech-dim hover:text-tech-black'
                                }`}
                            >
                                <ArrowDown size={12} />
                                Merge (A then B)
                            </button>
                            <button
                                onClick={() => handleDecision(idx, 'B+A')}
                                className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border font-medium font-sans
                                    transition-all ${animate ? 'duration-300 active:scale-95' : ''}
                                    ${choice === 'B+A'
                                    ? 'bg-tech-black text-white border-tech-black shadow-sm'
                                    : 'bg-white text-tech-dim border-tech-light/50 hover:border-tech-dim hover:text-tech-black'
                                }`}
                            >
                                <ArrowUp size={12} />
                                Merge (B then A)
                            </button>
                        </div>
                    </div>
                  );
                })}

                {/* Scanner Indicator (If strictly needed at the bottom) */}
                {isScanning && (
                    <div className="flex items-center justify-center py-4 text-tech-dim/50 animate-pulse">
                        <ScanLine size={24} className="animate-spin-slow" />
                    </div>
                )}

             </div>
        </div>

        {/* Right (or Full): Live Preview / Manual Edit */}
        <div className={`flex flex-col bg-white border-l border-tech-light/30 transition-all duration-300
            ${isViewingResult ? 'w-full absolute inset-0 z-10 md:static md:w-full' : 'hidden md:flex md:w-1/2 lg:w-5/12'}`}>
            
            <div className="bg-gray-50/80 p-3 border-b border-tech-light/30 flex justify-between items-center flex-none">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-tech-dim font-heading">Merged Result</h3>
                    {isViewingResult && <span className="bg-tech-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">EDITABLE</span>}
                </div>
                {/* On mobile, close button for full screen view */}
                <button 
                    onClick={() => setIsViewingResult(false)} 
                    className="md:hidden text-tech-light hover:text-tech-black"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 relative">
                <textarea
                    className={`w-full h-full p-6 resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed text-tech-black
                        ${isViewingResult ? 'bg-white' : 'bg-gray-50/30'}`}
                    value={finalText}
                    readOnly={!isViewingResult} // Editable only in explicit "View Result" mode
                    onChange={(e) => setFinalText(e.target.value)}
                    placeholder="The merged result will appear here..."
                />
                
                {!isViewingResult && (
                    <div className="absolute top-4 right-4 pointer-events-none opacity-50">
                        <Eye size={24} className="text-tech-light" />
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Floating Action Button for Mobile (View Result) */}
      {!isViewingResult && (
        <div className="md:hidden absolute bottom-6 right-6 z-30">
                <Button 
                    variant="primary" 
                    onClick={() => setIsViewingResult(true)}
                    className="shadow-xl rounded-full px-5 py-3 h-auto"
                >
                    <span className="mr-2">Lihat Hasil</span>
                    <Eye size={18} />
                </Button>
        </div>
      )}

    </div>
  );
};