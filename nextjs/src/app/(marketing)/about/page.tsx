"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT PAGE
// Clean, editorial layout - flowing narrative style
// ═══════════════════════════════════════════════════════════════════════════

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Dot grid pattern */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10">

        {/* Hero */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block bg-[#FF4400] text-white font-mono font-bold px-4 py-2 text-sm mb-8">
              Our Story
            </span>
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-[#FDFBF7] mb-6 leading-tight">
              About <span className="text-[#FF4400]">Babe, What&apos;s for Dinner?</span>
            </h1>
            <p className="text-xl text-[#FDFBF7]/60 leading-relaxed">
              A love story about meal prep, scattered recipes, and building
              something to make life a little easier.
            </p>
          </div>
        </section>

        {/* Photo */}
        <section className="pb-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-[#FF4400] translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3" />
              <div className="relative w-full h-full border-3 border-[#FDFBF7] overflow-hidden">
                <Image
                  src="/images/BabeWFDAboutPic.jpg"
                  alt="Me and Morgan"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <article className="prose-custom">

              <h2>The Sunday Ritual</h2>
              <p>
                Every Sunday, me and my partner Morgan sit down to plan our meal
                prep for the week. It&apos;s become our thing—figuring out
                what we want to eat, who&apos;s cooking what, and making our
                grocery list. There&apos;s something satisfying about having a
                plan that sets us up for a stress-free week ahead.
              </p>

              <h2>&quot;What was that meal with tofu?&quot;</h2>
              <p>
                But here&apos;s the thing: every time we&apos;d sit down to plan
                what to cook, we&apos;d have this conversation.
                <em> &quot;Hey, what was that meal we made with tofu two weeks ago?&quot;</em>
                {" "}And we&apos;d both sit there, trying to remember. Was it the
                stir-fry? The curry? The one with the peanut sauce?
              </p>
              <p>
                We&apos;d forget our favorite recipes, lose track of what worked
                and what didn&apos;t, and end up Googling the same things over and
                over again.
              </p>

              <h2>Recipes Everywhere, Nowhere</h2>
              <p>
                Our recipes were scattered across TikTok, YouTube, random blogs,
                screenshots in our camera rolls. There was no central place to
                find them. We&apos;d spend more time searching for recipes than
                actually planning meals.
              </p>
              <p>
                And tracking them? Forget about it. We had no idea what we cooked
                last week, let alone last month.
              </p>

              <h2>&quot;Babe, what&apos;s for dinner?&quot;</h2>
              <p>
                Then there was the nightly confusion. We&apos;d lose track of who
                was cooking and what we were supposed to make. When it was time to
                cook, I&apos;d ask Morgan the question that became the name of
                this app: <strong>&quot;Babe, what&apos;s for dinner?&quot;</strong>
              </p>
              <p>
                We needed a better system. Meal planning is such a consistent part
                of our lives—it shouldn&apos;t be this hard.
              </p>

              <h2>Building Something Better</h2>
              <p>
                So I decided to build something. Not just for us, but for anyone
                who feels this same frustration. A place to save recipes, plan the
                week, assign who&apos;s cooking what, and generate shopping lists
                automatically.
              </p>
              <p>
                Less time on <em>planning</em>, more time on <em>cooking</em>.
                Less confusion, more clarity. Less stress, more delicious food.
              </p>

              <h2>For You</h2>
              <p>
                I hope this helps you not only eat healthier but live a better
                life. Being organized reduces a lot of stress in relationships—I
                truly believe that. When you both know what&apos;s for dinner,
                who&apos;s cooking it, and what to buy at the store, everything
                just flows better.
              </p>
              <p>
                I&apos;m hoping you see the benefits in both your relationship and
                your general life. Because at the end of the day, that&apos;s what
                this is about: making life a little easier, one meal at a time.
              </p>

            </article>

            {/* Signature */}
            <div className="mt-16 pt-8 border-t border-[#FDFBF7]/10 text-center">
              <p className="text-[#FDFBF7]/50 italic mb-2">
                With love (and plenty of meal prep),
              </p>
              <p className="font-mono text-xl font-bold text-[#FF4400]">
                The team behind Babe, What&apos;s for Dinner?
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link href="/signup">
                <button
                  type="button"
                  className="bg-[#FF4400] text-white font-mono font-bold px-8 py-4 text-lg border-3 border-[#111] shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all inline-flex items-center gap-3"
                >
                  Start Planning Meals
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

          </div>
        </section>

      </div>

      {/* Custom prose styles */}
      <style jsx>{`
        .prose-custom h2 {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: #FDFBF7;
          margin-top: 3rem;
          margin-bottom: 1rem;
        }
        .prose-custom h2:first-child {
          margin-top: 0;
        }
        .prose-custom p {
          color: rgba(253, 251, 247, 0.7);
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .prose-custom em {
          color: #FF4400;
          font-style: italic;
        }
        .prose-custom strong {
          color: #FF4400;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
