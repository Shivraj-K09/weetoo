"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      {/* Circuit pattern background */}
      <div className="absolute inset-0 z-0">
        <CircuitPattern />
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-white">
        <h1 className="text-[10rem] font-bold leading-none tracking-tight md:text-[12rem]">
          404
        </h1>
        <h2 className="mb-8 text-2xl font-medium">Page Not Found</h2>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-tl-md rounded-br-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}

function CircuitPattern() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Get all paths
    const paths = svgRef.current.querySelectorAll("path");

    // Animate each path
    paths.forEach((path, index) => {
      const length = path.getTotalLength();

      // Set up the starting position
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      // Define animation
      path.style.animation = `circuit-line-flow ${3 + (index % 7)}s linear infinite`;
      path.style.animationDelay = `${index * 0.3}s`;
    });

    // Get all circles
    const circles = svgRef.current.querySelectorAll("circle");

    // Animate each circle
    circles.forEach((circle, index) => {
      circle.style.animation = `circuit-dot-pulse ${2 + (index % 4)}s ease-in-out infinite`;
      circle.style.animationDelay = `${index * 0.4}s`;
    });
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes circuit-line-flow {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes circuit-dot-pulse {
          0%,
          100% {
            opacity: 0.2;
            r: 2;
          }
          50% {
            opacity: 1;
            r: 3;
          }
        }
      `}</style>

      <svg
        ref={svgRef}
        className="h-full w-full opacity-20"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="white" strokeWidth="1.5" fill="none">
          {/* Random circuit paths */}
          <path d="M0,123 L217,123 L217,305 L438,305 L438,189 L671,189 L671,78 L1000,78" />
          <path d="M0,256 L158,256 L158,412 L362,412 L362,256 L582,256 L582,412 L789,412 L789,256 L1000,256" />
          <path d="M0,367 L92,367 L92,512 L283,512 L283,367 L467,367 L467,512 L689,512 L689,367 L873,367 L873,512 L1000,512" />
          <path d="M0,623 L127,623 L127,734 L329,734 L329,623 L512,623 L512,734 L723,734 L723,623 L912,623 L912,734 L1000,734" />
          <path d="M0,845 L217,845 L217,623 L438,623 L438,845 L671,845 L671,623 L1000,623" />

          <path d="M0,178 L283,178 L283,389 L512,389 L512,178 L723,178 L723,389 L1000,389" />
          <path d="M0,478 L158,478 L158,689 L362,689 L362,478 L582,478 L582,689 L789,689 L789,478 L1000,478" />
          <path d="M0,567 L92,567 L92,789 L283,789 L283,567 L467,567 L467,789 L689,789 L689,567 L873,567 L873,789 L1000,789" />

          <path d="M127,0 L127,217 L329,217 L329,412 L127,412 L127,623 L329,623 L329,1000" />
          <path d="M283,0 L283,123 L467,123 L467,305 L283,305 L283,512 L467,512 L467,1000" />
          <path d="M438,0 L438,256 L671,256 L671,478 L438,478 L438,689 L671,689 L671,1000" />
          <path d="M582,0 L582,178 L789,178 L789,367 L582,367 L582,567 L789,567 L789,1000" />
          <path d="M723,0 L723,123 L912,123 L912,305 L723,305 L723,512 L912,512 L912,1000" />

          <path d="M158,0 L158,178 L362,178 L362,389 L158,389 L158,567 L362,567 L362,1000" />
          <path d="M512,0 L512,256 L689,256 L689,478 L512,478 L512,689 L689,689 L689,1000" />
          <path d="M873,0 L873,178 L1000,178" />
          <path d="M92,0 L92,367 L217,367 L217,567 L92,567 L92,845 L217,845 L217,1000" />

          {/* Diagonal paths */}
          <path d="M0,0 L217,217 L217,305 L329,417 L512,600 L689,777 L873,961 L1000,1000" />
          <path d="M1000,0 L873,127 L689,311 L512,488 L329,671 L217,783 L217,871 L0,1000" />
          <path d="M500,0 L500,217 L583,300 L583,478 L500,561 L500,789 L583,872 L583,1000" />
          <path d="M0,500 L217,500 L300,583 L478,583 L561,500 L789,500 L872,583 L1000,583" />

          {/* Connection dots */}
          <circle cx="127" cy="123" r="3" fill="white" />
          <circle cx="217" cy="256" r="3" fill="white" />
          <circle cx="283" cy="367" r="3" fill="white" />
          <circle cx="329" cy="478" r="3" fill="white" />
          <circle cx="362" cy="567" r="3" fill="white" />
          <circle cx="438" cy="623" r="3" fill="white" />
          <circle cx="467" cy="689" r="3" fill="white" />
          <circle cx="512" cy="734" r="3" fill="white" />
          <circle cx="582" cy="789" r="3" fill="white" />
          <circle cx="671" cy="845" r="3" fill="white" />
          <circle cx="723" cy="178" r="3" fill="white" />
          <circle cx="789" cy="256" r="3" fill="white" />
          <circle cx="873" cy="367" r="3" fill="white" />
          <circle cx="912" cy="478" r="3" fill="white" />
          <circle cx="158" cy="389" r="3" fill="white" />
          <circle cx="92" cy="512" r="3" fill="white" />
          <circle cx="217" cy="217" r="3" fill="white" />
          <circle cx="329" cy="329" r="3" fill="white" />
          <circle cx="438" cy="438" r="3" fill="white" />
          <circle cx="512" cy="512" r="3" fill="white" />
          <circle cx="582" cy="582" r="3" fill="white" />
          <circle cx="671" cy="671" r="3" fill="white" />
          <circle cx="723" cy="723" r="3" fill="white" />
          <circle cx="789" cy="789" r="3" fill="white" />
          <circle cx="873" cy="873" r="3" fill="white" />
        </g>
      </svg>
    </>
  );
}
