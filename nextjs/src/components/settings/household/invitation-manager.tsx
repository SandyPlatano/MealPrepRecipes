"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Copy,
  Check,
  X,
  RefreshCw,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  sendHouseholdInvitation,
  getHouseholdInvitations,
  cancelHouseholdInvitation,
  resendHouseholdInvitation,
  getInvitationLink,
  type HouseholdInvitationWithInviter,
} from "@/app/actions/household-invitations";
import { cn } from "@/lib/utils";

interface InvitationManagerProps {
  isOwner: boolean;
}

export function InvitationManager({ isOwner }: InvitationManagerProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<HouseholdInvitationWithInviter[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load invitations on mount
  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    const result = await getHouseholdInvitations();
    if (!result.error && result.data) {
      setInvitations(result.data);
    }
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    const result = await sendHouseholdInvitation(email.trim());
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      loadInvitations();
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const result = await cancelHouseholdInvitation(invitationId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation cancelled");
      loadInvitations();
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    const result = await resendHouseholdInvitation(invitationId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation resent");
      loadInvitations();
    }
  };

  const copyInviteLink = async (token: string) => {
    const link = await getInvitationLink(token);
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();

    if (status === "accepted") {
      return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
    }
    if (status === "cancelled") {
      return <Badge variant="secondary">Cancelled</Badge>;
    }
    if (isExpired || status === "expired") {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
  };

  const formatExpiration = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending" && new Date(inv.expires_at) > new Date()
  );

  if (!isOwner) {
    return (
      <div className="text-sm text-muted-foreground">
        Only household owners can invite new members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Send Invitation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Invite by Email</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendInvitation()}
            className="flex-1"
          />
          <Button
            onClick={handleSendInvitation}
            disabled={isLoading || !email.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          The invited person will need to create an account (or log in) to join your household.
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pending Invitations</span>
          </div>
          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {invitation.email}
                    </span>
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatExpiration(invitation.expires_at)}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyInviteLink(invitation.token)}
                    title="Copy invite link"
                  >
                    {copiedToken === invitation.token ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleResendInvitation(invitation.id)}
                    title="Resend invitation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    title="Cancel invitation"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
