import { useState } from "react";
import { Search, Droplets, Sun, ThermometerSun, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";

interface Plant {
  id: number;
  name: string;
  scientificName: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  wateringFrequency: string;
  sunlight: string;
  temperature: string;
  description: string;
  benefits: string[];
}

export default function PlantTypes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const plants: Plant[] = [
    {
      id: 1,
      name: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Easy",
      wateringFrequency: "Every 2-3 weeks",
      sunlight: "Low to bright indirect light",
      temperature: "15-29°C",
      description: "A hardy, low-maintenance plant perfect for beginners. Known for air purifying qualities.",
      benefits: ["Air purification", "Low maintenance", "Drought tolerant"]
    },
    {
      id: 2,
      name: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Medium",
      wateringFrequency: "Weekly",
      sunlight: "Bright indirect light",
      temperature: "18-27°C",
      description: "Popular tropical plant with distinctive split leaves. Great for adding a tropical feel.",
      benefits: ["Decorative", "Air purifying", "Fast growing"]
    },
    {
      id: 3,
      name: "Aloe Vera",
      scientificName: "Aloe barbadensis miller",
      image: "https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=400&h=300&fit=crop",
      category: "Succulent",
      difficulty: "Easy",
      wateringFrequency: "Every 2-3 weeks",
      sunlight: "Bright direct light",
      temperature: "13-27°C",
      description: "Medicinal succulent with healing gel. Excellent for skin care and minor burns.",
      benefits: ["Medicinal properties", "Low water needs", "Easy propagation"]
    },
    {
      id: 4,
      name: "Peace Lily",
      scientificName: "Spathiphyllum",
      image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Easy",
      wateringFrequency: "Weekly",
      sunlight: "Low to medium light",
      temperature: "18-24°C",
      description: "Elegant flowering plant that thrives in low light. Excellent air purifier.",
      benefits: ["Beautiful flowers", "Air purification", "Low light tolerant"]
    },
    {
      id: 5,
      name: "Fiddle Leaf Fig",
      scientificName: "Ficus lyrata",
      image: "https://images.unsplash.com/photo-1614594895304-fe7116ac3b58?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Hard",
      wateringFrequency: "Weekly",
      sunlight: "Bright indirect light",
      temperature: "18-24°C",
      description: "Stunning statement plant with large violin-shaped leaves. Requires consistent care.",
      benefits: ["Decorative", "Air purifying", "Statement piece"]
    },
    {
      id: 6,
      name: "Pothos",
      scientificName: "Epipremnum aureum",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Easy",
      wateringFrequency: "Every 1-2 weeks",
      sunlight: "Low to bright indirect light",
      temperature: "15-29°C",
      description: "Versatile trailing plant perfect for hanging baskets. Very forgiving and fast-growing.",
      benefits: ["Easy to grow", "Air purifying", "Versatile placement"]
    },
    {
      id: 7,
      name: "Spider Plant",
      scientificName: "Chlorophytum comosum",
      image: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Easy",
      wateringFrequency: "Weekly",
      sunlight: "Bright indirect light",
      temperature: "13-24°C",
      description: "Classic houseplant with arching leaves and baby plantlets. Great for beginners.",
      benefits: ["Air purification", "Easy propagation", "Pet-friendly"]
    },
    {
      id: 8,
      name: "Rubber Plant",
      scientificName: "Ficus elastica",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Medium",
      wateringFrequency: "Weekly",
      sunlight: "Bright indirect light",
      temperature: "15-24°C",
      description: "Bold plant with large glossy leaves. Excellent for adding height to indoor spaces.",
      benefits: ["Air purifying", "Low maintenance", "Decorative"]
    },
    {
      id: 9,
      name: "Jade Plant",
      scientificName: "Crassula ovata",
      image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&h=300&fit=crop",
      category: "Succulent",
      difficulty: "Easy",
      wateringFrequency: "Every 2-3 weeks",
      sunlight: "Bright direct light",
      temperature: "18-24°C",
      description: "Lucky plant with thick, woody stems and oval leaves. Symbol of prosperity.",
      benefits: ["Low maintenance", "Long-lived", "Good luck symbol"]
    },
    {
      id: 10,
      name: "Boston Fern",
      scientificName: "Nephrolepis exaltata",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
      category: "Fern",
      difficulty: "Medium",
      wateringFrequency: "2-3 times per week",
      sunlight: "Indirect light",
      temperature: "15-24°C",
      description: "Lush, feathery fern perfect for hanging baskets. Loves humidity.",
      benefits: ["Air purifying", "Humidity loving", "Decorative"]
    },
    {
      id: 11,
      name: "ZZ Plant",
      scientificName: "Zamioculcas zamiifolia",
      image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=400&h=300&fit=crop",
      category: "Indoor",
      difficulty: "Easy",
      wateringFrequency: "Every 2-3 weeks",
      sunlight: "Low to bright indirect light",
      temperature: "15-24°C",
      description: "Nearly indestructible plant with glossy leaves. Perfect for low-light spaces.",
      benefits: ["Drought tolerant", "Low light tolerant", "Low maintenance"]
    },
    {
      id: 12,
      name: "Lavender",
      scientificName: "Lavandula",
      image: "https://images.unsplash.com/photo-1595239244990-1c62c6f1e6c1?w=400&h=300&fit=crop",
      category: "Outdoor",
      difficulty: "Medium",
      wateringFrequency: "Weekly",
      sunlight: "Full sun",
      temperature: "15-30°C",
      description: "Fragrant herb with purple flowers. Great for gardens and aromatherapy.",
      benefits: ["Aromatic", "Medicinal", "Attracts pollinators"]
    }
  ];

  const categories = ["All", "Indoor", "Outdoor", "Succulent", "Fern"];

  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || plant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Hard": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Plant Types & Care Guide
          </h1>
          <p className="text-muted-foreground">
            Explore different plant varieties and learn how to care for them
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search plants by name or scientific name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'}
          </p>
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant, index) => (
            <Card
              key={plant.id}
              className="hover-lift shadow-card border-border/50 overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getDifficultyColor(plant.difficulty)}>
                    {plant.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{plant.name}</h3>
                    <p className="text-xs text-muted-foreground italic">{plant.scientificName}</p>
                  </div>
                  <Badge variant="outline">{plant.category}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{plant.description}</p>

                {/* Care Requirements */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Droplets className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Watering</p>
                      <p className="text-muted-foreground">{plant.wateringFrequency}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Sun className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Sunlight</p>
                      <p className="text-muted-foreground">{plant.sunlight}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ThermometerSun className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Temperature</p>
                      <p className="text-muted-foreground">{plant.temperature}</p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    Benefits
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {plant.benefits.map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPlants.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No plants found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
