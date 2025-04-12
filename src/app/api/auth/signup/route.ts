export const dynamic = "force-dynamic";

import NextCrypto from "next-crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "../../firebaseAdmin";
import { hash } from "bcryptjs";

const SECRET_KEY = process.env.NEXT_CRYPTO_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("NEXT_CRYPTO_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
}

const crypto = new NextCrypto(SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { userType, email, password } = formData;

    // 기본적인 공통 필수값 검증
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 사용자 타입별 필수값 검증
    if (userType === "seller") {
      const { teamName, managerName, phoneNumber, businessNum } = formData;
      if (!teamName || !managerName || !phoneNumber) {
        return NextResponse.json(
          { error: "판매자 정보 중 필수 입력값이 누락되었습니다." },
          { status: 400 }
        );
      }

      // 사업자 번호가 있는 경우 유효성 검증
      if (businessNum && !formData.isBusinessNumValid) {
        return NextResponse.json(
          { error: "사업자 번호 인증이 필요합니다." },
          { status: 400 }
        );
      }
    } else {
      const { username, phoneNumber } = formData;
      if (!username || !phoneNumber) {
        return NextResponse.json(
          { error: "사용자 정보 중 필수 입력값이 누락되었습니다." },
          { status: 400 }
        );
      }
    }

    // 회원 유형에 따른 컬렉션 결정
    const collectionName = userType === "seller" ? "sellerUsers" : "buyerUsers";

    // 해당 컬렉션 내에서만 이메일 중복 확인
    const userSnapshot = await adminDb
      .collection(collectionName)
      .where("email", "==", email)
      .get();

    if (!userSnapshot.empty) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // 이메일 인증 확인
    const emailVerificationSnapshot = await adminDb
      .collection("emailVerification")
      .doc(email)
      .get();

    if (!emailVerificationSnapshot.exists) {
      return NextResponse.json(
        { error: "이메일 인증이 필요합니다." },
        { status: 403 }
      );
    }

    const emailVerificationData = emailVerificationSnapshot.data();

    if (!emailVerificationData) {
      return NextResponse.json(
        { error: "이메일 인증 데이터가 없습니다." },
        { status: 403 }
      );
    }

    if (emailVerificationData.status !== "verified") {
      return NextResponse.json(
        { error: "이메일 인증이 완료되지 않았습니다." },
        { status: 403 }
      );
    } else if (
      new Date(emailVerificationData.createdAt) <
      new Date(Date.now() - 1000 * 60 * 60)
    ) {
      // 1시간 이내에 인증 완료되지 않은 경우
      return NextResponse.json(
        { error: "이메일 인증 시간이 만료되었습니다." },
        { status: 403 }
      );
    } else {
      // 인증 확인 완료
      // 이메일 인증 데이터 삭제
      await adminDb.collection("emailVerification").doc(email).delete();
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 12);

    // 기본 사용자 데이터
    const { userType: _userType, ...restFormData } = formData;

    let userData = {
      ...restFormData,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // seller 유형인 경우 추가 필드 설정
    if (userType === "seller") {
      if (!restFormData.bankAccount) {
        return NextResponse.json(
          { error: "계좌 정보가 누락되었습니다." },
          { status: 400 }
        );
      }

      const bankAccount = restFormData.bankAccount;

      const encryptedBankAccountNum = await crypto.encrypt(
        bankAccount.accountNum
      );

      const {
        isBusinessNumValid: _isBusinessNumValid,
        ...dataWithoutValidation
      } = userData;

      const { accountImage: _accountImage, ...bankAccountWithoutAccountImage } =
        bankAccount;

      userData = {
        ...dataWithoutValidation,
        bankAccount: {
          ...bankAccountWithoutAccountImage,
          accountNum: encryptedBankAccountNum,
        },
        isApproval: false, // 판매자는 기본적으로 승인 대기 상태
      };
    }

    // 데이터베이스에 사용자 데이터 추가
    const userRef = await adminDb.collection(collectionName).add(userData);

    // 응답에서 비밀번호 제외
    const { password: _password, ...userDataWithoutPassword } = userData;

    // Firebase Storage에 암호화된 통장 사본 업로드
    if (userType === "seller" && restFormData.bankAccount.accountImage) {
      try {
        // Base64 문자열에서 이미지 타입 추출
        const imageTypeRegex = /^data:image\/(\w+);base64,/;
        const matches =
          restFormData.bankAccount.accountImage.match(imageTypeRegex);
        const imageType = matches && matches.length === 2 ? matches[1] : "jpeg"; // 기본값은 jpeg

        // Base64 문자열에서 데이터 부분만 추출
        const base64Data = restFormData.bankAccount.accountImage.includes(",")
          ? restFormData.bankAccount.accountImage.split(",")[1]
          : restFormData.bankAccount.accountImage;

        // 이미지 데이터 암호화
        const encryptedData = await crypto.encrypt(base64Data);

        // 암호화된 데이터를 텍스트 파일로 저장
        const accountImageRef = adminStorage
          .bucket()
          .file(
            `sellerUsers/${userRef.id}/accountImage_${Date.now()}.encrypted`
          );

        await accountImageRef.save(encryptedData, {
          metadata: {
            contentType: "text/plain",
            metadata: {
              encrypted: "true",
              originalType: `image/${imageType}`,
              fileExtension: imageType,
            },
          },
        });

        // 파일 경로와 원본 이미지 타입 저장
        await userRef.update({
          "bankAccount.encryptedAccountImagePath": accountImageRef.name,
          "bankAccount.originalImageType": imageType,
        });

        console.log("암호화된 이미지가 성공적으로 업로드되었습니다.");
      } catch (error) {
        console.error("이미지 암호화 및 업로드 오류:", error);
      }
    }

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        userType,
        userId: userRef.id,
        user: userDataWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
