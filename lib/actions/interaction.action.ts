import Interaction, { IInteractionDoc } from "@/database/interaction.model";
import action from "../handlers/action";
import { CreateInteractionSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { User } from "@/database";

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, authorId, performerId, session } = params;
  const { action, actionType } = interaction;

  let performerPoint = 0;
  let authorPoint = 0;

  switch (action) {
    case "upvote":
      performerPoint = 2;
      authorPoint = 10;
      break;
    case "downvote":
      performerPoint = -1;
      authorPoint = -2;
      break;
    case "post":
      authorPoint = actionType == "question" ? 5 : 10;
      break;
    case "delete":
      authorPoint = actionType == "question" ? -5 : -10;
      break;
    default:
      break;
  }
  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      {
        $inc: {
          reputation: authorPoint,
        },
      },
      { session }
    );
    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerPoint } },
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorPoint } },
        },
      },
    ],
    { session }
  );
}

async function createInteraction(
  params: CreateInteractionParams
): Promise<ActionResponse<IInteractionDoc>> {
  const validationResult = await action({
    params: params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { action: actionType, actionId, actionTarget, authorId } = params;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [interaction] = await Interaction.create(
      [
        {
          user: userId,
          action: actionType,
          actionId,
          actionType: actionTarget,
        },
      ],
      { session }
    );

    await updateReputation({
      interaction,
      session,
      performerId: userId!,
      authorId,
    });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(interaction)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
