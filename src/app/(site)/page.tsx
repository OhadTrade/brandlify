import { MarkStage } from "@/components/hero/MarkStage";
import { ScrollFlow } from "@/components/motion/ScrollFlow";
import { Automations } from "@/components/sections/Automations";
import { BuildBrandGrow } from "@/components/sections/BuildBrandGrow";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SocialProof } from "@/components/sections/SocialProof";
import { Split } from "@/components/sections/Split";
import { StatsBar } from "@/components/sections/StatsBar";

/**
 * Home page. Every section is a Server Component that fetches its own content,
 * so nothing here ships JavaScript. Portfolio and LatestPosts return null while
 * their tables are empty; SocialProof swaps itself for the written commitments.
 */

export const revalidate = 300;

export default function Home() {
  return (
    <>
      {/*
        The stage holds the hero only.

        It spanned three sections for a while - the mark surviving past the hero
        and being re-framed by scroll, which is the idea worth taking from the
        WebGL scroll pieces. On this page it did not work. Held behind live
        copy the mark stopped being a subject and became a large translucent
        object in the way of the text: across the commitments figures in the
        middle chapter, and off in a gutter in the last one, where its position
        read as accidental rather than composed.

        The failure is not the technique, it is that this page has no chapter
        for it. It has sections that each say their own thing, and a persistent
        object behind them competes instead of connecting. What connects them is
        the choreography below: every section arrives and leaves on the scroll,
        so the page moves as one piece.
      */}
      <MarkStage>
        <Hero />
      </MarkStage>

      <StatsBar />

      {/*
        Everything from here down arrives and leaves with the scroll. Opt-in per
        section by attribute, because two of them pin or stick and a transformed
        ancestor breaks both.
      */}
      <ScrollFlow>
        <ServicesGrid />
        <Split />
        <BuildBrandGrow />
        <Portfolio />
        <Process />
        <Automations />
        <SocialProof />
        <LatestPosts />
        <Faq />
        <FinalCta />
      </ScrollFlow>
    </>
  );
}
