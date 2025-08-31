
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal } from '@/components/reveal';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, DocumentData } from 'firebase/firestore';
import { getDictionary } from '@/lib/dictionaries';

type Props = {
  params: { lang: 'en' | 'th' };
};

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://psychic-glider-453312-k0.firebaseapp.com';

export async function generateMetadata({ params: { lang } }: Props): Promise<Metadata> {
    const dict = await getDictionary(lang);
    const canonicalUrl = `${SITE_URL}/${lang}/blog`;

    return {
        title: dict.blogIndex.title,
        description: dict.blogIndex.description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en-US': `${SITE_URL}/en/blog`,
                'th-TH': `${SITE_URL}/th/blog`,
            },
        },
    };
}


// This tells Next.js to re-fetch the data on every request, ensuring new posts appear.
export const dynamic = 'force-dynamic';

async function getPosts(): Promise<Post[]> {
    const postsCol = query(
        collection(db, 'posts'),
        orderBy('date', 'desc')
    );
    const postSnapshot = await getDocs(postsCol);
    // Filter for published posts in code
    const postList = postSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Post))
        .filter(post => post.status === 'published');
    return postList;
}

export default async function BlogIndexPage({ params: { lang } }: Props) {
  const posts = await getPosts();
  const dict = await getDictionary(lang);

  return (
    <div className="bg-gray-50/50">
        <header className="bg-white shadow-sm pt-20">
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{dict.blogIndex.header}</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    {dict.blogIndex.subheader}
                </p>
            </div>
        </header>

        <main className="container mx-auto px-6 py-16">
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => {
                        const postUrl = `/${lang}/blog/${encodeURIComponent(post.slug)}`;
                        return (
                        <Reveal key={post.id} delay={`${index * 100}ms`}>
                            <Card className="rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col group">
                                <Link href={postUrl} className="block">
                                    <div className="overflow-hidden">
                                        <Image
                                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                            src={post.image}
                                            alt={post.title}
                                            width={600}
                                            height={320}
                                            data-ai-hint={post.imageHint}
                                            priority={index === 0}
                                        />
                                    </div>
                                </Link>
                                <CardContent className="p-6 flex flex-col flex-grow">
                                    <p className="text-sm text-emerald-600 font-semibold mb-2">{post.category}</p>
                                    <h2 className="font-bold text-xl mb-3 flex-grow">
                                        <Link href={postUrl} className="hover:text-emerald-700 transition-colors">{post.title}</Link>
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                                    <div>
                                        <Button asChild variant="link" className="p-0 h-auto font-semibold text-emerald-600 hover:text-emerald-700">
                                            <Link href={postUrl}>
                                                {dict.blog.readMore} &rarr;
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Reveal>
                    )})}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-2xl text-muted-foreground">ยังไม่มีบทความ</p>
                    <p className="mt-4">ลองเพิ่มบทความแรกของคุณในระบบหลังบ้าน</p>
                    <Button asChild className="mt-6">
                        <Link href="/admin/blog">ไปที่ระบบจัดการ</Link>
                    </Button>
                </div>
            )}
        </main>
         <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-8 text-center">
                <p>&copy; 2024 SofaClean Pro. All Rights Reserved.</p>
                <p className="text-sm text-gray-400 mt-1">{dict.footer.tagline}</p>
            </div>
      </footer>
    </div>
  );
}
