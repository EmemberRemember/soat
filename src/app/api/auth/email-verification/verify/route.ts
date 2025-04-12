export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";

export async function PUT(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const doc = await adminDb.collection("emailVerification").doc(email).get();
  const data = doc.data();

  if (!data) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (data.code === code && data.status === "pending") {
    await adminDb.collection("emailVerification").doc(email).update({
      status: "verified",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } else if (data.status === "verified") {
    return NextResponse.json(
      {
        message: "Already verified",
      },
      { status: 400 }
    );
  } else {
    return NextResponse.json({ message: "Invalid code" }, { status: 400 });
  }
}
