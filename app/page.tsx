import Link from "next/link";
import { CloudUpload } from "lucide-react";

export default function Home() {
  return (
    <section className="w-full flex flex-col justify-center items-center min-h-screen">
      <div className="grid grid-cols-2 w-full h-full">
        <div className="col-span-1 flex flex-col justify-center space-y-6 p-28">
          <h1 className="text-6xl font-bold">Cloudlet</h1>
          <h2 className="text-3xl font-bold">
            A cloud storage for your images and textual files
          </h2>
          <Link href="/dashboard">
            <button className="px-3 py-1 bg-white text-black rounded-md">
              Get Started
            </button>
          </Link>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="rounded-full p-12 bg-gradient-to-br from-blue-300 to-white shadow-lg transform transition-all duration-300">
            <CloudUpload className="h-48 w-48 text-blue-600" />
          </div>
        </div>
      </div>
    </section>
  );
}
