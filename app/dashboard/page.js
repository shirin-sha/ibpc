import Layout from "../../components/Layout";
import Card from "../../components/Card";

export default function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Users" value="1,234" icon="👥" />
        <Card title="Requests" value="56" icon="📝" />
        <Card title="Revenue" value="$12,345" icon="💰" />
      </div>
    </Layout>
  );
}
// 'use client';
// import { useSession } from "next-auth/react";

// export default function Dashboard() {
//   const { data: session } = useSession();
  
//   if (!session) return <div>{console.log(session)}Loading...</div>;

//   return (
//     <div>
//       {console.log(session)}
//       <h1>Welcome {session.user.name}</h1>
//       <p>Email: {session.user.email}</p>
//       <p>Role: {session.user.role}</p>
//     </div>
//   );
// }