export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";

async function adminUserData() {
  try {
    const adminUsers = await adminDb.collection("admin").doc("users").get();
    const adminUsersData = adminUsers.data();

    if (!adminUsersData) {
      return NextResponse.json(
        { error: "관리자 정보가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(adminUsersData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "관리자 정보를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

async function addAdminUser({ userId }: { userId: string }) {
  try {
    const adminUsers = await adminDb.collection("admin").doc("users").get();
    const adminUsersData = adminUsers.data();

    if (!adminUsersData) {
      return NextResponse.json(
        { error: "관리자 정보가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const adminUsersList = adminUsersData.users;
    const isExist = adminUsersList.includes(userId);

    if (isExist) {
      return NextResponse.json(
        { error: "이미 존재하는 관리자입니다." },
        { status: 400 }
      );
    }

    adminUsersList.push(userId);

    await adminDb.collection("admin").doc("users").update({
      users: adminUsersList,
    });

    return NextResponse.json({ userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "관리자 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}

async function removeAdminUser({ userId }: { userId: string }) {
  try {
    const adminUsers = await adminDb.collection("admin").doc("users").get();
    const adminUsersData = adminUsers.data();

    if (!adminUsersData) {
      return NextResponse.json(
        { error: "관리자 정보가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const adminUsersList = adminUsersData.users;
    const isExist = adminUsersList.includes(userId);

    if (!isExist) {
      return NextResponse.json(
        { error: "존재하지 않는 관리자입니다." },
        { status: 400 }
      );
    }

    const newAdminUsersList = adminUsersList.filter(
      (adminUserId: string) => adminUserId !== userId
    );

    await adminDb.collection("admin").doc("users").update({
      users: newAdminUsersList,
    });

    return NextResponse.json({ userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "관리자 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return await adminUserData();
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  return await addAdminUser({ userId });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await request.json();

  return await removeAdminUser({ userId });
}
