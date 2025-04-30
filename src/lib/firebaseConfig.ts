import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { FirebaseOptions } from "firebase/app";

interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (!firebaseConfig) {
  throw new Error("Firebase 설정이 필요합니다.");
}

const parsedFirebaseConfig = JSON.parse(firebaseConfig);

// Firebase 앱 초기화
const app = initializeApp(parsedFirebaseConfig as FirebaseOptions);

// Firestore 인스턴스 생성
const db = getFirestore(app);

export { db };
