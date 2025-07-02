import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  console.log(session);
  return (
    <div>
      <p className="text-primary-500 background-light850_dark100 font-main">
        Hello sdcs
      </p>
      <h1 className="font-space-grotesk">By sdcs</h1>
    </div>
  );
}
