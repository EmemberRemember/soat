import axios from "axios";
import { cookies } from "next/headers";

export default async function axiosInterceptor(url: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const sessionCookieName = isDevelopment
    ? "next-auth.session-token"
    : "__Secure-next-auth.session-token";

  const sessionToken = cookies().get("next-auth.session-token")?.value;
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      Cookie: `${sessionCookieName}=${sessionToken}`,
    },
  });

  return response.data;
}
