"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChefHat, ShoppingCart } from "lucide-react";

export interface MemberContribution {
  user_id: string;
  first_name: string | null;
  email: string | null;
  meals_planned: number;
  meals_cooked: number;
  items_added: number;
}

interface ContributionDashboardProps {
  contributions: MemberContribution[];
  className?: string;
}

function getMemberDisplayName(member: MemberContribution): string {
  return member.first_name || member.email || "Unknown";
}

function getMemberInitials(member: MemberContribution): string {
  if (member.first_name) {
    return member.first_name[0].toUpperCase();
  }
  if (member.email) {
    return member.email[0].toUpperCase();
  }
  return "?";
}

function generateContributionPrompt(
  member: MemberContribution,
  total: { planned: number; cooked: number; items: number }
): string | null {
  const name = member.first_name || "This member";

  // If they've planned majority of meals
  if (total.planned > 0 && member.meals_planned / total.planned >= 0.6) {
    return `${name} planned ${member.meals_planned}/${total.planned} meals this week`;
  }

  // If they've cooked majority of meals
  if (total.cooked > 0 && member.meals_cooked / total.cooked >= 0.6) {
    return `${name} cooked ${member.meals_cooked}/${total.cooked} meals this week`;
  }

  // If they've added majority of items
  if (total.items > 0 && member.items_added / total.items >= 0.6) {
    return `${name} added ${member.items_added}/${total.items} shopping items`;
  }

  return null;
}

export function ContributionDashboard({
  contributions,
  className,
}: ContributionDashboardProps) {
  // Calculate totals
  const totals = contributions.reduce(
    (acc, member) => ({
      planned: acc.planned + member.meals_planned,
      cooked: acc.cooked + member.meals_cooked,
      items: acc.items + member.items_added,
    }),
    { planned: 0, cooked: 0, items: 0 }
  );

  // Generate prompts for high contributors
  const prompts = contributions
    .map((member) => generateContributionPrompt(member, totals))
    .filter((prompt): prompt is string => prompt !== null);

  return (
    <div className={className}>
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#1A1A1A]">Household Contributions</CardTitle>
          <CardDescription className="text-gray-600">
            See who&apos;s been active in meal planning this week
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Contribution highlights */}
          {prompts.length > 0 && (
            <div className="flex flex-col gap-2">
              {prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md"
                >
                  {prompt}
                </div>
              ))}
            </div>
          )}

          {/* Member contribution table */}
          <div className="flex flex-col gap-3">
            {contributions.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-4 p-3 rounded-lg border border-gray-200"
              >
                <Avatar className="size-10">
                  <AvatarFallback>
                    {getMemberInitials(member)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getMemberDisplayName(member)}
                  </p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1" title="Meals Planned">
                    <Calendar className="size-3.5" />
                    <span className="font-medium">{member.meals_planned}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Meals Cooked">
                    <ChefHat className="size-3.5" />
                    <span className="font-medium">{member.meals_cooked}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Items Added">
                    <ShoppingCart className="size-3.5" />
                    <span className="font-medium">{member.items_added}</span>
                  </div>
                </div>
              </div>
            ))}

            {contributions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No contribution data available yet
              </p>
            )}
          </div>

          {/* Legend */}
          {contributions.length > 0 && (
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ChefHat className="size-3.5" />
                <span>Cooked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="size-3.5" />
                <span>Added</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
