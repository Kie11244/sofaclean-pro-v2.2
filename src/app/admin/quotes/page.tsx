
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Filter, Trash2 } from "lucide-react";
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { subDays, startOfDay } from 'date-fns';

export interface Quote {
    id: string;
    name: string;
    phone: string;
    address: string;
    description: string;
    images: string[];
    createdAt: Timestamp;
    status: 'new' | 'contacted' | 'completed' | 'cancelled';
}

const statusMap: Record<Quote['status'], { text: string; badgeClass: string; buttonClass: string; }> = {
    new: { text: "ใหม่", badgeClass: "bg-blue-500 hover:bg-blue-500", buttonClass: "bg-blue-500 hover:bg-blue-600 text-white"},
    contacted: { text: "ติดต่อแล้ว", badgeClass: "bg-yellow-500 hover:bg-yellow-500", buttonClass: "bg-yellow-500 hover:bg-yellow-600 text-white"},
    completed: { text: "สำเร็จ", badgeClass: "bg-green-500 hover:bg-green-500", buttonClass: "bg-green-500 hover:bg-green-600 text-white"},
    cancelled: { text: "ยกเลิก", badgeClass: "bg-gray-500 hover:bg-gray-500", buttonClass: "bg-gray-500 hover:bg-gray-600 text-white"},
};

