import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leftTableUsers, rightTableUsers } from "@/data/trader-ranking";
import { UserCircleIcon } from "lucide-react";
import Image from "next/image";
import { JSX } from "react";

const UserTable = ({
  users,
}: {
  users: {
    id: number;
    name: string;
    return: number;
    numberOfTrades: number;
  }[];
}): JSX.Element => {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-24">순위</TableHead>
          <TableHead className="text-center">순위</TableHead>
          <TableHead className="text-center">수익률</TableHead>
          <TableHead className="text-center">매매횟수</TableHead>
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
                <span className="text-[#F47C7C]">
                  {user.return.toLocaleString()} %
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[#F91515]">
                  {user.numberOfTrades.toLocaleString()} 회
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function TraderRank() {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col w-full">
        <Image
          src="/trader-banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
        <div className="flex gap-3 mt-5 w-full">
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
