import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was a problem processing your authentication request. Please try
          again.
        </p>
        <Button asChild>
          <Link href="/login">Return to Login</Link>
        </Button>
      </div>
    </div>
  );
}

// "use client"

// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { useSearchParams } from "next/navigation"
// import { Suspense } from "react"

// function AuthCodeErrorContent() {
//   const searchParams = useSearchParams()
//   const error = searchParams.get("error")

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6 text-center">
//         <h1 className="text-3xl font-bold">Authentication Error</h1>
//         <p className="text-muted-foreground">
//           There was a problem processing your authentication request. Please try again.
//         </p>
//         {error && (
//           <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
//             <p>Error details: {error}</p>
//           </div>
//         )}
//         <Button asChild>
//           <Link href="/login">Return to Login</Link>
//         </Button>
//       </div>
//     </div>
//   )
// }

// export default function AuthCodeError() {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen flex-col items-center justify-center p-4">
//           <div className="w-full max-w-md space-y-6 text-center">
//             <h1 className="text-3xl font-bold">Authentication Error</h1>
//             <p className="text-muted-foreground">Loading error details...</p>
//             <Button asChild>
//               <Link href="/login">Return to Login</Link>
//             </Button>
//           </div>
//         </div>
//       }
//     >
//       <AuthCodeErrorContent />
//     </Suspense>
//   )
// }
