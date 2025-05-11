import axiosInterceptor from "@/lib/axiosInterceptor";
interface UserDataProps {
  label: "회원 유형" | "이름" | "이메일" | "휴대폰";
  data: string;
}

function Li({ label, data }: UserDataProps) {
  return (
    <li className="flex gap-4 mb-1">
      <p className="flex-[1] ml-8 sm:ml-0 min-w-10 sm:min-w-16 font-bold text-flesh-500 sm:text-lg">
        {label}
      </p>
      <span className="flex-[3] sm:flex-[2] sm:text-lg sm:min-w-32 whitespace-nowrap">
        {data}
      </span>
    </li>
  );
}

export default async function UserInfoItem() {
  const response = await axiosInterceptor("/api/account/me");
  const user = response.user;
  return (
    <ul className="p-5 rounded-[10px] w-full border-2 border-flesh-200 text-xs sm:h-80 sm:flex sm:flex-col sm:justify-center sm:gap-2 whitespace-nowrap sm:px-3 md:px-5">
      <Li label="이름" data={user?.username} />
      <Li label="이메일" data={user?.email} />
      <Li
        label="휴대폰"
        data={user?.phoneNumber.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3")}
      />
      <Li label="회원 유형" data={user?.userType} />
    </ul>
  );
}
