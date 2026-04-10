import Image from "next/image";
import { redirect } from "next/navigation";

import getCurrentUser from "../actions/getCurrentUser";
import AuthForm from "./components/AuthForm";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/users");
  }

  return (
    <div 
      className="
        flex h-full flex-col justify-center  py-12 sm:px-6 lg:px-8  bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
      {/* 
      <Image
          height="48"
          width="48"
          className="mx-auto w-auto"
          src="/images/logo.png"
          alt="Logo"
        />
      
      */}
        
        <h2 
          className="
            mt-6 
            text-center 
            text-3xl 
            font-bold 
            tracking-tight 
            text-gray-900
          "> 
            Sign in to your account
        </h2>
      </div>
      <AuthForm />
  </div>
  )
}
