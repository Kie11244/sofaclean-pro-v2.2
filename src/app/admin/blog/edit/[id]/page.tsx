
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";


interface PostData {
    title: string;
    slug: string;
    image: string;
    imageHint: string;
    category: string;
    description: string;
    content: string;
    status: 'published' | 'draft';
    metaTitle?: string;
    metaDescription?: string;
}

export default function EditBlogPostPage() {
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();

    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                const docRef = doc(db, "posts", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost(docSnap.data() as PostData);
                } else {
                    toast({
                        variant: "destructive",
                        title: "ไม่พบบทความ",
                        description: "ไม่พบข้อมูลสำหรับบทความนี้",
                    });
                    router.push("/admin/blog");
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
                 toast({
                    variant: "destructive",
                    title: "เกิดข้อผิดพลาด",
                    description: "ไม่สามารถโหลดข้อมูลได้",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPost(prev => prev ? { ...prev, [name]: value } : null);
    };

     const handleStatusChange = (checked: boolean) => {
        const newStatus = checked ? 'published' : 'draft';
        setPost(prev => prev ? { ...prev, status: newStatus } : null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!post || !post.title || !post.slug || !post.content) {
            toast({
                variant: "destructive",
                title: "ข้อมูลไม่ครบถ้วน",
                description: "กรุณากรอกข้อมูลให้ครบถ้วน",
            });
            return;
        }
        setSaving(true);
        try {
            const docRef = doc(db, "posts", id as string);
            await setDoc(docRef, post, { merge: true });
            toast({
                title: "บันทึกสำเร็จ",
                description: "บทความของคุณได้รับการอัปเดตแล้ว",
            });
            router.push("/admin/blog");
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกบทความได้",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-24 w-full" /></div>
                            <div className="flex justify-end gap-4">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    
    if (!post) {
        return null; // or a not found component
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>แก้ไขบทความ</CardTitle>
                        <CardDescription>อัปเดตรายละเอียดด้านล่างสำหรับบทความของคุณ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Switch id="status" checked={post.status === 'published'} onCheckedChange={handleStatusChange} />
                                <Label htmlFor="status">{post.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">หัวข้อเรื่อง *</Label>
                                <Input id="title" name="title" value={post.title} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (สำหรับ URL) *</Label>
                                <Input id="slug" name="slug" value={post.slug} onChange={handleInputChange} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="category">หมวดหมู่ *</Label>
                                <Input id="category" name="category" value={post.category} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">คำอธิบายสั้นๆ *</Label>
                                <Textarea id="description" name="description" value={post.description} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">เนื้อหาบทความ (HTML) *</Label>
                                <Textarea id="content" name="content" value={post.content} onChange={handleInputChange} rows={15} required />
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
                                <Input id="image" name="image" value={post.image} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="imageHint">คำใบ้รูปภาพ (สำหรับ AI)</Label>
                                <Input id="imageHint" name="imageHint" value={post.imageHint} onChange={handleInputChange} />
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
                                                name="metaTitle" 
                                                value={post.metaTitle || ""} 
                                                onChange={handleInputChange} 
                                                placeholder="หัวข้อที่จะแสดงบน Google (ถ้าเว้นว่างจะใช้หัวข้อเรื่อง)"
                                            />
                                            <p className="text-sm text-muted-foreground">แนะนำความยาวไม่เกิน 60 ตัวอักษร</p>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="metaDescription">Meta Description</Label>
                                            <Textarea 
                                                id="metaDescription" 
                                                name="metaDescription" 
                                                value={post.metaDescription || ""} 
                                                onChange={handleInputChange} 
                                                placeholder="คำอธิบายสั้นๆ สำหรับแสดงผลบน Google (ถ้าเว้นว่างจะใช้คำอธิบายสั้นๆ ด้านบน)"
                                            />
                                             <p className="text-sm text-muted-foreground">แนะนำความยาวไม่เกิน 160 ตัวอักษร</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => router.push('/admin/blog')}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