export default function QuotesListPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('7'); // Default to last 7 days
    const [loading, setLoading] = useState(true);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const { toast } = useToast();

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const quotesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
            setQuotes(quotesData);
        } catch (error) {
            console.error("Error fetching quotes: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดข้อมูลใบเสนอราคาได้",
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchQuotes();
    }, []);

    const filteredQuotes = useMemo(() => {
        let dateThreshold: Date | null = null;
        if (dateFilter !== 'all') {
            dateThreshold = startOfDay(subDays(new Date(), parseInt(dateFilter)));
        }

        return quotes.filter(quote => {
            const statusMatch = statusFilter === 'all' || quote.status === statusFilter;
            const dateMatch = !dateThreshold || quote.createdAt.toDate() >= dateThreshold;
            return statusMatch && dateMatch;
        });
    }, [quotes, statusFilter, dateFilter]);

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "quotes", id));
            toast({
                title: "ลบสำเร็จ",
                description: "ใบเสนอราคาถูกลบเรียบร้อยแล้ว",
            });
            fetchQuotes(); // Refresh list after delete
        } catch (error) {
            console.error("Error deleting quote: ", error);
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบใบเสนอราคาได้",
            });
        }
    };

    const handleStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
        try {
            const quoteRef = doc(db, 'quotes', quoteId);
            await updateDoc(quoteRef, { status: newStatus });
            setQuotes(prevQuotes =>
                prevQuotes.map(q => (q.id === quoteId ? { ...q, status: newStatus } : q))
            );
            toast({
                title: "อัปเดตสถานะสำเร็จ",
                description: `สถานะของใบเสนอราคาถูกเปลี่ยนเป็น "${statusMap[newStatus].text}"`,
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
    
    const openGallery = (images: string[], index: number) => {
        setGalleryImages(images);
        setGalleryIndex(index);
        setIsGalleryOpen(true);
    };
    
    const nextImage = () => {
        setGalleryIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setGalleryIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "ไม่มีข้อมูลวันที่";
        return new Date(timestamp.seconds * 1000).toLocaleString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
            hour12: false
        });
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>รายการใบเสนอราคา</CardTitle>
                                    <CardDescription>จัดการคำขอใบเสนอราคาจากลูกค้า</CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                     <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Filter className="h-5 w-5 text-muted-foreground" />
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full md:w-[150px]">
                                                <SelectValue placeholder="กรองตามสถานะ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                                                <SelectItem value="new">ใหม่</SelectItem>
                                                <SelectItem value="contacted">ติดต่อแล้ว</SelectItem>
                                                <SelectItem value="completed">สำเร็จ</SelectItem>
                                                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={dateFilter} onValueChange={setDateFilter}>
                                            <SelectTrigger className="w-full md:w-[150px]">
                                                <SelectValue placeholder="กรองตามวันที่" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                                <SelectItem value="1">วันนี้</SelectItem>
                                                <SelectItem value="7">7 วันล่าสุด</SelectItem>
                                                <SelectItem value="30">30 วันล่าสุด</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="outline" asChild className="w-full md:w-auto">
                                        <Link href="/admin/dashboard">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                                    <span>กำลังโหลดข้อมูล...</span>
                                </div>
                            ) : filteredQuotes.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">ไม่พบใบเสนอราคาตามเงื่อนไขที่เลือก</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredQuotes.map((quote) => (
                                        <Card key={quote.id} className="overflow-hidden shadow-md">
                                            <CardHeader className="bg-gray-100/80 p-4">
                                                 <div className="flex flex-wrap justify-between items-center gap-2">
                                                    <div>
                                                        <CardTitle className="text-lg flex items-center gap-3">
                                                           <span>คุณ {quote.name}</span> 
                                                           <Badge className={statusMap[quote.status]?.badgeClass || ''}>
                                                                {statusMap[quote.status]?.text || quote.status}
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            ส่งเมื่อ: {formatDate(quote.createdAt)}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">ข้อมูลติดต่อ</h4>
                                                    <p><strong className="font-medium">เบอร์โทร:</strong> {quote.phone}</p>
                                                    <p><strong className="font-medium">ที่อยู่:</strong> {quote.address || "ไม่ได้ระบุ"}</p>
                                                    <h4 className="font-semibold mt-4 mb-2">รายละเอียดงาน</h4>
                                                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">{quote.description}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2">รูปภาพที่แนบมา ({quote.images?.length || 0})</h4>
                                                    {quote.images && quote.images.length > 0 ? (
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                            {quote.images.map((imgSrc, index) => (
                                                                <button key={index} onClick={() => openGallery(quote.images, index)} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md">
                                                                    <Image
                                                                        src={imgSrc}
                                                                        alt={`รูปแนบ ${index + 1}`}
                                                                        width={200}
                                                                        height={200}
                                                                        className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity cursor-pointer"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm italic">ไม่มีรูปภาพแนบ</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="bg-gray-100/80 p-3 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                     <span className="text-sm font-medium mr-2">เปลี่ยนสถานะ:</span>
                                                     {(['new', 'contacted', 'completed', 'cancelled'] as const).map((status) => (
                                                        <Button
                                                            key={status}
                                                            size="sm"
                                                            className={cn(
                                                                'transition-all',
                                                                quote.status === status 
                                                                    ? statusMap[status].buttonClass 
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            )}
                                                            onClick={() => handleStatusChange(quote.id, status)}
                                                        >
                                                            {statusMap[status].text}
                                                        </Button>
                                                     ))}
                                                </div>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button variant="destructive" size="sm">
                                                             <Trash2 className="mr-2 h-4 w-4"/>
                                                             ลบใบเสนอราคา
                                                         </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                การกระทำนี้ไม่สามารถย้อนกลับได้ ใบเสนอราคาจะถูกลบออกจากฐานข้อมูลอย่างถาวร
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(quote.id)}>ยืนยันการลบ</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

             <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none flex flex-col items-center justify-center">
                    <DialogHeader className="sr-only">
                        <DialogTitle>รูปภาพขนาดใหญ่</DialogTitle>
                        <DialogDescription>แสดงรูปภาพที่ลูกค้าแนบมาในใบเสนอราคา</DialogDescription>
                    </DialogHeader>
                    {galleryImages.length > 0 && (
                        <div className="relative w-full h-full">
                             <Image
                                src={galleryImages[galleryIndex]}
                                alt={`รูปภาพขนาดใหญ่ ${galleryIndex + 1}`}
                                width={1200}
                                height={800}
                                className="rounded-md object-contain max-h-[85vh] w-full"
                            />
                            {galleryImages.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-black/50 hover:bg-black/70 border-none text-white"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-black/50 hover:bg-black/70 border-none text-white"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm rounded-full px-3 py-1">
                                        {galleryIndex + 1} / {galleryImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
    
