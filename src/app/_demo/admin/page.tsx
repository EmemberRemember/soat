// "use client";
// import { useState, useEffect } from "react";

// export default function AdminUserManagement() {
//   const [adminUsers, setAdminUsers] = useState<string[]>([]);
//   const [newUserId, setNewUserId] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // 어드민 사용자 목록 불러오기
//   const fetchAdminUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/admin/account`);

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.error || "어드민 정보를 불러오는데 실패했습니다."
//         );
//       }

//       const data = await response.json();
//       setAdminUsers(data.users || []);
//       setError(null);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 어드민 사용자 추가
//   const addAdminUser = async () => {
//     if (!newUserId.trim()) {
//       setError("사용자 ID를 입력해주세요.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/admin/account`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userId: newUserId }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "어드민 추가에 실패했습니다.");
//       }

//       setNewUserId("");
//       await fetchAdminUsers();
//       setError(null);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 어드민 사용자 삭제
//   const removeAdminUser = async (userId: string) => {
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/admin/account`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userId }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "어드민 삭제에 실패했습니다.");
//       }

//       await fetchAdminUsers();
//       setError(null);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAdminUsers();
//   }, []);

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">어드민 계정 관리</h1>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-3">어드민 추가</h2>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={newUserId}
//             onChange={(e) => setNewUserId(e.target.value)}
//             placeholder="사용자 ID 입력"
//             className="flex-1 px-4 py-2 border rounded"
//           />
//           <button
//             onClick={addAdminUser}
//             disabled={loading}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//           >
//             {loading ? "처리 중..." : "추가"}
//           </button>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-xl font-semibold mb-3">어드민 목록</h2>
//         {loading && adminUsers.length === 0 ? (
//           <p className="text-gray-500">로딩 중...</p>
//         ) : adminUsers.length === 0 ? (
//           <p className="text-gray-500">등록된 어드민이 없습니다.</p>
//         ) : (
//           <ul className="border rounded divide-y">
//             {adminUsers.map((userId) => (
//               <li
//                 key={userId}
//                 className="px-4 py-3 flex justify-between items-center"
//               >
//                 <span>{userId}</span>
//                 <button
//                   onClick={() => removeAdminUser(userId)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   삭제
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Page() {
  return <div>page</div>;
}
