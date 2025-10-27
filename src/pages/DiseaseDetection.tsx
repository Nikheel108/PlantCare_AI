import { useState, useRef } from "react";
import { Upload, Camera, X, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!import.meta.env.VITE_GEMINI_API_KEY);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setSelectedFile(file);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!apiKey) {
      setError("Please provide your Gemini API key to analyze images.");
      setShowApiKeyInput(true);
      return;
    }

    if (!selectedFile || !selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert image to base64 without data URL prefix
      const base64Data = selectedImage.split(',')[1];
      
      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: selectedFile.type
          }
        }
      ];

      const prompt = `You are an expert plant pathologist. Analyze this leaf image and provide a detailed disease diagnosis.

Provide your response in the following JSON format (respond ONLY with valid JSON, no additional text):
{
  "diseaseName": "Name of the disease or 'Healthy' if no disease detected",
  "confidence": "High/Medium/Low",
  "severity": "Mild/Moderate/Severe/None",
  "description": "Brief description of the condition",
  "symptoms": ["List of visible symptoms"],
  "causes": ["Possible causes of this condition"],
  "treatment": ["Step-by-step treatment recommendations"],
  "prevention": ["Prevention measures for future"],
  "additionalNotes": "Any additional important information"
}

Be specific and accurate. If the image is not clear or not a plant leaf, mention that in the diseaseName field.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedResult: DiseaseResult = JSON.parse(jsonText);
        setResult(parsedResult);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response:', text);
        setError("Failed to parse AI response. Please try again.");
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          setError("Invalid API key. Please check your Gemini API key.");
          setShowApiKeyInput(true);
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError("Failed to analyze image. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Plant Disease Detection
          </h1>
          <p className="text-muted-foreground">
            Upload a photo of your plant leaf for AI-powered disease analysis using Google Gemini Vision
          </p>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <Card className="mb-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Gemini API Key Required</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Get your free API key from{" "}
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter your Gemini API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (apiKey.trim()) {
                            setShowApiKeyInput(false);
                            setError(null);
                          }
                        }}
                        disabled={!apiKey.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-4 border-red-500/50 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedImage ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Drop your plant image here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse your files
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports JPG, PNG, WEBP up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {!result && !isAnalyzing && (
                    <div className="mt-4">
                      <Button 
                        onClick={analyzeImage}
                        className="w-full gradient-primary text-white hover:opacity-90"
                        size="lg"
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Analyze Plant Health
                      </Button>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing image with Gemini AI...
                        </span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Our AI is examining your plant leaf for signs of disease
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Upload an image to see AI analysis results
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-slide-up">
                  {/* Disease Detection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Diagnosis
                      </h3>
                      <Badge variant={result.confidence === "High" ? "default" : result.confidence === "Medium" ? "secondary" : "outline"}>
                        {result.confidence} Confidence
                      </Badge>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2 text-lg">{result.diseaseName}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          result.severity === "Severe" ? "text-red-500" :
                          result.severity === "Moderate" ? "text-yellow-500" :
                          result.severity === "Mild" ? "text-orange-500" :
                          "text-green-500"
                        }`} />
                        <span className="text-sm font-medium">Severity: {result.severity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Observed Symptoms
                      </h3>
                      <ul className="space-y-2">
                        {result.symptoms.map((symptom: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Causes */}
                  {result.causes && result.causes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Possible Causes
                      </h3>
                      <ul className="space-y-2">
                        {result.causes.map((cause: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Treatment */}
                  {result.treatment && result.treatment.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Recommended Treatment
                      </h3>
                      <ul className="space-y-2">
                        {result.treatment.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm text-foreground">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prevention */}
                  {result.prevention && result.prevention.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Prevention Tips
                      </h3>
                      <ul className="space-y-2">
                        {result.prevention.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {result.additionalNotes && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Additional Notes
                      </h3>
                      <p className="text-sm text-muted-foreground">{result.additionalNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={clearImage}
                      variant="outline"
                      className="flex-1"
                    >
                      Analyze Another Plant
                    </Button>
                    {!showApiKeyInput && (
                      <Button
                        onClick={() => setShowApiKeyInput(true)}
                        variant="ghost"
                        size="sm"
                      >
                        Change API Key
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}