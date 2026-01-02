"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HouseholdRole, PermissionMode } from "@/types/household-permissions";
import { PERMISSION_MODE_CONFIG, ROLE_CONFIG } from "@/types/household-permissions";

interface HouseholdMemberData {
  user_id: string;
  role: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

interface MemberRoleEditorProps {
  members: HouseholdMemberData[];
  currentUserId: string;
  permissionMode: PermissionMode;
  onRoleChange: (memberId: string, newRole: HouseholdRole) => void;
  isOwner: boolean;
  className?: string;
}

// Get available roles based on permission mode
function getAvailableRoles(mode: PermissionMode): HouseholdRole[] {
  return PERMISSION_MODE_CONFIG[mode].availableRoles;
}

// Get role display label
function getRoleLabel(role: string): string {
  return ROLE_CONFIG[role as HouseholdRole]?.label || role;
}

// Get member display name
function getMemberDisplayName(member: HouseholdMemberData): string {
  if (member.profiles?.first_name) {
    return member.profiles.first_name;
  }
  if (member.profiles?.email) {
    return member.profiles.email;
  }
  return "Unknown";
}

// Get member initials for avatar
function getMemberInitials(member: HouseholdMemberData): string {
  if (member.profiles?.first_name) {
    return member.profiles.first_name[0].toUpperCase();
  }
  if (member.profiles?.email) {
    return member.profiles.email[0].toUpperCase();
  }
  return "?";
}

export function MemberRoleEditor({
  members,
  currentUserId,
  permissionMode,
  onRoleChange,
  isOwner,
  className,
}: MemberRoleEditorProps) {
  const availableRoles = getAvailableRoles(permissionMode);

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const memberRole = member.role as HouseholdRole;

          return (
            <div
              key={member.user_id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white"
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-sm">
                  {getMemberInitials(member)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {getMemberDisplayName(member)}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                {member.profiles?.email && member.profiles.first_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {member.profiles.email}
                  </p>
                )}
              </div>

              {isOwner && !isCurrentUser ? (
                <Select
                  value={memberRole}
                  onValueChange={(newRole) =>
                    onRoleChange(member.user_id, newRole as HouseholdRole)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles
                      .filter((role) => role !== "owner")
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {getRoleLabel(memberRole)}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
