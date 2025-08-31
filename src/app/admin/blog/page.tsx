
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, Edit, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    status: 'published' | 'draft';
}

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "posts"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดข้อมูลบทความได้",
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "posts", id));
            toast({
                title: "ลบสำเร็จ",
                description: "บทความถูกลบเรียบร้อยแล้ว",
            });
            fetchPosts(); // Refresh list after delete
        } catch (error) {
            console.error("Error deleting post: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบบทความได้",
            });
        }
    };
    
    const handleStatusChange = async (postId: string, newStatus: Post['status']) => {
        try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, { status: newStatus });
            setPosts(prevPosts => 
                prevPosts.map(p => p.id === postId ? { ...p, status: newStatus } : p)
            );
            toast({
                title: <div className="flex items-center"><CheckCircle className="mr-2 text-green-500" /> อัปเดตสถานะสำเร็จ</div>,
                description: `บทความถูกเปลี่ยนเป็น "${newStatus === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}"`,
            });
        } catch (error) {
             console.error("Error updating status: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัปเดตสถานะได้",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>จัดการบทความ</CardTitle>
                                <CardDescription>เพิ่ม, แก้ไข, หรือลบบทความในบล็อกของคุณ</CardDescription>
                            </div>
                             <div className="flex items-center gap-4">
                                <Button asChild>
                                    <Link href="/admin/blog/new">สร้างบทความใหม่</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/dashboard">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        กลับไปหน้า Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>กำลังโหลด...</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>หัวข้อ</TableHead>
                                        <TableHead>วันที่</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>เผยแพร่</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell>{post.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'} 
                                                    className={cn(post.status === 'published' ? 'bg-green-500' : 'bg-gray-500', "text-white")}>
                                                    {post.status === 'published' ? <><Eye className="mr-1 h-3 w-3"/> เผยแพร่</> : <><EyeOff className="mr-1 h-3 w-3"/> ฉบับร่าง</>}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                 <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`status-${post.id}`}
                                                        checked={post.status === 'published'}
                                                        onCheckedChange={(checked) => handleStatusChange(post.id, checked ? 'published' : 'draft')}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/blog/edit/${post.id}`}>
                                                        <Edit className="mr-1 h-3 w-3" />
                                                        แก้ไข
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button variant="destructive" size="sm">ลบ</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                การกระทำนี้ไม่สามารถย้อนกลับได้ บทความจะถูกลบออกจากฐานข้อมูลอย่างถาวร
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(post.id)}>ยืนยันการลบ</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                         {posts.length === 0 && !loading && (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">ยังไม่มีบทความ</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
