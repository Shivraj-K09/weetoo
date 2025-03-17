import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

export default function ProfitBoard() {
  return (
    <div className="w-full h-full py-5">
      <div className="flex flex-col w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>

      <Button className="bg-[#FF4C4C] text-white mt-3 rounded-md shadow-none cursor-pointer hover:bg-[#FF4C4C]/[0.9]">
        수익게시판
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-3">
        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <div className="w-44 h-20 bg-zinc-300 rounded-md" />
          <div className="flex flex-col gap-2 w-full">
            <span className="">Lorem ipsum dolor sit amet.</span>
            <span className="text-sm text-muted-foreground text-justify line-clamp-2">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam
              asperiores id sint rem vitae, nulla accusantium aliquid a sed
              earum.
            </span>
          </div>
        </div>
      </div>
      <Separator orientation="horizontal" className="w-full my-5" />
      <div className="">
        <div className="[&>div]:max-h-[43.75rem] border rounded overflow-hidden">
          <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
            <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center font-medium">
                  번호
                </TableHead>
                <TableHead className="font-medium">제목</TableHead>
                <TableHead className="w-24 text-center font-medium">
                  글쓴이
                </TableHead>
                <TableHead className="w-24 text-center font-medium">
                  작성일
                </TableHead>
                <TableHead className="w-16 text-center font-medium">
                  조회
                </TableHead>
                <TableHead className="w-16 text-center font-medium">
                  추천
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Notice rows with icons */}
              <TableRow>
                <TableCell className="text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-volume-2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    메니저들에게 가장 잘할 것 같은 스타는?
                  </div>
                </TableCell>
                <TableCell className="text-center">운영자</TableCell>
                <TableCell className="text-center text-sm">25/03/10</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-info"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    실시간베스트 갤러리 이용 안내 [2845/2]
                  </div>
                </TableCell>
                <TableCell className="text-center">운영자</TableCell>
                <TableCell className="text-center text-sm">21.11.18</TableCell>
                <TableCell className="text-center">10872169</TableCell>
                <TableCell className="text-center">518</TableCell>
              </TableRow>

              {/* Regular post rows */}
              <TableRow>
                <TableCell className="text-center">312721</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-16 overflow-hidden rounded bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        해결
                      </Badge>
                      <span>
                        Lorem ipsum dolor sit amet consectetur adipisicing...
                        [35]
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>ㅇ ㅇ</span>
                    <span className="text-gray-500 text-xs">(149.88)</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">14:45</TableCell>
                <TableCell className="text-center">1473</TableCell>
                <TableCell className="text-center">7</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="text-center">312719</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-16 overflow-hidden rounded bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        싱갤
                      </Badge>
                      <span>
                        Sed do eiusmod tempor incididunt ut labore et... [214]
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>CosmoAiro</span>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-blue-600 px-1 text-xs text-white"
                    >
                      B
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">14:40</TableCell>
                <TableCell className="text-center">18849</TableCell>
                <TableCell className="text-center">83</TableCell>
              </TableRow>

              {/* More rows following the same pattern */}
              {Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">
                    {312718 - index}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index % 2 === 0 && (
                        <div className="h-12 w-16 overflow-hidden rounded bg-gray-300"></div>
                      )}
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          {
                            [
                              "아갤",
                              "싱갤",
                              "기타",
                              "러갤",
                              "상갤",
                              "아갤",
                              "기갤",
                              "만갤",
                              "아갤",
                              "상갤",
                            ][index % 10]
                          }
                        </Badge>
                        <span>
                          {
                            [
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                              "Ut enim ad minim veniam, quis nostrud exercitation",
                              "Duis aute irure dolor in reprehenderit in voluptate",
                              "Excepteur sint occaecat cupidatat non proident",
                              "Sed ut perspiciatis unde omnis iste natus error",
                              "Nemo enim ipsam voluptatem quia voluptas sit",
                              "At vero eos et accusamus et iusto odio dignissimos",
                              "Et harum quidem rerum facilis est et expedita",
                              "Nam libero tempore, cum soluta nobis est eligendi",
                              "Temporibus autem quibusdam et aut officiis debitis",
                            ][index % 10]
                          }{" "}
                          [{Math.floor(Math.random() * 200) + 1}]
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>
                        {
                          [
                            "ㅇ ㅇ",
                            "유저네임",
                            "홍길동",
                            "메디터",
                            "ㅇ ㅇ",
                            "코딩고수",
                            "유스테이지",
                            "드림코더",
                            "마스터",
                            "ㅇ ㅇ",
                          ][index % 10]
                        }
                      </span>
                      {index % 3 === 0 && (
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-blue-600 px-1 text-xs text-white"
                        >
                          B
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{`14:${
                    35 - ((index * 3) % 30)
                  }`}</TableCell>
                  <TableCell className="text-center">
                    {Math.floor(Math.random() * 10000) + 1000}
                  </TableCell>
                  <TableCell className="text-center">
                    {Math.floor(Math.random() * 100) + 1}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
