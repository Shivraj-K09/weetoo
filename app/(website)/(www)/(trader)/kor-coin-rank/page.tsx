import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leftTableUsers, rightTableUsers } from "@/data/data";
import { UserCircleIcon } from "lucide-react";
import Image from "next/image";
import { JSX } from "react";

const UserTable = ({
  users,
}: {
  users: { id: number; name: string; coins: number }[];
}): JSX.Element => {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-24">순위</TableHead>
          <TableHead className="text-center">이름</TableHead>
          <TableHead className="text-center">후원받은 코코인</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium text-center w-24">
              {user.id}
            </TableCell>
            <TableCell className="min-w-[200px]">
              <div className="flex items-center justify-center relative">
                <div className="absolute left-[calc(50%-80px)]">
                  <UserCircleIcon className="w-5 h-5 stroke-[#79747e]" />
                </div>
                <span className="pl-8">{user.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span>{user.coins.toLocaleString()}</span>
                <Image src="/coin.png" alt="coins" width={25} height={25} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function KorCoinRank() {
  return (
    <div className="w-full h-full py-5">
      <div className="flex flex-col w-full">
        <Image
          src="/trader-banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
        <div className="flex gap-5 mt-5 items-center w-full justify-center">
          <Image
            src="/title-coin.png"
            alt="kor-coin"
            width={100}
            height={100}
            loading="lazy"
          />
          <h1 className="text-6xl font-semibold uppercase">Kor_coin Ranking</h1>
        </div>

        <div className="flex gap-3 mt-10 w-full">
          <div className="w-full">
            <UserTable users={leftTableUsers} />
          </div>
          <div className="w-full">
            <UserTable users={rightTableUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}
