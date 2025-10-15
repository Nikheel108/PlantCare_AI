import { useState, useRef } from "react";
import { Upload, Camera, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
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

  const analyzeImage = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        disease: "Powdery Mildew",
        confidence: 87,
        severity: "Moderate",
        description: "A fungal disease that appears as white, powdery spots on leaves and stems.",
        treatment: [
          "Remove affected leaves immediately",
          "Apply fungicidal spray every 7-14 days",
          "Improve air circulation around the plant",
          "Reduce humidity levels"
        ],
        prevention: [
          "Avoid overhead watering",
          "Ensure proper spacing between plants",
          "Regular inspection and early detection"
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
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
            Upload a photo of your plant for AI-powered disease analysis
          </p>
        </div>

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
                        <span className="text-sm text-muted-foreground">Analyzing image...</span>
                        <span className="text-sm font-medium">AI Processing</span>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Our AI is examining your plant for signs of disease
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
                        Detected Disease
                      </h3>
                      <Badge variant={result.confidence > 80 ? "default" : "secondary"}>
                        {result.confidence}% Confidence
                      </Badge>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">{result.disease}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Severity: {result.severity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Treatment */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Recommended Treatment
                    </h3>
                    <ul className="space-y-2">
                      {result.treatment.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
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

                  <Button 
                    onClick={clearImage}
                    variant="outline"
                    className="w-full"
                  >
                    Analyze Another Plant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}