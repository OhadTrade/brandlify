'use client';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import s from './studio-chrome.module.css';
const links=[['/services','שירותים'],['/portfolio','עבודות'],['/about','עלינו'],['/contact','קשר']] as const;
function Brand(){return <Link href="/" className={s.brand}><Image src="/brand/flowing-b.webp" width={40} height={40} alt=""/><span>BRANDLIFY</span></Link>}
export function StudioChrome({footer=false}:{footer?:boolean}){
 const home=usePathname()==='/';
 if(!home)return footer?<Footer/>:<Navbar/>;
 if(footer)return <footer className={s.footer}><Brand/><nav aria-label="ניווט תחתון">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><div><span>© {new Date().getFullYear()} Brandlify</span><Link href="/privacy">פרטיות</Link><Link href="/accessibility">נגישות</Link></div></footer>;
 return <header className={s.header}><Brand/><nav aria-label="ניווט ראשי">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><Link className={s.cta} href="/contact">קובעים שיחת היכרות ←</Link><details className={s.menu}><summary>תפריט</summary><nav aria-label="ניווט בנייד">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav></details></header>;
}
