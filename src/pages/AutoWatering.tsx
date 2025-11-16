import { useState, useEffect } from "react";
import { Droplets, Power, Settings, TrendingUp, AlertTriangle, CheckCircle, Leaf, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";

export default function AutoWatering() {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isPumpActive, setIsPumpActive] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(45);
  const [pumpDuration, setPumpDuration] = useState(0);
  const [lastWatering, setLastWatering] = useState("2 hours ago");

  // Simulate real-time moisture data
  useEffect(() => {
    const interval = setInterval(() => {
      setSoilMoisture(prev => {
        const newValue = Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 3));

        // Auto-watering logic
        if (isAutoMode && newValue < 35 && !isPumpActive) {
          setIsPumpActive(true);
          setPumpDuration(10);
          setLastWatering("Just now");
        }

        return newValue;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoMode, isPumpActive]);

  // Pump timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPumpActive && pumpDuration > 0) {
      timer = setInterval(() => {
        setPumpDuration(prev => {
          if (prev <= 1) {
            setIsPumpActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPumpActive, pumpDuration]);

  const handleManualWatering = () => {
    if (!isPumpActive) {
      setIsPumpActive(true);
      setPumpDuration(15);
      setLastWatering("Just now");
    }
  };

  const stopPump = () => {
    setIsPumpActive(false);
    setPumpDuration(0);
  };

  const getMoistureStatus = () => {
    if (soilMoisture < 30) return { status: "Low", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" };
    if (soilMoisture < 60) return { status: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" };
    return { status: "Good", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" };
  };

  const moistureStatus = getMoistureStatus();

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Auto-Watering System
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor soil moisture and control irrigation automatically
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Soil Moisture Card */}
          <Card className="shadow-card border-border/50 hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                Soil Moisture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  {soilMoisture.toFixed(0)}%
                </div>
                <Badge className={`${moistureStatus.bg} ${moistureStatus.color} border-0 text-xs sm:text-sm`}>
                  {moistureStatus.status}
                </Badge>
              </div>

              <Progress value={soilMoisture} className="h-2 sm:h-3 mb-4" />

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Optimal Range:</span>
                  <span className="font-medium">40-80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Reading:</span>
                  <span className="font-medium">Now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control Panel */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Auto Mode Toggle */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base text-foreground">Auto Mode</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Automatic watering when soil is dry
                  </p>
                </div>
                <Switch
                  checked={isAutoMode}
                  onCheckedChange={setIsAutoMode}
                  className="flex-shrink-0"
                />
              </div>

              {/* Manual Controls */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm sm:text-base text-foreground">Manual Control</h3>
                <Button
                  onClick={handleManualWatering}
                  disabled={isPumpActive || isAutoMode}
                  className="w-full gradient-primary text-white hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                  size="lg"
                >
                  <Droplets className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Watering
                </Button>

                {isPumpActive && (
                  <Button
                    onClick={stopPump}
                    variant="destructive"
                    className="w-full min-h-[48px]"
                    size="lg"
                  >
                    <Power className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Stop Pump
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pump Status */}
          <Card className="shadow-card border-border/50 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                Pump Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${isPumpActive
                    ? 'bg-green-100 text-green-600 pulse-glow dark:bg-green-900/20'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}>
                  <Power className="h-8 w-8" />
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {isPumpActive ? 'Active' : 'Inactive'}
                </div>
                {isPumpActive && (
                  <div className="text-sm text-muted-foreground">
                    {pumpDuration} seconds remaining
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <Badge variant={isAutoMode ? "default" : "secondary"}>
                    {isAutoMode ? 'Auto' : 'Manual'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Watering:</span>
                  <span className="text-sm font-medium">{lastWatering}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily Usage:</span>
                  <span className="text-sm font-medium">2.3L</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Chart Alternative */}
        <Card className="mt-6 shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Moisture History (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar visualization */}
              <div className="grid grid-cols-12 gap-2 h-32 items-end">
                {Array.from({ length: 12 }, (_, i) => {
                  const height = Math.random() * 60 + 20;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-full bg-primary/20 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {i * 2}h
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="shadow-card border-border/50 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Low Moisture Alert</h3>
                  <p className="text-sm text-muted-foreground">
                    Soil moisture has dropped below 35%. Auto-watering will activate soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50 bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">System Status</h3>
                  <p className="text-sm text-muted-foreground">
                    All sensors are working properly. Last maintenance: 3 days ago.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="relative py-8 flex justify-center gap-2 opacity-30 pointer-events-none">
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0s' }} />
        <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <Leaf className="h-6 w-6 text-green-600 animate-pulse" style={{ animationDelay: '0.6s' }} />
        <Sprout className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}