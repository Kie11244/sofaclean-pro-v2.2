
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PostStatus = 'published' | 'draft';

export default function NewBlogPostPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<PostStatus>('draft');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !slug || !content || !description || !category) {
            toast({
                variant: "destructive",
                title: "ข้อมูลไม่ครบถ้วน",
                description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
            });
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "posts"), {
                title,
                slug,
                image: image || "https://placehold.co/800x400.png",
                imageHint,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                category,
                description,
                content,
                status,
                metaTitle: metaTitle || "",
                metaDescription: metaDescription || "",
            });
            toast({
                title: "สร้างบทความสำเร็จ",
                description: "บทความของคุณถูกบันทึกเรียบร้อยแล้ว",
            });
            router.push("/admin/blog");
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถสร้างบทความได้",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Auto-generate slug from title for Thai language
        const newSlug = newTitle.toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, '') // Remove special chars but keep Thai, a-z, 0-9, and -
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        setSlug(newSlug);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>สร้างบทความใหม่</CardTitle>
                        <CardDescription>กรอกรายละเอียดด้านล่างเพื่อสร้างบทความใหม่ในบล็อกของคุณ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                             <div className="space-y-2">
                                <Label>สถานะ</Label>
                                <RadioGroup defaultValue="draft" onValueChange={(value: PostStatus) => setStatus(value)} className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="draft" id="draft" />
                                        <Label htmlFor="draft">ฉบับร่าง</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="published" id="published" />
                                        <Label htmlFor="published">เผยแพร่</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">หัวข้อเรื่อง *</Label>
                                <Input id="title" value={title} onChange={handleTitleChange} placeholder="หัวข้อของบทความ" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (สำหรับ URL) *</Label>
                                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="จะถูกสร้างอัตโนมัติจากหัวข้อเรื่อง" required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="category">หมวดหมู่ *</Label>
                                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น เคล็ดลับทำความสะอาด" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">คำอธิบายสั้นๆ *</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="คำอธิบายสั้นๆ ที่จะแสดงในหน้ารวมบทความ" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">เนื้อหาบทความ (HTML) *</Label>
                                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="เนื้อหาของบทความ สามารถใช้แท็ก HTML ได้" rows={15} required/>
                                <div className="text-xs text-muted-foreground bg-gray-100 p-3 rounded-md border">
                                    <p className="font-semibold mb-2">คำแนะนำการใช้แท็ก HTML:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><code>&lt;h2&gt;หัวข้อย่อย&lt;/h2&gt;</code> - สำหรับหัวข้อย่อยหลักในบทความ</li>
                                        <li><code>&lt;h3&gt;หัวข้อย่อยรอง&lt;/h3&gt;</code> - สำหรับหัวข้อย่อยที่อยู่ภายใต้ h2</li>
                                        <li><code>&lt;p&gt;ย่อหน้า...&lt;/p&gt;</code> - สำหรับเนื้อหาแต่ละย่อหน้า</li>
                                        <li><code>&lt;strong&gt;ตัวหนา&lt;/strong&gt;</code> - สำหรับเน้นข้อความสำคัญ</li>
                                        <li><code>&lt;ul&gt;&lt;li&gt;รายการ&lt;/li&gt;&lt;/ul&gt;</code> - สำหรับรายการแบบไม่มีลำดับ (จุด)</li>
                                        <li><code>&lt;ol&gt;&lt;li&gt;รายการ&lt;/li&gt;&lt;/ol&gt;</code> - สำหรับรายการแบบมีลำดับ (ตัวเลข)</li>
                                    </ul>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="image">URL รูปภาพหลัก</Label>
                                <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://placehold.co/800x400.png" />
                                <p className="text-sm text-muted-foreground">หากเว้นว่างไว้ จะใช้รูปภาพ placeholder</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="imageHint">คำใบ้รูปภาพ (สำหรับ AI)</Label>
                                <Input id="imageHint" value={imageHint} onChange={(e) => setImageHint(e.target.value)} placeholder="เช่น sofa living room" />
                            </div>

                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-yellow-500" />
                                            <span className="font-semibold">การตั้งค่า SEO (แนะนำ)</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="metaTitle">Meta Title</Label>
                                            <Input 
                                                id="metaTitle" 
                                                value={metaTitle} 
                                                onChange={(e) => setMetaTitle(e.target.value)} 
                                                placeholder="หัวข้อที่จะแสดงบน Google (ถ้าเว้นว่างจะใช้หัวข้อเรื่อง)"
                                            />
                                            <p className="text-sm text-muted-foreground">แนะนำความยาวไม่เกิน 60 ตัวอักษร</p>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="metaDescription">Meta Description</Label>
                                            <Textarea 
                                                id="metaDescription" 
                                                value={metaDescription} 
                                                onChange={(e) => setMetaDescription(e.target.value)} 
                                                placeholder="คำอธิบายสั้นๆ สำหรับแสดงผลบน Google (ถ้าเว้นว่างจะใช้คำอธิบายสั้นๆ ด้านบน)"
                                            />
                                             <p className="text-sm text-muted-foreground">แนะนำความยาวไม่เกิน 160 ตัวอักษร</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => router.back()}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกบทความ'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
