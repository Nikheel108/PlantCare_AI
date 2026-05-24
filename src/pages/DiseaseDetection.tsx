import { useState, useRef } from "react";
import { Upload, Camera, X, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DiseaseResult {
  diseaseName: string;
  confidence: string;
  severity: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  additionalNotes?: string;
}

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { setSelectedImage(e.target?.result as string); setSelectedFile(file); setResult(null); setError(null); };
    reader.readAsDataURL(file);
  };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files; if (f?.[0]?.type.startsWith("image/")) handleImageUpload(f[0]); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); };
  const clearImage = () => { setSelectedImage(null); setSelectedFile(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const analyzeImage = async () => {
    if (!apiKey) { setError("Please provide your Gemini API key."); setShowApiKeyInput(true); return; }
    if (!selectedFile || !selectedImage) { setError("Please select an image first."); return; }
    setIsAnalyzing(true); setError(null);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const base64 = selectedImage.split(",")[1];
      const prompt = `You are an expert plant pathologist. Analyze this leaf image and provide a detailed disease diagnosis.\n\nProvide your response in the following JSON format (respond ONLY with valid JSON, no additional text):\n{"diseaseName":"Name of the disease or 'Healthy'","confidence":"High/Medium/Low","severity":"Mild/Moderate/Severe/None","description":"Brief description","symptoms":["symptoms"],"causes":["causes"],"treatment":["treatments"],"prevention":["prevention tips"],"additionalNotes":"any notes"}\n\nBe specific and accurate.`;
      const r = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: selectedFile.type } }]);
      const text = (await r.response).text();
      const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed: DiseaseResult = JSON.parse(json);
      setResult(parsed);
      if (currentUser) {
        setIsSaving(true);
        try {
          const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
          const resp = await fetch(`${url}/api/analysis`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.uid, userEmail: currentUser.email, image: selectedImage, plantName: "Plant", diseaseName: parsed.diseaseName, confidence: parsed.confidence, severity: parsed.severity, symptoms: parsed.symptoms, recommendations: parsed.treatment, description: parsed.description, causes: parsed.causes, prevention: parsed.prevention, additionalNotes: parsed.additionalNotes }) });
          if (!resp.ok) throw new Error("Save failed");
          toast.success("Analysis report sent to your email");
        } catch { toast.error("Analysis complete, but report save failed"); } finally { setIsSaving(false); }
      }
    } catch (err: any) {
      if (err?.message?.includes("API key")) { setError("Invalid API key."); setShowApiKeyInput(true); } else setError(err?.message || "Analysis failed. Try again.");
    } finally { setIsAnalyzing(false); }
  };

  const formatText = (t: string) => { if (!t) return null; return t.split(/(\*\*.*?\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong> : p); };
  const sevColor = (s: string) => s === "Severe" ? "text-red-400" : s === "Moderate" ? "text-yellow-400" : s === "Mild" ? "text-orange-400" : "text-neon-green";

  return (
    <DashboardLayout particles="leaf">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
          Plant <span className="text-neon">Disease Detection</span>
        </h1>
        <p className="text-sm text-white/35">Upload a photo for <strong className="text-white/55">AI-powered disease analysis</strong></p>
      </motion.div>

      {/* API Key */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
            <GlassCard hover={false} className="border-yellow-500/10">
              <p className="text-sm font-heading font-semibold text-white mb-2">Gemini API Key Required</p>
              <p className="text-xs text-white/30 mb-3">Get a free key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:underline">Google AI Studio</a></p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input type="password" placeholder="Enter API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1 h-10 bg-white/[0.04] border-white/[0.06] text-white placeholder:text-white/20 text-sm" />
                <Button onClick={() => { if (apiKey.trim()) { setShowApiKeyInput(false); setError(null); } }} disabled={!apiKey.trim()} className="btn-neon h-10">Save</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
            <GlassCard hover={false} className="border-red-500/10">
              <div className="flex items-start gap-2 text-red-400"><AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" /><p className="text-xs font-medium">{error}</p></div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Upload */}
        <GlassCard delay={0.1}>
          <h3 className="text-sm font-heading font-semibold text-white mb-4 flex items-center gap-2"><Camera className="h-4 w-4 text-neon-green" />Image Upload</h3>
          {!selectedImage ? (
            <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${dragActive ? "border-neon-green/40 bg-neon-green/[0.03]" : "border-white/[0.06] hover:border-neon-green/20 hover:bg-white/[0.01]"}`} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)}>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}><Upload className="h-10 w-10 text-white/15 mx-auto mb-3" /></motion.div>
              <p className="text-sm font-heading font-medium text-white/50 mb-1">Drop your plant image here</p>
              <p className="text-xs text-white/20 mb-4">or click to browse</p>
              <Button onClick={() => fileInputRef.current?.click()} className="btn-neon px-5 h-10">Choose Image</Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <p className="text-[10px] text-white/15 mt-3">Supports JPG, PNG, WEBP up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
                <img src={selectedImage} alt="Selected plant" className="w-full h-48 sm:h-56 object-cover" />
                {isAnalyzing && <motion.div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent" animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />}
              </div>
              <Button variant="destructive" size="icon" className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-red-500/70 backdrop-blur-sm" onClick={clearImage}><X className="h-3.5 w-3.5" /></Button>
              {!result && !isAnalyzing && <Button onClick={analyzeImage} className="w-full btn-neon mt-4 min-h-[44px]" size="lg"><Camera className="mr-2 h-4 w-4" />Analyze Plant Health</Button>}
              {isAnalyzing && <div className="mt-4 space-y-2"><div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-neon-green" /><span className="text-xs text-white/40">Analyzing with <strong className="text-white/60">Gemini AI</strong>...</span></div><Progress value={65} className="h-1.5 progress-neon" /></div>}
              {isSaving && <div className="mt-4 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-neon-green" /><span className="text-xs text-neon-green">Uploading and sending email...</span></div>}
            </div>
          )}
        </GlassCard>

        {/* Results */}
        <GlassCard delay={0.15}>
          <h3 className="text-sm font-heading font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-neon-green" />Analysis Results</h3>
          {!result && !isAnalyzing && (
            <div className="text-center py-10"><motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}><Info className="h-10 w-10 text-white/10 mx-auto mb-3" /></motion.div><p className="text-xs text-white/25">Upload an image to see results</p></div>
          )}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Diagnosis */}
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-heading font-semibold text-white/50">Diagnosis</p>
                    <Badge className={`text-[10px] border ${result.confidence === "High" ? "bg-neon-green/10 text-neon-green border-neon-green/20" : result.confidence === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>{result.confidence} Confidence</Badge>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                    <p className="text-base font-heading font-bold text-white mb-1">{result.diseaseName}</p>
                    <p className="text-xs text-white/35 mb-2">{formatText(result.description)}</p>
                    <div className="flex items-center gap-1.5"><AlertTriangle className={`h-3 w-3 ${sevColor(result.severity)}`} /><span className={`text-xs font-semibold ${sevColor(result.severity)}`}>Severity: {result.severity}</span></div>
                  </div>
                </motion.div>

                {/* Sections */}
                {[
                  { title: "Observed Symptoms", items: result.symptoms, icon: AlertTriangle, iconColor: "text-orange-400", delay: 0.2 },
                  { title: "Possible Causes", items: result.causes, icon: Info, iconColor: "text-blue-400", delay: 0.3 },
                ].map((sec) => sec.items?.length > 0 && (
                  <motion.div key={sec.title} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: sec.delay }}>
                    <p className="text-xs font-heading font-semibold text-white/50 mb-2">{sec.title}</p>
                    <ul className="space-y-1.5">{sec.items.map((item, i) => <li key={i} className="flex items-start gap-2"><sec.icon className={`h-3 w-3 ${sec.iconColor} mt-0.5 flex-shrink-0`} /><span className="text-xs text-white/40">{formatText(item)}</span></li>)}</ul>
                  </motion.div>
                ))}

                {result.treatment?.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <p className="text-xs font-heading font-semibold text-white/50 mb-2">Treatment</p>
                    <ul className="space-y-1.5">{result.treatment.map((s, i) => <li key={i} className="flex items-start gap-2"><div className="w-4.5 h-4.5 bg-neon-green/10 text-neon-green rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0 border border-neon-green/20">{i + 1}</div><span className="text-xs text-white/40">{formatText(s)}</span></li>)}</ul>
                  </motion.div>
                )}

                {result.prevention?.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <p className="text-xs font-heading font-semibold text-white/50 mb-2">Prevention</p>
                    <ul className="space-y-1.5">{result.prevention.map((t, i) => <li key={i} className="flex items-start gap-2"><CheckCircle className="h-3 w-3 text-neon-green mt-0.5 flex-shrink-0" /><span className="text-xs text-white/40">{formatText(t)}</span></li>)}</ul>
                  </motion.div>
                )}

                {result.additionalNotes && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-blue-500/[0.04] border border-blue-500/10 rounded-xl p-3">
                    <p className="text-[11px] font-heading font-semibold text-white/50 mb-1 flex items-center gap-1"><Info className="h-3 w-3 text-blue-400" />Additional Notes</p>
                    <p className="text-xs text-white/35">{formatText(result.additionalNotes)}</p>
                  </motion.div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button onClick={clearImage} className="flex-1 btn-glass h-9 text-xs">Analyze Another</Button>
                  {!showApiKeyInput && <Button onClick={() => setShowApiKeyInput(true)} variant="ghost" size="sm" className="text-white/15 hover:text-white/40 text-[10px]">Change Key</Button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}