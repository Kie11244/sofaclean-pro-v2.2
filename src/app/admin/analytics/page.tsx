
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, query, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Newspaper, Loader2, ArrowLeft } from 'lucide-react';
import { subDays, format, startOfDay } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Quote {
    id: string;
    createdAt: Timestamp;
}

interface Post {
    id: string;
}

interface ChartData {
    name: string;
    quotes: number;
}

export default function AnalyticsPage() {
    const [quoteCount, setQuoteCount] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7'); // Default to 7 days
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchStaticData = async () => {
             try {
                // Fetch total quotes and posts (only once)
                const quotesSnapshot = await getDocs(collection(db, 'quotes'));
                const postsSnapshot = await getDocs(collection(db, 'posts'));
                setQuoteCount(quotesSnapshot.size);
                setPostCount(postsSnapshot.size);
            } catch (error) {
                console.error("Error fetching static analytics data: ", error);
            }
        };
        fetchStaticData();
    }, []);
    
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const days = parseInt(timeRange);
                const startDate = startOfDay(subDays(new Date(), days - 1));
                
                const q = query(collection(db, 'quotes'), where('createdAt', '>=', startDate));
                const recentQuotesSnapshot = await getDocs(q);
                const recentQuotes = recentQuotesSnapshot.docs.map(doc => doc.data() as { createdAt: Timestamp });

                // Process data for the chart
                const data: ChartData[] = [];
                for (let i = days - 1; i >= 0; i--) {
                    const date = subDays(new Date(), i);
                    data.push({
                        name: format(date, 'dd/MM'),
                        quotes: 0,
                    });
                }
                
                recentQuotes.forEach(quote => {
                    if (quote.createdAt) {
                        const dateStr = format(quote.createdAt.toDate(), 'dd/MM');
                        const dayData = data.find(d => d.name === dateStr);
                        if (dayData) {
                            dayData.quotes += 1;
                        }
                    }
                });

                setChartData(data);
            } catch (error) {
                console.error("Error fetching chart data: ", error);
            } finally {
                setLoading(false);
                if (initialLoad) setInitialLoad(false);
            }
        };

        fetchChartData();
    }, [timeRange, initialLoad]);

    if (initialLoad) {
        return (
             <div className="flex justify-center items-center h-screen">
                 <Loader2 className="mr-2 h-16 w-16 animate-spin" />
                 <span className="text-xl">กำลังโหลดข้อมูล...</span>
            </div>
        );
    }

    const hasDataForChart = chartData.some(d => d.quotes > 0);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-muted-foreground">ภาพรวมสถิติของเว็บไซต์คุณ</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับไปหน้า Dashboard
                        </Link>
                    </Button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ใบเสนอราคาทั้งหมด</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{quoteCount}</div>
                            <p className="text-xs text-muted-foreground">จำนวนใบเสนอราคาที่ส่งเข้ามาทั้งหมด</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">บทความทั้งหมด</CardTitle>
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{postCount}</div>
                            <p className="text-xs text-muted-foreground">จำนวนบทความในบล็อกทั้งหมด</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>สรุปใบเสนอราคา</CardTitle>
                                <CardDescription>กราฟแสดงจำนวนใบเสนอราคาที่ส่งเข้ามาในแต่ละวัน</CardDescription>
                            </div>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="เลือกระยะเวลา" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 วันล่าสุด</SelectItem>
                                    <SelectItem value="30">30 วันล่าสุด</SelectItem>
                                    <SelectItem value="90">90 วันล่าสุด</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="relative h-[350px]">
                         {loading && (
                            <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-b-lg">
                                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                            </div>
                        )}
                        {!loading && !hasDataForChart ? (
                             <div className="flex h-full w-full items-center justify-center">
                                <p className="text-muted-foreground">ไม่มีข้อมูลใบเสนอราคาในช่วงเวลานี้</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                    <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #ccc',
                                            borderRadius: '0.5rem',
                                        }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="quotes" fill="hsl(var(--primary))" name="ใบเสนอราคา" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
