import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminDb } from "@/app/api/firebaseAdmin";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface User {
    isDeleteUser?: boolean;
    teamName?: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.userType
        ) {
          throw new Error("필수 입력값이 누락되었습니다.");
        }

        const collectionName =
          credentials.userType === "seller" ? "sellerUsers" : "buyerUsers";

        const userSnapshot = await adminDb
          .collection(collectionName)
          .where("email", "==", credentials.email)
          .get();

        if (userSnapshot.empty) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        const userData = userSnapshot.docs[0].data();

        if (!userData.password) {
          throw new Error("로그인에 실패했습니다.");
        }

        const isValid = await compare(credentials.password, userData.password);

        if (!isValid) {
          throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        // User 타입에 맞게 반환
        return {
          id: userSnapshot.docs[0].id,
          email: userData.email,
          userType: credentials.userType as "seller" | "buyer",
          isDeleteUser: userData.isDeleteUser || false,
          ...(credentials.userType === "seller"
            ? { teamName: userData.teamName }
            : { username: userData.username }),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.id = user.id;
        token.isDeleteUser = user.isDeleteUser;
        if (token.userType === "seller") {
          (token.teamName = user.teamName) as string;
        } else {
          (token.username = user.username) as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as "buyer" | "seller";
        session.user.isDeleteUser = token.isDeleteUser as boolean;
        if (session.user.userType === "seller") {
          session.user.teamName = token.teamName as string;
        } else {
          session.user.username = token.username as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
