import { MarkStage } from '@/components/hero/MarkStage';
import { HomeFlow } from '@/components/home/HomeFlow';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeServices } from '@/components/home/HomeServices';
import styles from '@/components/home/home.module.css';
import { Automations } from '@/components/sections/Automations';
import { BuildBrandGrow } from '@/components/sections/BuildBrandGrow';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { LatestPosts } from '@/components/sections/LatestPosts';
import { Portfolio } from '@/components/sections/Portfolio';
import { Process } from '@/components/sections/Process';
import { SocialProof } from '@/components/sections/SocialProof';
import { Split } from '@/components/sections/Split';
import { StatsBar } from '@/components/sections/StatsBar';

export const revalidate = 300;

export default function Home() {
  return (
    <div className={styles.home}>
      <MarkStage>
        <HomeHero />
      </MarkStage>
      <StatsBar />
      <HomeFlow>
        <HomeServices />
        <Split />
        <BuildBrandGrow />
        <Portfolio />
        <Process />
        <Automations />
        <SocialProof />
        <LatestPosts />
        <Faq />
        <FinalCta />
      </HomeFlow>
    </div>
  );
}
