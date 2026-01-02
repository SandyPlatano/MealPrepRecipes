import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT PAGE - Warm & Cozy Design System
// Clean, editorial layout with warm off-white background
// ═══════════════════════════════════════════════════════════════════════════

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-[#D9F99D] text-[#1A1A1A] font-semibold px-4 py-2 text-sm rounded-full mb-8">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight">
            About <span className="text-gray-500">Babe, What&apos;s for Dinner?</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A love story about meal prep, scattered recipes, and building
            something to make life a little easier.
          </p>
        </div>
      </section>

      {/* Photo */}
      <section className="pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <Image
              src="/images/BabeWFDAboutPic.jpg"
              alt="Me and Morgan"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <article className="space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">The Sunday Ritual</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every Sunday, me and my partner Morgan sit down to plan our meal
                prep for the week. It&apos;s become our thing—figuring out
                what we want to eat, who&apos;s cooking what, and making our
                grocery list. There&apos;s something satisfying about having a
                plan that sets us up for a stress-free week ahead.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">&quot;What was that meal with tofu?&quot;</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                But here&apos;s the thing: every time we&apos;d sit down to plan
                what to cook, we&apos;d have this conversation.
                <em className="text-[#1A1A1A] font-medium"> &quot;Hey, what was that meal we made with tofu two weeks ago?&quot;</em>
                {" "}And we&apos;d both sit there, trying to remember. Was it the
                stir-fry? The curry? The one with the peanut sauce?
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We&apos;d forget our favorite recipes, lose track of what worked
                and what didn&apos;t, and end up Googling the same things over and
                over again.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Recipes Everywhere, Nowhere</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Our recipes were scattered across TikTok, YouTube, random blogs,
                screenshots in our camera rolls. There was no central place to
                find them. We&apos;d spend more time searching for recipes than
                actually planning meals.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                And tracking them? Forget about it. We had no idea what we cooked
                last week, let alone last month.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">&quot;Babe, what&apos;s for dinner?&quot;</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Then there was the nightly confusion. We&apos;d lose track of who
                was cooking and what we were supposed to make. When it was time to
                cook, I&apos;d ask Morgan the question that became the name of
                this app: <strong className="text-[#1A1A1A]">&quot;Babe, what&apos;s for dinner?&quot;</strong>
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We needed a better system. Meal planning is such a consistent part
                of our lives—it shouldn&apos;t be this hard.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Building Something Better</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                So I decided to build something. Not just for us, but for anyone
                who feels this same frustration. A place to save recipes, plan the
                week, assign who&apos;s cooking what, and generate shopping lists
                automatically.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Less time on <em className="text-[#1A1A1A] font-medium">planning</em>, more time on <em className="text-[#1A1A1A] font-medium">cooking</em>.
                Less confusion, more clarity. Less stress, more delicious food.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">For You</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                I hope this helps you not only eat healthier but live a better
                life. Being organized reduces a lot of stress in relationships—I
                truly believe that. When you both know what&apos;s for dinner,
                who&apos;s cooking it, and what to buy at the store, everything
                just flows better.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                I&apos;m hoping you see the benefits in both your relationship and
                your general life. Because at the end of the day, that&apos;s what
                this is about: making life a little easier, one meal at a time.
              </p>
            </div>

          </article>

          {/* Signature */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 italic mb-2">
              With love (and plenty of meal prep),
            </p>
            <p className="text-xl font-bold text-[#1A1A1A]">
              The team behind Babe, What&apos;s for Dinner?
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 inline-flex items-center gap-3 group shadow-md hover:shadow-lg"
              >
                Start Planning Meals
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
