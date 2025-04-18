export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";

async function buyerUsersList() {
  try {
    const buyerUsers = await adminDb.collection("buyerUsers").get();
    const buyerUsersData = buyerUsers.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sensoredBuyerUsersData = buyerUsersData.map((buyerUser) => {
      return {
        ...buyerUser,
        password: undefined,
      };
    });

    return sensoredBuyerUsersData;
  } catch (error) {
    console.error(error);
    throw new Error("구매자 정보를 가져오는데 실패했습니다.");
  }
}

// async function sellerUsersList() {
//   try {
//     const sellerUsers = await adminDb.collection("sellerUsers").get();
//     const sellerUsersData = sellerUsers.docs.map((doc) => doc.data());

//     const sensoredSellerUsersData = sellerUsersData.map((sellerUser) => {
//       return {
//         ...sellerUser,
//         password: undefined,
//       };
//     });

//     return sensoredSellerUsersData;
//   } catch (error) {
//     console.error(error);
//     throw new Error("판매자 정보를 가져오는데 실패했습니다.");
//   }
// }

export async function GET() {
  try {
    const data = await buyerUsersList();
    return NextResponse.json(data);
  } catch (error) {
    console.error("서버 에러 발생:", error);
    return NextResponse.json({ error: "서버 에러 발생" }, { status: 500 });
  }
}
