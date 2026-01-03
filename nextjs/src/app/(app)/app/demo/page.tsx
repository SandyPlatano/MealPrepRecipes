"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { BarChart, Bar, XAxis, YAxis, LineChart, Line, AreaChart, Area } from "recharts";
import {
  CalendarDays,
  ChefHat,
  Clock,
  Flame,
  FolderOpen,
  Heart,
  Home,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

// ============================================
// MOCK DATA
// ============================================

const mockRecipes = [
  {
    id: "1",
    title: "Honey Garlic Salmon",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    time: 25,
    servings: 4,
    rating: 4.8,
    calories: 420,
    protein: 38,
    carbs: 12,
    fat: 24,
    tags: ["Quick", "High Protein"],
    author: "Sarah Chen",
  },
  {
    id: "2",
    title: "Mediterranean Chicken Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    time: 30,
    servings: 2,
    rating: 4.6,
    calories: 520,
    protein: 42,
    carbs: 35,
    fat: 22,
    tags: ["Meal Prep", "Balanced"],
    author: "Mike Johnson",
  },
  {
    id: "3",
    title: "Veggie Buddha Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    time: 20,
    servings: 1,
    rating: 4.5,
    calories: 380,
    protein: 15,
    carbs: 52,
    fat: 14,
    tags: ["Vegan", "Quick"],
    author: "Emma Wilson",
  },
  {
    id: "4",
    title: "Spicy Korean Beef Tacos",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    time: 35,
    servings: 6,
    rating: 4.9,
    calories: 480,
    protein: 28,
    carbs: 42,
    fat: 20,
    tags: ["Family Favorite", "Spicy"],
    author: "David Kim",
  },
  {
    id: "5",
    title: "Creamy Tuscan Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    time: 25,
    servings: 4,
    rating: 4.7,
    calories: 580,
    protein: 22,
    carbs: 65,
    fat: 26,
    tags: ["Comfort Food", "Date Night"],
    author: "Sarah Chen",
  },
  {
    id: "6",
    title: "Thai Peanut Stir Fry",
    image: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&h=300&fit=crop",
    time: 20,
    servings: 3,
    rating: 4.4,
    calories: 440,
    protein: 32,
    carbs: 28,
    fat: 24,
    tags: ["Quick", "Asian"],
    author: "Mike Johnson",
  },
];

const weeklyNutritionData = [
  { day: "Mon", calories: 1850, protein: 145, carbs: 180, fat: 65, target: 2000 },
  { day: "Tue", calories: 2100, protein: 160, carbs: 200, fat: 72, target: 2000 },
  { day: "Wed", calories: 1920, protein: 155, carbs: 175, fat: 68, target: 2000 },
  { day: "Thu", calories: 2050, protein: 162, carbs: 195, fat: 70, target: 2000 },
  { day: "Fri", calories: 1780, protein: 140, carbs: 165, fat: 62, target: 2000 },
  { day: "Sat", calories: 2200, protein: 170, carbs: 210, fat: 78, target: 2000 },
  { day: "Sun", calories: 1950, protein: 150, carbs: 185, fat: 68, target: 2000 },
];

const trendData = [
  { week: "W1", avgCalories: 1920, avgProtein: 148 },
  { week: "W2", avgCalories: 1980, avgProtein: 155 },
  { week: "W3", avgCalories: 2050, avgProtein: 160 },
  { week: "W4", avgCalories: 1890, avgProtein: 152 },
  { week: "W5", avgCalories: 2100, avgProtein: 165 },
  { week: "W6", avgCalories: 1950, avgProtein: 158 },
];

const chartConfig: ChartConfig = {
  calories: { label: "Calories", color: "#D9F99D" },
  protein: { label: "Protein", color: "#FDE047" },
  target: { label: "Target", color: "#1A1A1A" },
};

// ============================================
// MOCKUP COMPONENTS
// ============================================

function RecipeCardWithHover({ recipe }: { recipe: typeof mockRecipes[0] }) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="relative">
            <AspectRatio ratio={4 / 3}>
              <img
                src={recipe.image}
                alt={recipe.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 text-black hover:bg-white">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                {recipe.rating}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#D9F99D] transition-colors">
              {recipe.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.time}m
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings}
              </span>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{recipe.title}</h4>
              <p className="text-sm text-muted-foreground">by {recipe.author}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1.5">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-[#D9F99D]">{recipe.calories}</div>
              <div className="text-[10px] text-muted-foreground">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.protein}g</div>
              <div className="text-[10px] text-muted-foreground">protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.carbs}g</div>
              <div className="text-[10px] text-muted-foreground">carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.fat}g</div>
              <div className="text-[10px] text-muted-foreground">fat</div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1 bg-[#1A1A1A] hover:bg-[#2A2A2A]">
              <Plus className="h-3 w-3 mr-1" />
              Add to Plan
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              View Recipe
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function StatsDashboardMockup() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#D9F99D]/20 to-[#D9F99D]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#D9F99D]/30">
                <Flame className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Calories</p>
                <p className="text-xl font-bold">1,978</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#FDE047]/30">
                <Zap className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Protein</p>
                <p className="text-xl font-bold">155g</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#EDE9FE]/50">
                <TrendingUp className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">On Target</p>
                <p className="text-xl font-bold">5/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <CalendarDays className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-xl font-bold">12 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Calories</CardTitle>
            <CardDescription>Daily intake vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <BarChart data={weeklyNutritionData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="calories" fill="#D9F99D" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#1A1A1A"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Protein Trend</CardTitle>
            <CardDescription>6-week overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <AreaChart data={trendData}>
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="avgProtein"
                  stroke="#FDE047"
                  fill="#FDE047"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Macro Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={weeklyNutritionData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="protein" stroke="#D9F99D" strokeWidth={2} dot={{ fill: "#D9F99D" }} />
              <Line type="monotone" dataKey="carbs" stroke="#FDE047" strokeWidth={2} dot={{ fill: "#FDE047" }} />
              <Line type="monotone" dataKey="fat" stroke="#EDE9FE" strokeWidth={2} dot={{ fill: "#EDE9FE" }} />
            </LineChart>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D9F99D]" />
              <span className="text-sm">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FDE047]" />
              <span className="text-sm">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EDE9FE]" />
              <span className="text-sm">Fat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D9F99D]">
            <ChefHat className="h-5 w-5 text-[#1A1A1A]" />
          </div>
          <span className="font-bold">MealPrep</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Recipes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <CalendarDays className="h-4 w-4" />
                  <span>Meal Plan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Shopping List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TrendingUp className="h-4 w-4" />
                  <span>Stats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FolderOpen className="h-4 w-4" />
                  <span>Quick Meals</span>
                  <Badge variant="secondary" className="ml-auto text-xs">12</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FolderOpen className="h-4 w-4" />
                  <span>Meal Prep</span>
                  <Badge variant="secondary" className="ml-auto text-xs">8</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FolderOpen className="h-4 w-4" />
                  <span>Date Night</span>
                  <Badge variant="secondary" className="ml-auto text-xs">5</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Favorites</span>
                  <Badge variant="secondary" className="ml-auto text-xs">24</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function ComponentDemoPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-mono">Realistic Mockups</h1>
        <p className="text-muted-foreground mt-1">
          See how these components would look in your actual app
        </p>
      </div>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">Recipe Grid</TabsTrigger>
          <TabsTrigger value="stats">Stats Page</TabsTrigger>
          <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
          <TabsTrigger value="aspect">Aspect Ratio</TabsTrigger>
        </TabsList>

        {/* Recipe Grid with Hover Cards */}
        <TabsContent value="recipes" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Your Recipes</h2>
                <p className="text-sm text-muted-foreground">Hover over any card to see nutrition details</p>
              </div>
              <Button className="bg-[#1A1A1A]">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockRecipes.map((recipe) => (
                <RecipeCardWithHover key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Stats Dashboard */}
        <TabsContent value="stats" className="mt-6">
          <StatsDashboardMockup />
        </TabsContent>

        {/* Sidebar Demo */}
        <TabsContent value="sidebar" className="mt-6">
          <Card className="overflow-hidden">
            <div className="h-[500px] flex">
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <SidebarTrigger />
                    <h2 className="text-lg font-semibold">Main Content Area</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">This Week</div>
                      <div className="text-2xl font-bold mt-1">12 meals</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Recipes</div>
                      <div className="text-2xl font-bold mt-1">48 saved</div>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    ← Try collapsing the sidebar using the trigger button
                  </p>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </Card>
        </TabsContent>

        {/* Aspect Ratio Demo */}
        <TabsContent value="aspect" className="mt-6">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recipe Card Ratios</h3>
              <p className="text-sm text-muted-foreground mb-6">
                AspectRatio ensures consistent image dimensions regardless of source image size
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium mb-2">4:3 (Current)</p>
                  <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg overflow-hidden">
                    <img
                      src={mockRecipes[0].image}
                      alt="4:3"
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">16:9 (Wide)</p>
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                    <img
                      src={mockRecipes[1].image}
                      alt="16:9"
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">1:1 (Square)</p>
                  <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden">
                    <img
                      src={mockRecipes[2].image}
                      alt="1:1"
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hero Recipe Card</h3>
              <AspectRatio ratio={21 / 9} className="bg-muted rounded-xl overflow-hidden">
                <img
                  src={mockRecipes[3].image}
                  alt="Hero"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge className="bg-[#D9F99D] text-black mb-2">Featured</Badge>
                  <h2 className="text-2xl font-bold">{mockRecipes[3].title}</h2>
                  <p className="text-white/80 mt-1">by {mockRecipes[3].author}</p>
                </div>
              </AspectRatio>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Notice */}
      <Card className="border-dashed border-amber-500/50 bg-amber-50/50">
        <CardContent className="py-4">
          <p className="text-sm text-center text-muted-foreground">
            This demo page can be deleted after testing:{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              src/app/(app)/app/demo/page.tsx
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
