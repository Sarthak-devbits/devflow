import { error } from "console";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import { FilterQuery } from "mongoose";
import { Question, Tag } from "@/database";

export const getTags = async (
  params: PaginatedSearchParams
): Promise<
  ActionResponse<{
    tags: Tag[];
    isNext: boolean;
  }>
> => {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(error) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Tag> = {};

  if (query) {
    filterQuery.$or = [
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }
  try {
    const totalTags = await Tag.countDocuments(filterQuery);
    const tags = await Tag.find(filterQuery)
      .sort(sortCriteria)
      .lean()
      .skip(skip)
      .limit(limit);
    const isNext = skip + tags.length < totalTags;
    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getTagQuestions = async (
  params: GetTagQuestionsParams
): Promise<
  ActionResponse<{
    tag: Tag;
    questions: Question[];
    isNext: boolean;
  }>
> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(error) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, tagId } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }
    const filterQuery: FilterQuery<typeof Question> = {
      tags: { $in: [tagId] },
    };

    if (query) {
      filterQuery.title = { $regex: query, $options: "i" };
    }
    const totalQuestions = await Question.countDocuments(filterQuery);
    const questions = await Question.find(filterQuery)
      .select("_id title views answers upvotes downvotes author createdAt")
      .populate([
        {
          path: "author",
          select: "name image",
        },
        {
          path: "tags",
          select: "name image",
        },
      ])
      .lean()
      .skip(skip)
      .limit(limit);
    const isNext = skip + questions.length < totalQuestions;
    return {
      success: true,
      data: {
        tag: tag,
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
