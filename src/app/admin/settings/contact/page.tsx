
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

interface ContactSettings {
    phone: string;
    facebookUrl: string;
    lineUrl: string;
}

export default function EditContactSettingsPage() {
    const [data, setData] = useState<ContactSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, "settings", "contact");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setData(docSnap.data() as ContactSettings);
                } else {
                    // Initialize with default values if not exists
                    setData({
                        phone: "0812345678",
                        facebookUrl: "https://www.facebook.com/your-page",
                        lineUrl: "https://line.me/ti/p/~yourlineid"
                    });
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
                 toast({
                    variant: "destructive",
                    title: "เกิดข้อผิดพลาด",
                    description: "ไม่สามารถโหลดข้อมูลการติดต่อได้",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data || !data.phone || !data.facebookUrl || !data.lineUrl) {
            toast({
                variant: "destructive",
                title: "ข้อมูลไม่ครบถ้วน",
                description: "กรุณากรอกข้อมูลให้ครบถ้วน",
            });
            return;
        }
        setSaving(true);
        try {
            const docRef = doc(db, "settings", "contact");
            await setDoc(docRef, data, { merge: true });
            toast({
                title: "บันทึกสำเร็จ",
                description: "ข้อมูลการติดต่อได้รับการอัปเดตแล้ว",
            });
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้",
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
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
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
    
    if (!data) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-end mb-4">
                    <Button variant="outline" asChild>
                        <Link href="/admin/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับไปหน้า Dashboard
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>ตั้งค่าข้อมูลติดต่อ</CardTitle>
                        <CardDescription>อัปเดตข้อมูลช่องทางการติดต่อที่จะแสดงผลบนหน้าเว็บไซต์</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                <Input id="phone" name="phone" value={data.phone} onChange={handleInputChange} placeholder="0812345678" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebookUrl">Facebook URL</Label>
                                <Input id="facebookUrl" name="facebookUrl" value={data.facebookUrl} onChange={handleInputChange} placeholder="https://www.facebook.com/your-page" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="lineUrl">Line URL</Label>
                                <Input id="lineUrl" name="lineUrl" value={data.lineUrl} onChange={handleInputChange} placeholder="https://line.me/ti/p/~yourlineid" />
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button variant="outline" type="button" onClick={() => router.push('/admin/dashboard')}>
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
