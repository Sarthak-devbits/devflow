"use client";

import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "sonner";

const SavedQuestions = ({
  questionId,
  hasSavedQuestionPromise,
}: {
  questionId: string;
  hasSavedQuestionPromise: Promise<
    ActionResponse<{
      saved: Boolean;
    }>
  >;
}) => {
  const session = useSession();
  const userId = session?.data?.user?.id;

  const { data } = use(hasSavedQuestionPromise);

  console.log(data);

  const { saved: hasSaved } = data || {};

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId) {
      return toast("Please sign in to save questions.", {
        description: "You need to be signed in to save questions.",
      });
    }
    setIsLoading(true);

    try {
      const { success, data, error } = await toggleSaveQuestion({ questionId });
      if (!success) {
        throw new Error(error?.message || "Failed to save question");
      }

      toast.success("Success", {
        description: `Question ${data?.saved ? "saved" : "unsaved"} successfully`,
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error?.message : "An error occured",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && "opacity-50"} `}
      aria-label="Save question"
      onClick={handleSave}
    />
  );
};

export default SavedQuestions;
