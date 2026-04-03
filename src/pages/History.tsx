import { useState } from "react";
import { Calendar, Filter, Download, Eye, Search, Leaf, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from "@/components/layout/Navbar";

interface DetectionRecord {
  id: string;
  date: string;
  plantName: string;
  disease: string;
  confidence: number;
  severity: string;
  status: string;
  image: string;
}

interface WateringRecord {
  id: string;
  date: string;
  duration: string;
  trigger: string;
  plantZone: string;
  moistureBefore: number;
  moistureAfter: number;
  status: string;
}

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const detectionHistory: DetectionRecord[] = [
    {
      id: '1',
      date: '2024-01-15 14:30',
      plantName: 'Tomato Plant #1',
      disease: 'Powdery Mildew',
      confidence: 87,
      severity: 'Moderate',
      status: 'Treated',
      image: '/api/placeholder/100/100'
    },
    {
      id: '2',
      date: '2024-01-14 09:15',
      plantName: 'Rose Bush',
      disease: 'Black Spot',
      confidence: 92,
      severity: 'Severe',
      status: 'In Progress',
      image: '/api/placeholder/100/100'
    },
    {
      id: '3',
      date: '2024-01-13 16:45',
      plantName: 'Basil Plant',
      disease: 'Healthy',
      confidence: 95,
      severity: 'None',
      status: 'Healthy',
      image: '/api/placeholder/100/100'
    },
    {
      id: '4',
      date: '2024-01-12 11:20',
      plantName: 'Pepper Plant #2',
      disease: 'Leaf Curl',
      confidence: 78,
      severity: 'Mild',
      status: 'Monitoring',
      image: '/api/placeholder/100/100'
    },
    {
      id: '5',
      date: '2024-01-11 13:10',
      plantName: 'Lettuce Bed',
      disease: 'Aphid Infestation',
      confidence: 89,
      severity: 'Moderate',
      status: 'Treated',
      image: '/api/placeholder/100/100'
    }
  ];

  const wateringHistory: WateringRecord[] = [
    {
      id: '1',
      date: '2024-01-15 08:00',
      duration: '15 min',
      trigger: 'Auto',
      plantZone: 'Herb Garden',
      moistureBefore: 28,
      moistureAfter: 65,
      status: 'Completed'
    },
    {
      id: '2',
      date: '2024-01-15 06:30',
      duration: '12 min',
      trigger: 'Scheduled',
      plantZone: 'Vegetable Patch',
      moistureBefore: 35,
      moistureAfter: 70,
      status: 'Completed'
    },
    {
      id: '3',
      date: '2024-01-14 18:45',
      duration: '20 min',
      trigger: 'Manual',
      plantZone: 'Flower Bed',
      moistureBefore: 22,
      moistureAfter: 68,
      status: 'Completed'
    },
    {
      id: '4',
      date: '2024-01-14 07:00',
      duration: '8 min',
      trigger: 'Auto',
      plantZone: 'Succulent Corner',
      moistureBefore: 15,
      moistureAfter: 45,
      status: 'Completed'
    },
    {
      id: '5',
      date: '2024-01-13 16:20',
      duration: '5 min',
      trigger: 'Manual',
      plantZone: 'Indoor Plants',
      moistureBefore: 30,
      moistureAfter: 55,
      status: 'Error'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'completed':
      case 'treated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in progress':
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'none':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Activity History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your plant care activities and monitoring results
          </p>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-border/50 mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by plant name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 sm:h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full h-11 sm:h-12">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="treated">Treated</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full h-11 sm:h-12">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="whitespace-nowrap min-h-[44px] sm:min-h-[48px]">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="detections" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="detections" className="text-xs sm:text-sm py-2.5 sm:py-3">
              Disease Detection
            </TabsTrigger>
            <TabsTrigger value="watering" className="text-xs sm:text-sm py-2.5 sm:py-3">
              Watering History
            </TabsTrigger>
          </TabsList>

          {/* Disease Detection History */}
          <TabsContent value="detections">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Disease Detection Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Date & Time</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Plant</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Disease</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Confidence</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Severity</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detectionHistory.map((record) => (
                          <TableRow key={record.id} className="hover:bg-secondary/20">
                            <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">
                              {record.date}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">{record.plantName}</TableCell>
                            <TableCell className="whitespace-nowrap text-xs sm:text-sm">{record.disease}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${record.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm">{record.confidence}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge className={`${getSeverityColor(record.severity)} text-xs`}>
                                {record.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge className={`${getStatusColor(record.status)} text-xs`}>
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Button variant="ghost" size="sm" className="min-w-[40px] min-h-[40px]" aria-label="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          ))}
                        </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watering History */}
          <TabsContent value="watering">
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Watering Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Moisture Before</TableHead>
                        <TableHead>Moisture After</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wateringHistory.map((record) => (
                        <TableRow key={record.id} className="hover:bg-secondary/20">
                          <TableCell className="font-medium">
                            {record.date}
                          </TableCell>
                          <TableCell>{record.plantZone}</TableCell>
                          <TableCell>{record.duration}</TableCell>
                          <TableCell>
                            <Badge variant={record.trigger === 'Auto' ? 'default' : 'secondary'}>
                              {record.trigger}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{record.moistureBefore}%</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-green-600">
                              {record.moistureAfter}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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