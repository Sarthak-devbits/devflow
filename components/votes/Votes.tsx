"use client";
import { CreateVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { use, useState } from "react";
import { toast } from "sonner";

interface Props {
  targetId: string;
  targetType: "question" | "answer";
  upvotes: number;
  downVotes: number;
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
}

const Votes = ({
  upvotes,
  downVotes,
  hasVotedPromise,
  targetId,
  targetType,
}: Props) => {
  const session = useSession();
  const userID = session?.data?.user?.id || "";
  const [isLoading, setIsLoading] = useState(false);

  const { success, data } = use(hasVotedPromise);

  const { hasUpVoted, hasDownVoted } = data || {};

  const handleVote = async (voteType: "upvote" | "downvote") => {
    setIsLoading(true);
    if (!userID) {
      return toast.error("Please log in to cast your vote.", {
        description: " You need to be logged in to vote.",
      });
    }

    const result = await CreateVote({
      targetId: targetId,
      targetType: targetType,
      voteType,
    });

    if (!result.success) {
      return toast.error("Failed to vote.", {
        description: result.error?.message || "An error occurred while voting.",
      });
    }

    try {
      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpVoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasDownVoted ? "added" : "removed"} successfully`;

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
          src={
            success && hasUpVoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"
          }
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="Upvote"
          onClick={() => handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={
            success && hasDownVoted
              ? "/icons/downvoted.svg"
              : "/icons/downvote.svg"
          }
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
