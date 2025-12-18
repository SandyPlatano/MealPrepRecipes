import { VoiceCookingMode } from "@/components/cook-mode/voice-cooking-mode";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

interface CookPageProps {
  params: Promise<{ id: string }>;
}

export default async function CookPage({ params }: CookPageProps) {
  const { id } = await params;

  return <VoiceCookingMode recipeId={id} />;
}

