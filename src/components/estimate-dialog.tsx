"use client";

import { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, Paperclip, XCircle, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import imageCompression from 'browser-image-compression';

interface EstimateDialogProps {
    children: React.ReactNode;
}

async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.7,
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Image compression error:', error);
        return file;
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

export function EstimateDialog({ children }: EstimateDialogProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);
    
    const [isOpen, setIsOpen] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();

    const MAX_IMAGES = 3;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (images.length + newFiles.length > MAX_IMAGES) {
                toast({
                    variant: "destructive",
                    title: `จำกัด ${MAX_IMAGES} รูปภาพ`,
                    description: `คุณสามารถแนบรูปภาพได้สูงสุด ${MAX_IMAGES} รูป`,
                });
                return;
            }
            setImages(prev => [...prev, ...newFiles]);
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "ไม่รองรับ Geolocation",
                description: "เบราว์เซอร์ของคุณไม่รองรับการใช้งานนี้",
            });
            return;
        }

        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=th`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        setAddress(data.display_name);
                    } else {
                         throw new Error("Could not fetch address");
                    }
                } catch (error) {
                     toast({
                        variant: "destructive",
                        title: "ไม่สามารถดึงที่อยู่ได้",
                        description: "กรุณาลองอีกครั้งหรือพิมพ์ด้วยตนเอง",
                    });
                    setAddress(`Lat: ${latitude}, Lon: ${longitude}`);
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (error) => {
                toast({
                    variant: "destructive",
                    title: "ไม่สามารถเข้าถึงตำแหน่งได้",
                    description: "กรุณาอนุญาตการเข้าถึงตำแหน่งในเบราว์เซอร์ของคุณ",
                });
                setIsFetchingLocation(false);
            }
        );
    };


    const handleFormSubmit = async () => {
        if (!name.trim() || !phone.trim() || !description.trim()) {
            toast({
                variant: "destructive",
                title: "ข้อมูลไม่ครบถ้วน",
                description: "กรุณากรอกชื่อ, เบอร์โทรศัพท์, และรายละเอียดงาน",
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const imageUrls: string[] = [];

            if (images.length > 0) {
                const compressedImages = await Promise.all(images.map(compressImage));
                const base64Images = await Promise.all(compressedImages.map(fileToBase64));
                imageUrls.push(...base64Images);
            }

            await addDoc(collection(db, "quotes"), {
                name,
                phone,
                address,
                description,
                images: imageUrls,
                createdAt: serverTimestamp(),
                status: "new",
            });
            
            toast({
                title: "ส่งข้อมูลสำเร็จ",
                description: "เราได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด",
            });

            handleOpenChange(false);

        } catch (error: any) {
             console.error("Error submitting quote:", error);
             toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาดในการส่งข้อมูล",
                description: `ไม่สามารถส่งข้อมูลได้: ${error.message}`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetDialog = () => {
        setName("");
        setPhone("");
        setAddress("");
        setDescription("");
        setImages([]);
        setIsFetchingLocation(false);
        setIsSubmitting(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
           setTimeout(() => {
                resetDialog();
           }, 300);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        ขอใบเสนอราคา
                    </DialogTitle>
                    <DialogDescription>
                        กรุณากรอกข้อมูลด้านล่างให้ครบถ้วน เราจะติดต่อกลับเพื่อประเมินราคาให้คุณโดยเร็วที่สุด
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมชาย ใจดี" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เช่น 0812345678" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="address">ที่อยู่สำหรับเข้ารับบริการ (ถ้ามี)</Label>
                        <Textarea 
                            id="address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder={isFetchingLocation ? "กำลังดึงตำแหน่งปัจจุบัน..." : "กรอกที่อยู่ หรือใช้ปุ่มด้านล่าง"} 
                            rows={2}
                            disabled={isFetchingLocation}
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <Button variant="default" onClick={handleFetchLocation} disabled={isFetchingLocation}>
                                {isFetchingLocation ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <MapPin className="mr-2 h-4 w-4" />
                                )}
                                 ค้นหาตำแหน่งอัตโนมัติ
                             </Button>
                              <Button variant="outline" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=ค้นหาและคัดลอกที่อยู่ของคุณที่นี่', '_blank')}>
                                 <Search className="mr-2 h-4 w-4" />
                                 ค้นหาจาก Google Maps
                             </Button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">รายละเอียดงาน <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="เช่น โซฟาผ้า 3 ที่นั่ง มีรอยคราบกาแฟและฝุ่นสะสม"
                            rows={3}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="images">แนบรูปภาพ (สูงสุด {MAX_IMAGES} รูป)</Label>
                         <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    เลือกรูปภาพ
                                </label>
                            </Button>
                            <Input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            <span className="text-xs text-muted-foreground">{images.length} รูปที่เลือก</span>
                         </div>
                         <div className="mt-2 grid grid-cols-3 gap-2">
                            {images.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`preview ${index}`} 
                                        className="h-24 w-full object-cover rounded-md" 
                                    />
                                    <Button 
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>ยกเลิก</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleFormSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังส่งข้อมูล...</> : 'ส่งข้อมูลเพื่อขอใบเสนอราคา'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
