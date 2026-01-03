import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";
import { StarSmall } from "@/components/landing/shared/star-decoration";

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT PAGE - Universal Messaging
// Focus on the universal problem of meal planning, not couples-specific
// ═══════════════════════════════════════════════════════════════════════════

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Photo */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-10">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D9F99D]/30 to-[#D9F99D]/10 blur-2xl" />
            <div className="relative w-full h-full rounded-2xl border-4 border-[#D9F99D]/30 overflow-hidden shadow-xl">
              <Image
                src="/images/BabeWFDAboutPic.jpg"
                alt="The team behind What's for Dinner?"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <span className="inline-block bg-[#D9F99D] text-[#1A1A1A] font-semibold px-4 py-2 text-sm rounded-full mb-8">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight">
            Why We Built <span className="text-[#1A1A1A]">What&apos;s for Dinner?</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A story about wasted groceries, forgotten recipes, and building
            something to make dinnertime less stressful.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <article className="space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">The Sunday Ritual</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every Sunday, I sit down to plan meals for the week. It&apos;s
                become a ritual—figuring out what I want to eat, what I need to
                buy, and how to make the most of my grocery budget. There&apos;s
                something satisfying about having a plan that sets you up for a
                stress-free week ahead.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">&quot;What was that meal with tofu?&quot;</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                But here&apos;s the thing: every time I&apos;d sit down to plan,
                I&apos;d have this moment.
                <em className="text-[#1A1A1A] font-medium"> &quot;What was that meal I made two weeks ago? The one with tofu?&quot;</em>
                {" "}Was it the stir-fry? The curry? The one with peanut sauce?
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                I&apos;d forget my favorite recipes, lose track of what worked
                and what didn&apos;t, and end up Googling the same things over and
                over again.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Recipes Everywhere, Nowhere</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                My recipes were scattered across TikTok, YouTube, random blogs,
                and screenshots buried in my camera roll. There was no central place to
                find them. I&apos;d spend more time searching for recipes than
                actually planning meals.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Sound familiar? I bet half your saved recipes are in apps you
                forgot you had.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">The Real Cost</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Without a plan, I&apos;d wander the grocery store, grabbing things
                that &quot;looked good.&quot; Half of it would rot in the back of
                the fridge. The other half? I&apos;d forget I had it and order
                takeout anyway.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Studies show the average household throws away 30-40% of the food
                they buy. That&apos;s real money—$1,500 or more per year—going
                straight into the trash.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">&quot;What&apos;s for dinner?&quot;</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Then there was the nightly question. 6 PM hits, you&apos;re hungry,
                you&apos;re tired, and you&apos;re staring at a fridge full of
                ingredients that don&apos;t quite go together. The question echoes:{" "}
                <strong className="text-[#1A1A1A]">&quot;What&apos;s for dinner?&quot;</strong>
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                I needed a better system. Meal planning is such a consistent part
                of life—it shouldn&apos;t be this hard.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Building Something Better</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                So I decided to build something. Not just for me, but for anyone
                who feels this same frustration. A place to save recipes, plan the
                week, and generate shopping lists automatically.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                This isn&apos;t about batch cooking or spending your entire Sunday
                in the kitchen. It&apos;s about spending 5 minutes to know what
                you&apos;re eating this week—so you can buy what you need, skip
                what you don&apos;t, and actually eat what&apos;s in your fridge.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">For You</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Whether you&apos;re cooking for yourself, your family, or your
                roommates—I hope this helps you eat better and spend less. When you
                know what&apos;s for dinner before you&apos;re hungry and desperate,
                everything just flows better.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Less stress. Less waste. Less money down the drain. More delicious
                food on your table.
              </p>
            </div>

          </article>

          {/* Signature */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 italic mb-2">
              Here&apos;s to knowing what&apos;s for dinner,
            </p>
            <p className="text-xl font-bold text-[#1A1A1A]">
              The team behind What&apos;s for Dinner?
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 inline-flex items-center gap-3 group shadow-md hover:shadow-lg"
              >
                <StarSmall size={16} className="text-[#D9F99D]" />
                Start Planning Free
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
