"use client";

import { useState } from "react";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingSection } from "@/components/settings/shared/setting-row";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ExternalLink,
  Send,
  Loader2,
  Heart,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { submitFeedback } from "@/app/actions/feedback";
import { cn } from "@/lib/utils";

const MAX_CHARACTERS = 2000;
const MIN_CHARACTERS = 10;

const CONTACT = {
  email: "andujar609@gmail.com",
  reddit: "https://reddit.com/r/babewfd",
};

export default function FeedbackSettingsPage() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const characterCount = feedback.length;
  const isValid =
    characterCount >= MIN_CHARACTERS && characterCount <= MAX_CHARACTERS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error(
        `Feedback must be between ${MIN_CHARACTERS} and ${MAX_CHARACTERS} characters`
      );
      return;
    }

    setIsSubmitting(true);
    const result = await submitFeedback({ content: feedback });
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSubmitted(true);
    setFeedback("");
    toast.success("Thank you for your feedback!");
  };

  const handleReset = () => {
    setSubmitted(false);
    setFeedback("");
  };

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Feedback"
        description="Share your thoughts and help improve the app"
      />

      {/* Personal Message */}
      <Alert className="bg-primary/5 border-primary/20">
        <Heart className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <p className="font-medium mb-2">A note from the developer</p>
          <p className="text-muted-foreground">
            I personally read every piece of feedback. Your input directly
            shapes the future of this app. Whether it&apos;s a feature idea, a
            bug you found, or just a thought - I want to hear it. If you ever
            feel like your voice wasn&apos;t heard, please reach out directly.
          </p>
        </AlertDescription>
      </Alert>

      {/* Feedback Form */}
      <SettingSection
        title="Share Your Feedback"
        description="Tell me what's on your mind - no categories, no pressure"
      >
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Thank you!</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Your feedback means a lot. I&apos;ll review it soon and reach
                out if I have any questions.
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Send More Feedback
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What's working well? What could be better? Any features you'd love to see?"
                className="min-h-[150px] resize-none"
                maxLength={MAX_CHARACTERS}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {characterCount < MIN_CHARACTERS
                    ? `${MIN_CHARACTERS - characterCount} more characters needed`
                    : "Looking good!"}
                </span>
                <span
                  className={cn(
                    characterCount > MAX_CHARACTERS * 0.9 && "text-amber-500",
                    characterCount >= MAX_CHARACTERS && "text-destructive"
                  )}
                >
                  {characterCount}/{MAX_CHARACTERS}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </SettingSection>

      {/* Alternative Contact Methods */}
      <SettingSection
        title="Other Ways to Reach Me"
        description="Prefer a different channel? I'm here for that too"
      >
        <div className="grid gap-4 py-4 sm:grid-cols-2">
          {/* Email Option */}
          <a
            href={`mailto:${CONTACT.email}?subject=MealPrepRecipes Feedback`}
            className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors group"
          >
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">Email Me Directly</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                For detailed conversations or if you haven&apos;t heard back
              </p>
            </div>
          </a>

          {/* Reddit Option */}
          <a
            href={CONTACT.reddit}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors group"
          >
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <MessageCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">Join the Community</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect with other users and share ideas on Reddit
              </p>
            </div>
          </a>
        </div>
      </SettingSection>

      {/* Closing Note */}
      <div className="text-center py-4 text-sm text-muted-foreground">
        <p>
          Building this app with love.{" "}
          <Heart className="h-3 w-3 inline text-red-500 fill-red-500" /> Your
          feedback makes it better.
        </p>
      </div>
    </div>
  );
}
