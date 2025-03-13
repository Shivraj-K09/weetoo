"use client";

import { UsersIcon } from "lucide-react";
import Image from "next/image";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Trading } from "./trading";

export function DesktopContent() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] w-full h-full lg:block hidden">
      <div className="h-full">
        <Image
          src="/banner.png"
          alt="banner"
          width={1000}
          height={250}
          draggable={false}
          className="w-full rounded-md"
        />
        <div className="py-2">
          <TickerTape
            symbols={[
              { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
              { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
              { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
              { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
              { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
            ]}
            showSymbolLogo={true}
            isTransparent={true}
            displayMode="compact"
            colorTheme="light"
            locale="en"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 border rounded-md p-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              <h4 className="font-semibold">WEETOO Community</h4>
            </div>

            <div className="flex justify-between w-full">
              <div className="flex flex-col gap-2">
                <h5 className="text-sm font-semibold">자유 게시판</h5>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">
                      비트코인 어디까지 내려가는거냐 ㅋ
                    </span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">오늘 FOMC 기대됨</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">
                      금값 미친거아님? 숏타는 애들 없지..
                    </span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">
                      거래소 먹튀당했다 ㅅㅂ 너네는 잘보..
                    </span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">셀퍼럴 어떻게 받음?</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">ㅎㅂㅈㅇ 짤 모음.jpg</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">휴가 마렵다</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">인플루언서 압도적 1위</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">피부 개사기</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">자유</span>
                    <span className="text-xs">인플루언서 압도적 1위</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h5 className="text-sm font-semibold">수익 게시판</h5>
                <div className="flex gap-2">
                  <div className="flex flex-col">
                    <Image
                      src="/demo-img-1.png"
                      alt="demo-img-1"
                      width={83}
                      height={75}
                    />
                    <span className="text-[0.5rem]">300달러로 4700만듬</span>
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[0.4rem]">나스닥킬러</span>
                      <span className="text-[0.4rem]">25.03.06 12:13</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Image
                      src="/demo-img-2.png"
                      alt="demo-img-2"
                      width={83}
                      height={75}
                    />
                    <span className="text-[0.5rem]">시작해본다 스닥이</span>
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[0.4rem]">우리투자장</span>
                      <span className="text-[0.4rem]">25.03.06 14:33</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 w-full">
                  <span className="text-xs text-muted-foreground">수익</span>
                  <span className="text-xs">
                    형들 나 소질있는거같음 한번봐줘 매..
                  </span>
                </div>

                <div className="flex items-center gap-5 w-full">
                  <span className="text-xs text-muted-foreground">수익</span>
                  <span className="text-xs">비트폭락에 롱수익 나뿐임?ㅋㅋ</span>
                </div>

                <div className="flex items-center gap-5 w-full">
                  <span className="text-xs text-muted-foreground">수익</span>
                  <span className="text-xs">도지코인 ㄳㄳ</span>
                </div>

                <div className="flex items-center gap-5 w-full">
                  <span className="text-xs text-muted-foreground">수익</span>
                  <span className="text-xs">오늘 3000먹고 마무리</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h5 className="text-sm font-semibold">교육게시판</h5>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">볼린저밴드의 이해</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">RSI 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">하이킨아시 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">MACD 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">패턴 모음</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs"> 캔들 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">외국 100억 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">기영이 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">이동평균선 매매법</span>
                  </div>

                  <div className="flex items-center gap-5 w-full">
                    <span className="text-xs text-muted-foreground">교육</span>
                    <span className="text-xs">
                      이동평균선 매매법 재밌는거 같음
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border rounded-md p-3 pt-5">
            <div className="flex justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src="/crown.png" alt="crown" width={25} height={25} />
                  <span className="text-xs">일간 수익률 순위 TOP5</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src="/crown.png" alt="crown" width={25} height={25} />
                  <span className="text-xs">일간 수익률 순위 TOP5</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src="/crown.png" alt="crown" width={25} height={25} />
                  <span className="text-xs">일간 수익률 순위 TOP5</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src="/crown.png" alt="crown" width={25} height={25} />
                  <span className="text-xs">일간 수익률 순위 TOP5</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[1.56rem] h-[1.56rem] bg-gray-500 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs">나스닥 킬러</span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        NAS100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Trading />
      </div>
    </div>
  );
}
