import axios from "axios";
import { cookies } from "next/headers";

export default async function axiosInterceptor(url: string) {
  const sessionToken = cookies().get("next-auth.session-token")?.value;
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
  });

  return response.data;
}
