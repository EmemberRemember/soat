// "use client";

// import { Button } from "@/components/controls/Button";
// import TheaterSeatSelector from "@/components/seats/TheaterSeatsSelector";
// import { useState } from "react";

// const demoLayout = {
//   rows: 6,
//   rowsConfigs: {
//     A: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//     B: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//     C: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//     D: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//     E: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//     F: {
//       seats: 10,
//       aisles: [2, 6, 10],
//     },
//   },
//   totalSeats: 60,
//   performanceName: "SCREEN 1",
//   lastModified: "2025-02-21T06:36:16.790Z",
// };
// export default function SeatsGeneratorDemo() {
//   const [selectedSeats, setSelectedSeats] = useState(new Set<string>());

//   const handleSeatToggle = (seatId: string) => {
//     setSelectedSeats((prev) => {
//       const newSelected = new Set(prev);
//       if (newSelected.has(seatId)) {
//         newSelected.delete(seatId);
//       } else {
//         newSelected.add(seatId);
//       }
//       return newSelected;
//     });
//   };

//   return (
//     <>
//       <TheaterSeatSelector
//         layoutData={demoLayout}
//         selectedSeats={selectedSeats}
//         onSeatToggle={handleSeatToggle}
//         occupiedSeats={[]}
//       />
//       <Button
//         onClick={() => {
//           console.log(selectedSeats);
//         }}
//       >
//         좌석 정보 콘솔에 출력
//       </Button>
//       <Button href="/demo/seats/generator">좌석 배치 생성기로 이동</Button>
//     </>
//   );
// }
