export const dynamic = "force-dynamic";

import React from "react";
import { getPerformanceById } from "@/lib/performance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, ClockIcon, UserIcon } from "lucide-react";
import { DailyPerformances, Performance } from "@/types/enrollment";

// 기존 데이터 구조와 enrollment.ts의 타입을 연결하기 위한 인터페이스
interface PerformanceData {
  title: string;
  category: string;
  bookingStartDate: string;
  address: string;
  detailAddress: string;
  postCode: string;
  poster: {
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
  };
  performances: DailyPerformances;
  content: {
    type: string;
  };
  sellerId: string;
  sellerTeam: string;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  account?: string;
}

export default async function PerformanceDemo({
  params,
}: {
  params: { performId: string };
}) {
  const { performId } = params;
  const performanceData = (await getPerformanceById(
    performId
  )) as PerformanceData | null;

  if (!performanceData) {
    return <p>공연 정보를 찾을 수 없습니다</p>;
  }

  console.log(performanceData);

  // 공연 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 공연 시간 목록 생성
  const performanceDates = Object.keys(performanceData.performances);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2">{performanceData.category}</Badge>
              <CardTitle className="text-2xl md:text-3xl">
                {performanceData.title}
              </CardTitle>
              <CardDescription className="mt-2">
                <span className="flex items-center gap-1">
                  <UserIcon size={16} />
                  {performanceData.sellerTeam}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                <img
                  src={performanceData.poster.url}
                  alt={performanceData.title}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">공연 정보</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <CalendarIcon size={18} />
                    <span>
                      예매 시작일:{" "}
                      {formatDate(performanceData.bookingStartDate)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPinIcon size={18} />
                    <span>
                      {performanceData.address} {performanceData.detailAddress}{" "}
                      (우편번호: {performanceData.postCode})
                    </span>
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">공연 일정</h3>
                <Tabs defaultValue={performanceDates[0]}>
                  <TabsList className="mb-4">
                    {performanceDates.map((date) => (
                      <TabsTrigger key={date} value={date}>
                        {formatDate(date)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {performanceDates.map((date) => (
                    <TabsContent key={date} value={date}>
                      <div className="space-y-2">
                        {performanceData.performances[date].map(
                          (performance: Performance, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between border p-3 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <ClockIcon size={16} />
                                <span>{performance.time}</span>
                                {performance.casting &&
                                  performance.casting.length > 0 && (
                                    <div className="ml-4">
                                      <span className="font-medium">
                                        출연진:
                                      </span>
                                      <span className="ml-1">
                                        {performance.casting.join(", ")}
                                      </span>
                                    </div>
                                  )}
                              </div>
                              <Button variant="outline">예매하기</Button>
                            </div>
                          )
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <h3 className="text-lg font-semibold mb-2">공연 상세 정보</h3>
          <div className="prose max-w-none w-full">
            {/* 실제로는 content를 파싱해서 표시해야 하지만, 여기서는 간단히 표시 */}
            <p>공연 상세 정보는 content 객체에서 파싱하여 표시해야 합니다.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
