import { UsersIcon } from "lucide-react";

export function Community() {
  return (
    // <div className="flex flex-col gap-3 border rounded-md p-3">
    //   <div className="flex items-center gap-2">
    //     <UsersIcon className="w-5 h-5" />
    //     <h4 className="font-semibold">WEETOO Community</h4>
    //   </div>

    //   <div className="flex justify-between w-full">
    //     <div className="flex flex-col gap-2">
    //       <h5 className="text-sm font-semibold">자유 게시판</h5>
    //       <div className="flex flex-col gap-1">
    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">비트코인 어디까지 내려가는거냐 ㅋ</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">오늘 FOMC 기대됨</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">
    //             금값 미친거아님? 숏타는 애들 없지..
    //           </span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">
    //             거래소 먹튀당했다 ㅅㅂ 너네는 잘보..
    //           </span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">셀퍼럴 어떻게 받음?</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">ㅎㅂㅈㅇ 짤 모음.jpg</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">휴가 마렵다</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">인플루언서 압도적 1위</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">피부 개사기</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">자유</span>
    //           <span className="text-xs">인플루언서 압도적 1위</span>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="flex flex-col gap-2">
    //       <h5 className="text-sm font-semibold">수익 게시판</h5>
    //       <div className="flex gap-2">
    //         <div className="flex flex-col">
    //           <Image
    //             src="/demo-img-1.png"
    //             alt="demo-img-1"
    //             width={83}
    //             height={75}
    //           />
    //           <span className="text-[0.5rem]">300달러로 4700만듬</span>
    //           <div className="flex justify-between w-full items-center">
    //             <span className="text-[0.4rem]">나스닥킬러</span>
    //             <span className="text-[0.4rem]">25.03.06 12:13</span>
    //           </div>
    //         </div>
    //         <div className="flex flex-col">
    //           <Image
    //             src="/demo-img-2.png"
    //             alt="demo-img-2"
    //             width={83}
    //             height={75}
    //           />
    //           <span className="text-[0.5rem]">시작해본다 스닥이</span>
    //           <div className="flex justify-between w-full items-center">
    //             <span className="text-[0.4rem]">우리투자장</span>
    //             <span className="text-[0.4rem]">25.03.06 14:33</span>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex items-center gap-5 w-full">
    //         <span className="text-xs text-muted-foreground">수익</span>
    //         <span className="text-xs">
    //           형들 나 소질있는거같음 한번봐줘 매..
    //         </span>
    //       </div>

    //       <div className="flex items-center gap-5 w-full">
    //         <span className="text-xs text-muted-foreground">수익</span>
    //         <span className="text-xs">비트폭락에 롱수익 나뿐임?ㅋㅋ</span>
    //       </div>

    //       <div className="flex items-center gap-5 w-full">
    //         <span className="text-xs text-muted-foreground">수익</span>
    //         <span className="text-xs">도지코인 ㄳㄳ</span>
    //       </div>

    //       <div className="flex items-center gap-5 w-full">
    //         <span className="text-xs text-muted-foreground">수익</span>
    //         <span className="text-xs">오늘 3000먹고 마무리</span>
    //       </div>
    //     </div>

    //     <div className="flex flex-col gap-2">
    //       <h5 className="text-sm font-semibold">교육게시판</h5>
    //       <div className="flex flex-col gap-1">
    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">볼린저밴드의 이해</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">RSI 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">하이킨아시 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">MACD 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">패턴 모음</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs"> 캔들 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">외국 100억 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">기영이 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">이동평균선 매매법</span>
    //         </div>

    //         <div className="flex items-center gap-5 w-full">
    //           <span className="text-xs text-muted-foreground">교육</span>
    //           <span className="text-xs">이동평균선 매매법 재밌는거 같음</span>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      {/* Header with subtle gradient */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-[#e74c3c] via-[#e74c3c]/90 to-[#e74c3c]/80 text-white">
        <UsersIcon className="h-4 w-4 mr-2" />
        <h2 className="text-sm font-medium">WEETOO Community</h2>
      </div>

      {/* Content - Three column layout with minimal styling */}
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        {/* Free Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50">
            자유 게시판
          </div>
          <div className="h-[220px] overflow-y-auto no-scrollbar">
            {freeBoard.map((post, index) => (
              <div
                key={index}
                className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-[#e74c3c] mr-2">자유</span>
                <span className="text-gray-700">{post}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50">
            추억 게시판
          </div>
          <div className="h-[220px] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-2 p-2 border-b border-gray-100">
              <div className="relative rounded overflow-hidden">
                <div className="aspect-video w-full bg-[#3498db]"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                  <p className="text-white text-[10px] truncate">
                    차트데이터 스크린
                  </p>
                  <p className="text-white/70 text-[8px]">2023.03.06 12:33</p>
                </div>
              </div>
              <div className="relative rounded overflow-hidden">
                <div className="aspect-video w-full bg-[#2ecc71]"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                  <p className="text-white text-[10px] truncate">
                    차트데이터 스크린
                  </p>
                  <p className="text-white/70 text-[8px]">2023.03.06 12:33</p>
                </div>
              </div>
            </div>
            {memoryBoard.map((post, index) => (
              <div
                key={index}
                className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-[#e74c3c] mr-2">추억</span>
                <span className="text-gray-700">{post}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Education Board */}
        <div>
          <div className="px-3 py-1.5 text-xs font-medium border-b border-gray-200 bg-gray-50">
            교육게시판
          </div>
          <div className="h-[220px] overflow-y-auto no-scrollbar">
            {educationBoard.map((post, index) => (
              <div
                key={index}
                className="px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-[#e74c3c] mr-2">교육</span>
                <span className="text-gray-700">{post}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data
const freeBoard = [
  "비트코인 어디까지 내려가는거냐 ㅋ",
  "오늘 FOMC 기대됨",
  "금값 마진거래? 손타는 예를 올려..",
  "거래소 목표달성했다 ㅋ 너네는 잘봐..",
  "셀파돈 어떻게 받음?",
  "후보조ㅇ 활 모음.jpg",
  "휴가 막담다",
  "인룸투자식 업도적 1위",
  "파부 개사기",
  "인룸투자식 업도적 1위",
];

const memoryBoard = [
  "종목 난 소형있는거같을 한번바꿔 때..",
  "비트록하에 홀수익 나봤임?ㅋㅋㅋ",
  "도지코인 ㅋㅋ",
  "오늘 3000맞고 마무리",
];

const educationBoard = [
  "볼린저밴드의 이해",
  "RSI 매매법",
  "하이킨아시 매매법",
  "MACD 매매법",
  "패턴 모음",
  "캔들 매매법",
  "외국 100명 매매법",
  "기술이 매매법",
  "이동평균선 매매법",
  "이동평균선 매매법 저항눈거 같음",
];
