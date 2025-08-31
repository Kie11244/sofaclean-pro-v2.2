
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Newspaper, HardDriveUpload, FileText, BarChart3, Home, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        จัดการหน้าแรก
                    </CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        แก้ไขรูปภาพปกและรูปภาพ Before/After
                    </p>
                    <Button asChild>
                        <Link href="/admin/homepage">ไปยังหน้าจัดการหน้าแรก</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Analytics
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        ดูสถิติและข้อมูลเชิงลึกของเว็บไซต์
                    </p>
                    <Button asChild>
                        <Link href="/admin/analytics">ไปยังหน้า Analytics</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        จัดการใบเสนอราคา
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        ดูและจัดการคำขอใบเสนอราคาจากลูกค้า
                    </p>
                    <Button asChild>
                        <Link href="/admin/quotes">ไปยังหน้ารายการใบเสนอราคา</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        จัดการบทความ
                    </CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        เพิ่ม, แก้ไข, หรือลบบทความในบล็อก
                    </p>
                    <Button asChild>
                        <Link href="/admin/blog">ไปยังหน้าจัดการบทความ</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        ตั้งค่าข้อมูลติดต่อ
                    </CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        แก้ไขเบอร์โทร, Facebook, และ Line
                    </p>
                    <Button asChild>
                        <Link href="/admin/settings/contact">ไปยังหน้าตั้งค่า</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        ย้ายข้อมูลเก่า
                    </CardTitle>
                    <HardDriveUpload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        นำเข้าบทความเก่า 3 ชิ้นจากโค้ด (ทำครั้งเดียว)
                    </p>
                    <Button asChild variant="secondary">
                        <Link href="/admin/migrate">ไปยังหน้าย้ายข้อมูล</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
