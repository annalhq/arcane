"use client"

import { signIn, useSession } from "next-auth/react";
import React from "react";

const Dashboard = () => {
const { data: session} = useSession();

return (
  <>
  {session ? (
    <>
    <h1>welcome back, {session.user?.name} !</h1>
    </>
  ) : (
    <>
    <h1>you are not signed in</h1>
<button onClick={() => signIn("google")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign in with Google</button>
<button onClick={() => signIn("github")} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mt-2">Sign in with GitHub</button>
    </>

  )
}
  </>
);
}

export default Dashboard;