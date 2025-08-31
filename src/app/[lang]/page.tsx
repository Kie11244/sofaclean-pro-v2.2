
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, MapPin, Phone, Newspaper, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, DocumentData, doc, getDoc } from 'firebase/firestore';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from '@/components/reveal';
import { JsonLD } from '@/components/json-ld';
import { EstimateDialog } from '@/components/estimate-dialog';
import { getDictionary } from '@/lib/dictionaries';

interface Post extends DocumentData {
    id: string;
    title: string;
    slug: string;
    image: string;
    imageHint: string;
    date: string;
    category: string;
    description: string;
    status: 'published' | 'draft';
}

interface HomePageData {
    heroImageUrl: string;
    beforeImageUrl: string;
    afterImageUrl: string;
}

interface ContactSettings {
  phone: string;
  facebookUrl: string;
  lineUrl: string;
}

type Props = {
  params: { lang: 'en' | 'th' };
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://psychic-glider-453312-k0.firebaseapp.com';

export async function generateMetadata({ params: { lang } }: Props): Promise<Metadata> {
    const dict = await getDictionary(lang);
    const canonicalUrl = `${SITE_URL}/${lang}`;
    
    const metadataTranslations = {
        en: {
            title: "SofaClean Pro | Sofa, Curtain & Car Seat Cleaning Services",
            description: "Professional on-site cleaning for sofas, curtains, car seats, carpets, and mattresses in Bangkok. We remove stains, dust mites, and odors.",
        },
        th: {
            title: "SofaClean Pro | บริการซักโซฟา ซักเบาะรถยนต์ ซักม่าน",
            description: "บริการซักโซฟา ซักเบาะรถยนต์ ซักพรม ซักม่าน และที่นอนครบวงจร พร้อมบริการถึงบ้านและคอนโดในเขตกรุงเทพและปริมณฑล",
        }
    };
    
    const selectedMeta = metadataTranslations[lang];

    return {
        title: selectedMeta.title,
        description: selectedMeta.description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en-US': `${SITE_URL}/en`,
                'th-TH': `${SITE_URL}/th`,
            },
        },
    };
}


async function getRecentPosts(): Promise<Post[]> {
    const postsCol = query(
        collection(db, 'posts'),
        orderBy('date', 'desc')
    );
    const postSnapshot = await getDocs(postsCol);
    // Filter for published posts in code
    const postList = postSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Post))
        .filter(post => post.status === 'published')
        .slice(0, 3);
    return postList;
}

async function getHomePageData(): Promise<HomePageData> {
    const docRef = doc(db, "pages", "home");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as HomePageData;
    } else {
        // Return default data if document doesn't exist
        return {
            heroImageUrl: "https://placehold.co/1920x1080.png",
            beforeImageUrl: "https://placehold.co/600x400.png",
            afterImageUrl: "https://placehold.co/600x400.png"
        };
    }
}

async function getContactSettings(): Promise<ContactSettings> {
    const docRef = doc(db, "settings", "contact");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as ContactSettings;
    } else {
        // Return default data if document doesn't exist
        return {
            phone: "0812345678",
            facebookUrl: "https://www.facebook.com/your-page",
            lineUrl: "https://line.me/ti/p/~yourlineid"
        };
    }
}


