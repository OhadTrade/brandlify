import { MarkStage } from '@/components/hero/MarkStage';
import { Automations } from '@/components/sections/Automations';
import { BuildBrandGrow } from '@/components/sections/BuildBrandGrow';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Hero } from '@/components/sections/Hero';
import { LatestPosts } from '@/components/sections/LatestPosts';
import { Portfolio } from '@/components/sections/Portfolio';
import { Process } from '@/components/sections/Process';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { SocialProof } from '@/components/sections/SocialProof';
import { Split } from '@/components/sections/Split';
import { StatsBar } from '@/components/sections/StatsBar';

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
        The mark is held across these three sections rather than dying with the
        hero: one subject, re-framed by scroll, which is the part of a WebGL
        scroll piece that survives being done inside a real document. The stage
        ends here on purpose - past the services grid the page has its own
        subjects and a mark still hanging behind them is set dressing.
      */}
      <MarkStage>
        <Hero />
        <StatsBar />
        <ServicesGrid />
      </MarkStage>

      <Split />
      <BuildBrandGrow />
      <Portfolio />
      <Process />
      <Automations />
      <SocialProof />
      <LatestPosts />
      <Faq />
      <FinalCta />
    </>
  );
}
