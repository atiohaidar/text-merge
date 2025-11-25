import React, { useState } from 'react';
import { GitMerge, Sparkles, Eraser, AlertCircle, Plus, Trash2, HelpCircle, Code, Settings } from 'lucide-react';
import { mergeMultipleTexts } from './services/geminiService';
import { MergeSegment } from './types';
import { MergeEditor } from './components/MergeEditor';
import { Button } from './components/Button';
import { Guide } from './components/Guide';
import { TechnicalGuide } from './components/TechnicalGuide';

interface TextInput {
  id: string;
  value: string;
}

function App() {
  const [inputs, setInputs] = useState<TextInput[]>([
    { id: '1', value: '' },
    { id: '2', value: '' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<MergeSegment[] | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showTechGuide, setShowTechGuide] = useState(false);
  const [useAnimations, setUseAnimations] = useState(false);

  const updateInput = (id: string, value: string) => {
    setInputs(prev => prev.map(input => input.id === id ? { ...input, value } : input));
  };

  const addInput = () => {
    setInputs(prev => [...prev, { id: Date.now().toString(), value: '' }]);
  };

  const removeInput = (id: string) => {
    if (inputs.length <= 2) return;
    setInputs(prev => prev.filter(input => input.id !== id));
  };

  const handleMerge = async () => {
    const validInputs = inputs.filter(i => i.value.trim().length > 0);
    if (validInputs.length < 2) {
      setError("Please provide at least two versions of text to merge.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const texts = validInputs.map(i => i.value);
      // Artificial delay if animations are enabled to make it feel like "processing"
      if (useAnimations) await new Promise(r => setTimeout(r, 800)); 
      
      const result = await mergeMultipleTexts(texts);
      setSegments(result);
    } catch (err) {
      setError("Failed to merge texts.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInputs([
      { id: '1', value: '' },
      { id: '2', value: '' }
    ]);
    setSegments(null);
    setError(null);
  };
  
  const handleResetMerge = () => {
    setSegments(null);
  }

  // View: Technical Guide
  if (showTechGuide) {
    return <TechnicalGuide onBack={() => setShowTechGuide(false)} />;
  }

  // View: Guide Page
  if (showGuide) {
    return <Guide onBack={() => setShowGuide(false)} />;
  }

  // View: Result Editor
  if (segments) {
    const inputCount = inputs.filter(i => i.value.trim().length > 0).length;
    // If more than 2, the "Option A" is effectively "Combined Previous" and "Option B" is "Version N"
    const labelA = inputCount > 2 ? `Combined (v1..v${inputCount-1})` : "Version 1";
    const labelB = inputCount > 2 ? `Version ${inputCount} (Latest)` : "Version 2";

    return (
        <MergeEditor 
            segments={segments} 
            onReset={handleResetMerge} 
            labelA={labelA} 
            labelB={labelB}
            animate={useAnimations}
        />
    );
  }

  // View: Input Form
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-tech-light/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-white/90 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-tech-black text-white rounded-lg shadow-md">
                <GitMerge size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold font-heading text-tech-black tracking-tight">Text Merge</h1>
                <p className="text-xs text-tech-dim">Multi-version Text Reconciliation</p>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button 
                onClick={() => setShowTechGuide(true)}
                className="flex items-center gap-2 text-sm font-medium text-tech-dim hover:text-tech-black transition-colors px-3 py-2 rounded-lg border border-transparent hover:border-tech-light/50"
            >
                <Code size={18} />
                <span className="hidden sm:inline font-sans">Cara Kerja (Teknis)</span>
            </button>
            <button 
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-2 text-sm font-medium text-tech-dim hover:text-tech-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-transparent hover:border-tech-light/50"
            >
                <HelpCircle size={18} />
                <span className="hidden sm:inline font-sans">Panduan Pemula</span>
            </button>
        </div>
      </header>

      {/* Main Input Area */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inputs.map((input, index) => (
                        <div key={input.id} className="flex flex-col min-h-[300px] bg-white rounded-xl shadow-sm border border-tech-light hover:border-tech-dim transition-all group">
                            <div className="p-3 border-b border-tech-light/30 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                                <span className="text-xs font-bold font-heading uppercase tracking-wider text-tech-dim flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-tech-light text-white flex items-center justify-center text-[10px] font-mono">{index + 1}</span>
                                    Version {index + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-tech-light font-mono">{input.value.length} chars</span>
                                    {inputs.length > 2 && (
                                        <button 
                                            onClick={() => removeInput(input.id)}
                                            className="text-tech-light hover:text-rose-500 transition-colors p-1"
                                            title="Remove this version"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <textarea 
                                className="flex-1 p-4 w-full resize-none bg-white focus:outline-none focus:bg-gray-50/30 transition-colors font-mono text-sm leading-relaxed text-tech-black placeholder:text-tech-light/60 rounded-b-xl border-none focus:ring-0"
                                placeholder={`Paste text for version ${index + 1} here...`}
                                value={input.value}
                                onChange={(e) => updateInput(input.id, e.target.value)}
                            />
                        </div>
                    ))}
                    
                    {/* Add Button Card */}
                    <div className="flex flex-col min-h-[300px] border-2 border-dashed border-tech-light/50 rounded-xl items-center justify-center p-6 text-tech-light hover:text-tech-black hover:border-tech-dim hover:bg-gray-50/50 transition-all cursor-pointer group"
                         onClick={addInput}>
                        <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-tech-black group-hover:text-white flex items-center justify-center mb-3 transition-colors shadow-sm">
                            <Plus size={24} />
                        </div>
                        <span className="font-medium font-heading">Add Another Version</span>
                    </div>
                </div>

            </div>
        </div>

        {/* Action Bar */}
        <div className="flex-none p-6 bg-white border-t border-tech-light/30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-20">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                
                {error && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2 rounded-md text-sm mb-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="flex flex-col items-center w-full gap-4">
                    {/* Animation Toggle */}
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setUseAnimations(!useAnimations)}>
                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${useAnimations ? 'bg-tech-black border-tech-black' : 'border-tech-light bg-white'}`}>
                            {useAnimations && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-xs font-medium text-tech-dim select-none flex items-center gap-1">
                            <Sparkles size={12} className={useAnimations ? "text-amber-500" : "text-tech-light"} />
                            Visual Animations (Scanner Mode)
                        </span>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <Button 
                            variant="ghost" 
                            onClick={handleReset} 
                            disabled={isProcessing}
                            icon={<Eraser size={18} />}
                        >
                            Clear All
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleMerge} 
                            isLoading={isProcessing}
                            disabled={inputs.filter(i => i.value.trim()).length < 2}
                            className="w-full md:w-64 py-3 text-lg"
                            icon={isProcessing ? undefined : <Sparkles size={20} />}
                        >
                            {isProcessing ? 'Merging...' : `Merge ${inputs.filter(i => i.value.trim()).length} Versions`}
                        </Button>
                    </div>
                </div>
                
                <p className="text-xs text-tech-light text-center max-w-lg font-sans">
                    Sequentially merges multiple text versions. Conflicts are identified between the accumulated result and the latest version.
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}

// Helper component for checkbox check
function Check({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}

export default App;