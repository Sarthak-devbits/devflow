"use client";
import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  upvotes: number;
  hasUpVoted: boolean;
  downVotes: number;
  hasDownVotes: boolean;
}

const Votes = ({ upvotes, hasUpVoted, downVotes, hasDownVotes }: Props) => {
  const session = useSession();
  const userID = session?.data?.user?.id || "";
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = (voteType: "upvote" | "downvote") => {
    setIsLoading(true);
    if (!userID) {
      return toast.error("Please log in to cast your vote.", {
        description: " You need to be logged in to vote.",
      });
    }

    try {
      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpVoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasDownVotes ? "added" : "removed"} successfully`;

      toast.success(successMessage, {
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      return toast.error("Failed to vote.", {
        description: "An error occured while processing your vote.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={hasUpVoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={hasDownVotes ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(downVotes)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Votes;
