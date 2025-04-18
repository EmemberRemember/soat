export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    // 단순 검증 임시구현: 'VALID' 문자열이 포함된 코드만 유효
    const isValid = typeof code === "string" && code.includes("VALID");

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("API 검증 오류:", error);
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