export default async function Home({ params: { lang } }: Props) {
  const blogPosts = await getRecentPosts();
  const homePageData = await getHomePageData();
  const contactSettings = await getContactSettings();
  const dict = await getDictionary(lang);
  
  const faqData = dict.faqData;
  const whyUsData = dict.whyUsData;
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SofaClean Pro",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": `+${contactSettings.phone.replace(/^0/, '66-')}`,
        "contactType": "Customer Service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Sukhumvit Road",
      "addressLocality": "Bangkok",
      "postalCode": "10110",
      "addressCountry": "TH"
    },
    "description": "บริการซักโซฟา ซักเบาะรถยนต์ ซักพรม ซักม่าน และที่นอนครบวงจร พร้อมบริการถึงบ้านและคอนโดในเขตกรุงเทพและปริมณฑล",
    "sameAs": [ contactSettings.facebookUrl, contactSettings.lineUrl ]
  };

  const faqPageSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
      }))
  };

  return (
    <>
      <JsonLD data={organizationSchema} />
      <JsonLD data={faqPageSchema} />
      
      <div className="bg-background">
        <header 
          className="text-white shadow-lg relative bg-cover bg-center bg-fixed" 
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${homePageData.heroImageUrl}')` }}
          data-ai-hint="living room sofa"
        >
          <div className="container mx-auto px-6 py-20 md:py-32 text-center">
            <Reveal>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{dict.hero.title}</h1>
            </Reveal>
            <Reveal delay="200ms">
              <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">{dict.hero.subtitle}</p>
            </Reveal>
            <Reveal delay="400ms">
              <Button asChild size="lg" className="text-xl h-14 px-10 rounded-full font-bold transition-transform duration-300 hover:scale-105 bg-emerald-500 hover:bg-emerald-600">
                <Link href={`/${lang}/#services`}>{dict.hero.cta}</Link>
              </Button>
            </Reveal>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16 space-y-20">
          <section id="why-us" className="text-center">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-12">{dict.whyUs.title}</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8">
              {whyUsData.map((item, index) => (
                <Reveal key={index} delay={`${index * 200}ms`}>
                  <Card className="p-8 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                    <CardHeader className="p-0 items-center">
                      <div className="bg-emerald-100 text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        {item.icon === 'Sparkles' && <Sparkles className="h-8 w-8" />}
                        {item.icon === 'ShieldCheck' && <ShieldCheck className="h-8 w-8" />}
                        {item.icon === 'MapPin' && <MapPin className="h-8 w-8" />}
                      </div>
                      <CardTitle className="text-xl font-bold mb-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="before-after">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{dict.beforeAfter.title}</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              <Reveal>
                <Card className="rounded-lg shadow-lg overflow-hidden">
                  <Image src={homePageData.beforeImageUrl} alt={dict.beforeAfter.before.alt} width={600} height={400} className="w-full h-80 object-cover" data-ai-hint="dirty sofa"/>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-red-600 text-center">{dict.beforeAfter.before.label}</h3>
                    <p className="text-gray-600 text-center mt-2">{dict.beforeAfter.before.desc}</p>
                  </div>
                </Card>
              </Reveal>
              <Reveal delay="200ms">
                <Card className="rounded-lg shadow-lg overflow-hidden">
                  <Image src={homePageData.afterImageUrl} alt={dict.beforeAfter.after.alt} width={600} height={400} className="w-full h-80 object-cover" data-ai-hint="clean sofa"/>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-green-600 text-center">{dict.beforeAfter.after.label}</h3>
                    <p className="text-gray-600 text-center mt-2">{dict.beforeAfter.after.desc}</p>
                  </div>
                </Card>
              </Reveal>
            </div>
          </section>

          <section id="blog">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{dict.blog.title}</h2>
            </Reveal>
             {blogPosts.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => {
                    const postUrl = `/${lang}/blog/${encodeURIComponent(post.slug)}`;
                    return (
                    <Reveal key={post.id} delay={`${index * 200}ms`}>
                    <Card className="rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col group">
                        <Link href={postUrl} className="block">
                        <div className="overflow-hidden">
                            <Image className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={post.image} alt={post.title} width={600} height={338} data-ai-hint={post.imageHint} />
                        </div>
                        </Link>
                        <CardContent className="p-6 flex flex-col flex-grow">
                        <p className="text-sm text-emerald-600 font-semibold mb-2">{post.category}</p>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-emerald-700 transition-colors">
                            <Link href={postUrl}>{post.title}</Link>
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">{post.description}</p>
                        <Link href={postUrl} className="font-semibold text-emerald-600 hover:text-emerald-700 self-start">
                            {dict.blog.readMore}
                        </Link>
                        </CardContent>
                    </Card>
                    </Reveal>
                )})}
                </div>
             ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No recent articles.</p>
                </div>
             )}
            <div className="text-center mt-12">
                  <Button asChild size="lg" variant="outline">
                      <Link href={`/${lang}/blog`}>
                          <Newspaper className="mr-2" /> {dict.blog.viewAll}
                      </Link>
                  </Button>
              </div>
          </section>

          <section id="services" className="py-16 bg-gray-50/50 -mx-6 px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{dict.priceTable.title}</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <Reveal>
                      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                          <h3 className="text-2xl font-bold text-center">{dict.priceTable.car.title}</h3>
                          <p className="text-center text-gray-500 mb-4">{dict.priceTable.car.subtitle}</p>
                          <p className="text-center text-gray-600 my-4">{dict.priceTable.pricePrefix}</p>
                          <p className="text-5xl font-bold text-center mb-6">฿990</p>
                          <ul className="space-y-3 text-gray-600 mb-6 flex-grow">
                              {dict.priceTable.car.features.map((feature, i) => (
                                  <li key={i} className="flex items-center"><Check className="text-green-500 mr-2" /> {feature}</li>
                              ))}
                          </ul>
                          <EstimateDialog>
                             <Button className="mt-auto w-full" variant="outline">{dict.priceTable.cta}</Button>
                          </EstimateDialog>
                      </div>
                  </Reveal>
                  <Reveal delay="200ms">
                      <div className="bg-emerald-600 text-white p-8 rounded-xl shadow-2xl border-2 border-emerald-600 transform md:scale-105 flex flex-col h-full">
                          <span className="block bg-yellow-400 text-emerald-900 text-sm font-bold tracking-widest uppercase rounded-full px-4 py-1 mb-4 text-center mx-auto max-w-max">{dict.priceTable.popular}</span>
                          <h3 className="text-2xl font-bold text-center">{dict.priceTable.sofa.title}</h3>
                          <p className="text-center text-emerald-200 mb-4">{dict.priceTable.sofa.subtitle}</p>
                          <p className="text-center text-emerald-100 my-4">{dict.priceTable.pricePrefix}</p>
                          <p className="text-5xl font-bold text-center mb-6">฿1,290</p>
                          <ul className="space-y-3 text-emerald-100 mb-6 flex-grow">
                            {dict.priceTable.sofa.features.map((feature, i) => (
                                  <li key={i} className="flex items-center"><Check className="text-yellow-400 mr-2" /> {feature}</li>
                              ))}
                          </ul>
                           <EstimateDialog>
                               <Button className="mt-auto w-full bg-white hover:bg-gray-100 text-emerald-600 font-bold">{dict.priceTable.cta}</Button>
                           </EstimateDialog>
                      </div>
                  </Reveal>
                  <Reveal delay="400ms">
                      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                          <h3 className="text-2xl font-bold text-center">{dict.priceTable.other.title}</h3>
                          <p className="text-center text-gray-500 mb-4">{dict.priceTable.other.subtitle}</p>
                          <p className="text-center text-gray-600 my-4">{dict.priceTable.other.pricePrefix}</p>
                          <p className="text-3xl font-bold text-center mb-6 text-emerald-600">{dict.priceTable.other.price}</p>
                          <ul className="space-y-3 text-gray-600 mb-6 flex-grow">
                              {dict.priceTable.other.features.map((feature, i) => (
                                  <li key={i} className="flex items-center"><Check className="text-green-500 mr-2" /> {feature}</li>
                              ))}
                          </ul>
                          <EstimateDialog>
                             <Button className="mt-auto w-full" variant="outline">{dict.priceTable.cta}</Button>
                          </EstimateDialog>
                      </div>
                  </Reveal>
              </div>
          </section>

          <section id="faq">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{dict.faq.title}</h2>
              </Reveal>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqData.map((faq, index) => (
                    <Reveal key={index} delay={`${index * 100}ms`}>
                      <AccordionItem value={`item-${index}`} className="bg-white p-2 rounded-xl shadow-md border-b-0">
                        <AccordionTrigger className="text-lg font-bold text-left px-4 hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="px-4 text-base text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </Reveal>
                  ))}
                </Accordion>
              </div>
          </section>

          <Reveal>
              <section id="booking" className="bg-gray-800 text-white p-8 md:p-12 rounded-xl shadow-xl">
                  <div className="text-center">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">{dict.booking.title}</h2>
                      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">{dict.booking.description}</p>
                      <Button asChild size="lg" className="text-xl h-14 px-10 rounded-full font-bold transition-transform duration-300 hover:scale-105 bg-emerald-500 hover:bg-emerald-600">
                        <a href={`tel:${contactSettings.phone}`}><Phone className="mr-2" /> {dict.booking.cta.replace('081-234-5678', contactSettings.phone)}</a>
                      </Button>
                  </div>
              </section>
          </Reveal>
        </main>
        
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-6 py-8 text-center">
              <p>&copy; 2024 SofaClean Pro. All Rights Reserved.</p>
              <p className="text-sm text-gray-400 mt-1">{dict.footer.tagline}</p>
          </div>
        </footer>
      </div>
    </>
  );
}
