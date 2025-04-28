"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

function ButtonPage() {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    // 버튼 상태를 실시간으로 감시하는 리스너 설정
    const buttonRef = doc(db, "debug", "button");

    const unsubscribe = onSnapshot(buttonRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        // Firestore에서 버튼 상태 가져와서 적용
        setButtonDisabled(docSnapshot.data().isDisabled);
      }
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, []);

  const handleButtonClick = async () => {
    try {
      // 버튼 클릭 시 Firestore 문서 업데이트 - 현재 상태의 반대로 토글
      const buttonRef = doc(db, "debug", "button");
      await updateDoc(buttonRef, {
        isDisabled: !buttonDisabled,
        lastClickedAt: new Date(),
        clickedBy: "현재 사용자 ID", // 실제로는 인증된 사용자 ID를 사용
      });

      // 로컬 상태 업데이트 (실제로는 onSnapshot에서 처리됨)
      setButtonDisabled(!buttonDisabled);
    } catch (error) {
      console.error("버튼 상태 업데이트 실패:", error);
    }
  };

  return (
    <div className="button-container">
      <h1>실시간 버튼 상태 동기화 예제</h1>
      <button
        onClick={handleButtonClick}
        className={buttonDisabled ? "button-disabled" : "button-active"}
      >
        {buttonDisabled
          ? "비활성화됨 (클릭하여 활성화)"
          : "활성화됨 (클릭하여 비활성화)"}
      </button>

      <p>버튼 현재 상태: {buttonDisabled ? "비활성화" : "활성화"}</p>
    </div>
  );
}

export default ButtonPage;
