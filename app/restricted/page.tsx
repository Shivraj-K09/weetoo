import { Button } from "@/components/ui/button";
import { IconHome2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function Restricted() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4 py-8 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/restricted.webp"
            alt="Restricted Access"
            width={200}
            height={200}
            priority
          />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Access Restricted
        </h1>
        <p className="mb-6 text-gray-600">
          You don&apos;t have permission to access this page. This area is
          restricted to administrators only.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full h-10 shadow-none">
            <Link href="/">
              <IconHome2 className="h-4 w-4" />
              Return to Website
            </Link>
          </Button>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
}
