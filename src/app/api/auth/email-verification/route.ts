export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "../../firebaseAdmin";

async function sendEmail({ email, code }: { email: string; code: number }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"SOAT" <noreply@${process.env.EMAIL_DOMAIN}>`,
      to: email,
      subject: "[SO@] 이메일 인증",
      text: `인증 번호: ${code}`,
      html: `
        <h1>이메일 인증</h1>
        <p>SO@의 회원 가입을 위한 이메일 인증을 진행합니다.</p>
        <p>아래의 인증 번호를 입력해주세요.</p>
        <p>인증 번호: <strong>${code}</strong></p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { email, userType } = data;

  // 이메일 중복 확인
  const userSnapshot = await adminDb
    .collection(userType === "seller" ? "sellerUsers" : "buyerUsers")
    .where("email", "==", email)
    .get();

  if (!userSnapshot.empty) {
    return NextResponse.json(
      { error: "이미 가입된 이메일입니다." },
      { status: 409 }
    );
  }

  const code = Math.floor(Math.random() * 1000000);

  sendEmail({ email, code });

  adminDb
    .collection("emailVerification")
    .doc(email)
    .set({ code, createdAt: new Date(), status: "pending" });

  return NextResponse.json({ success: true });
}
