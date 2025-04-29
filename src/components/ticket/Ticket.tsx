"use client";

import QRCode from "react-qr-code";
import {
  Calendar,
  Clock,
  MapPin,
  Map,
  Ticket as TicketIcon,
} from "lucide-react";
import { bookWithPerformance } from "@/types/reservation";

export default function Ticket(data: bookWithPerformance) {
  return (
    <article className="relative bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 flex flex-col justify-center items-center">
      <div className="relative p-6 pb-0 w-full max-w-md">
        <h2 className="sr-only">티켓: {data.performanceDetails.title}</h2>
        <div className="flex items-center mb-2">
          <TicketIcon className="text-flesh-500 mr-2" size={20} />
          <h3 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-flesh-500 to-flesh-700 bg-clip-text text-transparent">
            {data.performanceDetails.title}
          </h3>
        </div>

        <div className="sm:space-y-2 mt-4">
          <p className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="inline-block w-4 h-4 mr-2 text-flesh-500" />
            {data.performanceDate}
            <span className="mx-2">•</span>
            <Clock className="inline-block w-4 h-4 mr-1 text-flesh-500" />
            {data.performanceTime}
          </p>

          <p className="flex items-start text-sm text-gray-700 font-medium">
            <MapPin
              size={16}
              className="flex-shrink-0 mt-1 text-flesh-500 mr-2"
            />
            <span className="w-fit">{data.performanceDetails.address}</span>
          </p>

          <p className="flex items-start text-sm text-gray-600">
            <Map size={16} className="flex-shrink-0 mt-1 text-flesh-500 mr-2" />
            <span className="w-fit">
              {data.performanceDetails.detailAddress}
            </span>
          </p>
        </div>
      </div>

      {/* QR Code and seat information */}
      <div className="p-2 sm:p-6 pt-4 bg-white">
        <div className="flex gap-x-2">
          <div className="w-1/2">
            <div className="bg-flesh-50 bg-opacity-20 rounded-lg p-2 flex flex-col items-center justify-center border border-flesh-100 h-full">
              <QRCode
                value={data.bookingId}
                className="w-full h-auto p-2 bg-white"
              />
              <p className="text-xs pt-2 text-gray-500 text-center mt-1 break-keep">
                입장 시 QR 코드를 보여 주세요
              </p>
            </div>
          </div>

          <div className="w-1/2 gap-y-3 grid grid-cols-1 grid-rows-2">
            <div className="bg-flesh-50 bg-opacity-20 rounded-lg p-3 border border-flesh-100">
              <p className="text-xs text-flesh-700 mb-2">좌석 번호</p>
              <p className="font-bold text-lg text-flesh-900">
                {data.selectedSeats}
              </p>
            </div>

            <div className="bg-flesh-50 bg-opacity-20 rounded-lg p-3 border border-flesh-100">
              <p className="text-xs text-flesh-700 mb-2">예매 번호</p>
              <p className="font-bold text-sm text-flesh-900 break-all">
                {data.bookingId}
              </p>
            </div>
          </div>
        </div>

        {/* Information section */}
        <div className="mt-4 bg-flesh-50 rounded-lg p-4 border border-flesh-100">
          <p className="font-bold text-xs mb-2 text-flesh-800">
            꼭 확인해 주세요!
          </p>
          <ul className="text-xs list-disc ml-4 flex flex-col sm:gap-y-2 text-flesh-900">
            <li>본 티켓은 양도 및 재판매가 불가합니다.</li>
            <li>공연 시작 후에는 입장이 제한될 수 있습니다.</li>
            <li>공연 시작 30분 전부터 입장이 가능합니다.</li>
          </ul>
        </div>

        {/* Logo */}
        <div className="flex mt-4 justify-end items-center">
          <img className="w-12" src="/images/icons/logo-temp.svg" alt="SO@" />
        </div>
      </div>
    </article>
  );
}
