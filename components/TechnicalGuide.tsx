import React, { useState } from 'react';
import { ArrowLeft, Code, Cpu, GitBranch, Split, Database, Play, RotateCcw, Layers } from 'lucide-react';
import { Button } from './Button';

interface TechnicalGuideProps {
  onBack: () => void;
}

export const TechnicalGuide: React.FC<TechnicalGuideProps> = ({ onBack }) => {
  // Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Tokenizing, 2: Scanning, 3: Diffing, 4: Done
  
  // Data for Demo: Added "on" as a separator to distinct "URGENT" (Insert) from "Monday/Friday" (Conflict)
  // This accurately reflects the algorithm: Inserts followed by Matches are auto-accepted. Inserts followed by Deletes are Conflicts.
  const tokensA = ["Deadline", "is", "on", "Monday", "!"];
  const tokensB = ["Deadline", "is", "URGENT", "on", "Friday", "!"];
  
  // Animation Sub-states
  const [visibleTokensA, setVisibleTokensA] = useState<number>(-1);
  const [visibleTokensB, setVisibleTokensB] = useState<number>(-1);
  const [scanIndex, setScanIndex] = useState<number>(-1);
  const [diffItems, setDiffItems] = useState<Array<{type: 'EQ'|'DEL'|'INS'|'CONFLICT', text: string}>>([]);

  const runSimulation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    resetAnimation();

    let delay = 100;

    // --- PHASE 1: TOKENIZATION ---
    setTimeout(() => setStep(1), delay);
    
    tokensA.forEach((_, i) => {
        setTimeout(() => setVisibleTokensA(i), delay += 300);
    });
    tokensB.forEach((_, i) => {
        setTimeout(() => setVisibleTokensB(i), delay += 300);
    });

    delay += (Math.max(tokensA.length, tokensB.length) * 300) + 500;

    // --- PHASE 2: LCS SCANNING ---
    setTimeout(() => setStep(2), delay);
    
    // Simulate scanning cursor
    const maxLen = Math.max(tokensA.length, tokensB.length);
    for (let i = 0; i < maxLen + 1; i++) {
        setTimeout(() => setScanIndex(i), delay += 500);
    }
    
    delay += 500;
    setTimeout(() => setScanIndex(-1), delay); // Reset scan cursor

    // --- PHASE 3: DIFF GENERATION ---
    setTimeout(() => setStep(3), delay += 500);

    // Manually scripted diff sequence matching the logical output of the algorithm for this data
    
    // 1. "Deadline" (Match)
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'EQ', text: 'Deadline'}]), delay += 500);
    
    // 2. "is" (Match)
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'EQ', text: ' is'}]), delay += 500);
    
    // 3. "URGENT" (INSERTION - NEW TEXT)
    // Because it is followed by a match ("on"), the algorithm identifies this as a pure insertion (Green).
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'INS', text: ' URGENT'}]), delay += 500);
    
    // 4. "on" (Match) - The separator that allows the previous item to be confirmed as pure insertion
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'EQ', text: ' on'}]), delay += 500);

    // 5. Conflict: Monday (Del) vs Friday (Ins)
    // These are adjacent changes without a match in between, so they form a Conflict block.
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'CONFLICT', text: ' Monday/Friday'}]), delay += 500);
    
    // 6. "!" (Match)
    setTimeout(() => setDiffItems(prev => [...prev, {type: 'EQ', text: ' !'}]), delay += 500);

    // --- DONE ---
    setTimeout(() => {
        setStep(4);
        setIsPlaying(false);
    }, delay += 500);
  };

  const resetAnimation = () => {
    setVisibleTokensA(-1);
    setVisibleTokensB(-1);
    setScanIndex(-1);
    setDiffItems([]);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-tech-black">
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .anim-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .anim-slide { animation: slideUp 0.5s ease-out forwards; }
        .anim-pulse-ring { animation: pulseRing 1.5s infinite; }
      `}</style>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-tech-light/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={18} />}>
                Kembali
            </Button>
            <span className="text-sm font-bold font-heading text-tech-black hidden sm:inline">Dokumentasi Teknis</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-xl mb-4 text-tech-dim">
                <Cpu size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Under The Hood</h1>
            <p className="text-lg text-tech-dim max-w-2xl mx-auto">
                Visualisasi interaktif algoritma <em>Longest Common Subsequence</em> (LCS) yang digunakan Smart Merge.
            </p>
        </div>

        {/* Interactive Simulation Card */}
        <div className="bg-tech-black rounded-2xl p-6 md:p-8 text-white shadow-2xl mb-20 relative overflow-hidden border border-gray-800 min-h-[500px] flex flex-col">
             <div className="absolute top-0 right-0 p-32 bg-tech-base opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 flex-none">
                <div>
                    <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                        <Code className="text-emerald-400" />
                        Live Simulation
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Simulasi proses merge dengan deteksi teks baru.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                    <Button 
                        variant="secondary" 
                        onClick={resetAnimation}
                        disabled={isPlaying || step === 0}
                        className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-white"
                        icon={<RotateCcw size={16} />}
                    >
                        Reset
                    </Button>
                    <Button 
                        onClick={runSimulation}
                        disabled={isPlaying}
                        className={`bg-emerald-500 hover:bg-emerald-600 text-white border-none transition-all ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        icon={isPlaying ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block mr-2"/> : <Play size={16} />}
                    >
                        {step === 4 ? 'Replay' : isPlaying ? 'Running...' : 'Start Simulation'}
                    </Button>
                </div>
             </div>

             {/* Animation Stage */}
             <div className="space-y-8 relative z-10 flex-1">
                
                {/* Stage 1: Tokens */}
                <div className={`transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Split size={14} /> Phase 1: Tokenization
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                         {/* Input A */}
                         <div>
                            <div className="text-xs text-gray-500 mb-2 font-mono">Input A</div>
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {tokensA.map((t, i) => (
                                    <span key={`A-${i}`} className={`px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-mono transition-all duration-300
                                        ${i <= visibleTokensA ? 'anim-pop opacity-100' : 'opacity-0 scale-50'}
                                        ${scanIndex === i && step === 2 ? 'ring-2 ring-emerald-500 bg-gray-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}
                                    `} style={{ animationDelay: `${i * 0.05}s` }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                         </div>
                         {/* Input B */}
                         <div>
                            <div className="text-xs text-gray-500 mb-2 font-mono">Input B</div>
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {tokensB.map((t, i) => (
                                    <span key={`B-${i}`} className={`px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-mono transition-all duration-300
                                        ${i <= visibleTokensB ? 'anim-pop opacity-100' : 'opacity-0 scale-50'}
                                        ${scanIndex === i && step === 2 ? 'ring-2 ring-emerald-500 bg-gray-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}
                                    `} style={{ animationDelay: `${i * 0.05}s` }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>

                {/* Stage 2: Scanner Indicator */}
                {step === 2 && (
                    <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/50 text-emerald-400 text-xs font-bold font-mono anim-pulse-ring shadow-lg z-20 flex items-center gap-2 transition-all duration-300">
                        <Database size={14} className="animate-spin-slow" /> 
                        SCANNING TOKEN [{scanIndex >= 0 ? scanIndex : '...'}]
                        {scanIndex >= 0 && scanIndex < tokensA.length && (
                            tokensA[scanIndex] === tokensB[scanIndex] 
                            ? <span className="bg-emerald-500 text-black text-[10px] px-1 rounded ml-1 font-bold">MATCH</span>
                            : <span className="bg-rose-500 text-white text-[10px] px-1 rounded ml-1 font-bold">DIFF</span>
                        )}
                    </div>
                )}

                {/* Stage 3: Result Construction */}
                <div className={`transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <GitBranch size={14} /> Phase 3: Diff Construction
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 min-h-[80px] flex items-center flex-wrap gap-2">
                        {diffItems.length === 0 && <span className="text-gray-600 text-sm italic">Waiting for scan...</span>}
                        {diffItems.map((item, idx) => (
                            <div key={idx} className={`anim-slide px-3 py-1.5 rounded-lg border text-sm font-mono font-bold
                                ${item.type === 'EQ' ? 'bg-gray-800 border-gray-700 text-gray-300' : ''}
                                ${item.type === 'INS' ? 'bg-emerald-900/40 border-emerald-600/50 text-emerald-400' : ''}
                                ${item.type === 'CONFLICT' ? 'bg-amber-900/40 border-amber-600/50 text-amber-400' : ''}
                            `}>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

             </div>
        </div>

        {/* Detailed Explanation Sections */}
        <div className="space-y-12 relative">
            <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-tech-light/20 hidden md:block"></div>

            <section className="relative pl-0 md:pl-24">
                <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-2 border-tech-black rounded-full items-center justify-center z-10">
                    <span className="text-xl font-bold font-heading">1</span>
                </div>
                <h2 className="text-2xl font-bold font-heading mb-4">Tokenisasi</h2>
                <p className="text-tech-dim leading-relaxed">
                    Teks input dipecah menjadi unit-unit terkecil (token). Dalam simulasi ini, kita melihat teks B memiliki kata tambahan <strong>"URGENT"</strong> di antara dua kata yang sama.
                </p>
            </section>

            <section className="relative pl-0 md:pl-24">
                <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-2 border-tech-black rounded-full items-center justify-center z-10">
                     <span className="text-xl font-bold font-heading">2</span>
                </div>
                <h2 className="text-2xl font-bold font-heading mb-4">Detection Logic</h2>
                <p className="text-tech-dim leading-relaxed">
                    Sistem mendeteksi dua pola perubahan:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Pure Insertion:</strong> Kata "URGENT" muncul di antara dua kata yang cocok ("is" dan "on"). Ini dianggap aman dan otomatis diterima.</li>
                        <li><strong>Conflict:</strong> Kata "Monday" diganti menjadi "Friday". Karena posisi mereka bertabrakan tanpa pemisah yang cocok, ini ditandai sebagai konflik.</li>
                    </ul>
                </p>
            </section>

            <section className="relative pl-0 md:pl-24">
                <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-2 border-tech-black rounded-full items-center justify-center z-10">
                     <span className="text-xl font-bold font-heading">3</span>
                </div>
                <h2 className="text-2xl font-bold font-heading mb-4">Result Generation</h2>
                <p className="text-tech-dim leading-relaxed">
                    Hasil akhir dikelompokkan berdasarkan jenis perubahan:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><span className="text-emerald-600 font-bold">Hijau (Insertion)</span>: Teks baru yang tidak menimpa teks lama.</li>
                        <li><span className="text-amber-600 font-bold">Oranye (Conflict)</span>: Perubahan yang saling menimpa (Edit/Replace).</li>
                        <li><span className="text-gray-500 font-bold">Abu-abu (Match)</span>: Teks yang sama di kedua versi.</li>
                    </ul>
                </p>
            </section>
        </div>

      </div>
    </div>
  );
};
