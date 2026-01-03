"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

interface TryNowCardProps {
  onNavigate: () => void;
}

export function TryNowCard({ onNavigate }: TryNowCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Ready to Cook?
            </CardTitle>
            <CardDescription>
              Test your settings in cooking mode
            </CardDescription>
          </div>
          <Button onClick={onNavigate}>
            <ChefHat className="h-4 w-4 mr-2" />
            Try Now
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
