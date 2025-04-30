"use client";

import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

import axios from "axios";

export default function TicketScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [scanResult, setScanResult] = useState<null | boolean>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const prevReservationId = useRef("");
  const verifyLoadingRef = useRef(false); // 실시간 상태 추적용 ref
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 저장용 ref

  function handleReset() {
    setScanResult(null);
    setVerifyLoading(false);
    verifyLoadingRef.current = false;
    scannerRef.current?.stop();
    scannerRef.current?.start();
  }

  async function handleToggleLight() {
    const scanner = scannerRef.current;
    if (!scanner) return;

    const hasFlash = await scanner.hasFlash();
    if (hasFlash) {
      // 플래시 상태를 확인하여 토글
      if (isFlashOn) {
        scanner.turnFlashOff();
        setIsFlashOn(false);
      } else {
        {
          scanner.turnFlashOn();
          setIsFlashOn(true);
        }
      }
    } else {
      alert("이 기기는 플래시를 지원하지 않습니다.");
    }
  }

  useEffect(() => {
    async function verifyTicket(reservationId: string): Promise<boolean> {
      setVerifyLoading(true);
      try {
        prevReservationId.current = reservationId;
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }
        // 새 타이머 등록 (10초 후 초기화)
        resetTimerRef.current = setTimeout(() => {
          prevReservationId.current = "";
          resetTimerRef.current = null;
        }, 10000); // 10초

        const response = await axios.post(
          `/api/manager/verify-ticket/${reservationId}`
        );
        return response.data.data.valid;
      } catch (error) {
        console.error("API 요청 실패:", error);
        return false;
      } finally {
        setVerifyLoading(false);
      }
    }

    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          if (verifyLoadingRef.current === true) {
            return;
          }
          verifyLoadingRef.current = true;
          try {
            const scannedCode = result.data;
            if (scannedCode === prevReservationId.current) {
              return;
            }
            const isValid = await verifyTicket(scannedCode);
            setScanResult(isValid);
          } catch (error) {
            console.error("검증 오류:", error);
            setScanResult(false);
          } finally {
            verifyLoadingRef.current = false;
          }
        },
        {
          highlightScanRegion: true,
          maxScansPerSecond: 2,
        }
      );
      scannerRef.current.start();
    }

    return () => {
      scannerRef.current?.stop();
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [prevReservationId]);

  return (
    <main className="flex flex-col items-center justify-center p-6 space-y-6 max-w-xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">🎟️ 티켓 QR 코드 스캔</h2>
          <ul className="flex items-center justify-center w-full gap-2">
            <li>
              <button
                className="cursor-pointer"
                onClick={() => handleToggleLight()}
              >
                <Lightbulb />
              </button>
            </li>
            <li>
              <button className="cursor-pointer" onClick={() => handleReset()}>
                <RotateCcw />
              </button>
            </li>
          </ul>
          <video ref={videoRef} className="w-full rounded-md shadow border" />
          <p className="text-sm text-muted-foreground">
            카메라에 QR 코드를 비춰주세요
          </p>
          {verifyLoading && (
            <Badge variant="secondary" className="flex items-center space-x-2">
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              검증 중...
            </Badge>
          )}
          {scanResult && (
            <Alert variant="default" className="border-green-500">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-600 font-bold">
                검증 성공!
              </AlertTitle>
              <AlertDescription>유효한 티켓입니다.</AlertDescription>
            </Alert>
          )}
          {scanResult === false && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">검증 실패</AlertTitle>
              <AlertDescription>유효하지 않은 티켓입니다.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
