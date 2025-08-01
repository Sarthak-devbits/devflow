"use server";

import { ClientSession } from "mongoose";
import action from "../handlers/action";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteSchema,
} from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Answer, Question, Vote } from "@/database";
import { error } from "console";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function UpdateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ActionResponse;
  }

  const { targetId, targetType, voteType, change } = params;
  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      {
        $inc: {
          [voteField]: change,
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!result) {
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;
    }
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function CreateVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ActionResponse;
  }

  const { targetId, targetType, voteType } = params;
  const userId = validationResult?.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({
          _id: existingVote._id,
        }).session(session);

        await UpdateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          {
            voteType,
          },
          {
            new: true,
            session,
          }
        );
        await UpdateVoteCount(
          { targetId, targetType, voteType: existingVote.voteType, change: -1 },
          session
        );
        await UpdateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );
      }
    } else {
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        session
      );
      await UpdateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );
    }
    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(targetId));

    return { success: true };
  } catch (error) {
    session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(error) as ErrorResponse;
  }
  const { targetId, targetType } = params;
  const userId = validationResult?.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: false,
        data: {
          hasDownVoted: false,
          hasUpVoted: false,
        },
      };
    }
    return {
      success: true,
      data: {
        hasUpVoted: vote.voteType == "upvote",
        hasDownVoted: vote.voteType == "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
