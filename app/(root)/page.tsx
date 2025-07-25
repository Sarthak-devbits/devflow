import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getQuestions } from "@/lib/actions/question.action";
import Link from "next/link";

// const questions = [
//   {
//     _id: "1",
//     title: "How to learn React?",
//     description: "I want to learn React, can anyone help me?",
//     content: "",
//     tags: [
//       { _id: "1", name: "React" },
//       { _id: "2", name: "JavaScript" },
//     ],
//     author: {
//       _id: "1",
//       name: "John Doe",
//       image:
//         "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
//     },
//     upvotes: 10,
//     answers: 5,
//     views: 100,
//     createdAt: new Date(),
//   },
//   {
//     _id: "2",
//     title: "How to learn JavaScript?",
//     description: "I want to learn JavaScript, can anyone help me?",
//     content: "",
//     tags: [
//       { _id: "1", name: "JavaScript" },
//       { _id: "2", name: "JavaScript" },
//     ],
//     author: {
//       _id: "1",
//       name: "John Doe",
//       image:
//         "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
//     },
//     upvotes: 10,
//     answers: 5,
//     views: 100,
//     createdAt: new Date("2021-09-01"),
//   },
// ];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function Home({ searchParams }: SearchParams) {
  const { page, pageSize, query = "", filter = "" } = await searchParams;

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });
  const { questions } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          route="/"
        />
      </section>
      <HomeFilter />

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => {
          return (
            <div className="mt-10 flex w-full flex-col gap-6">
              {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>
          );
        }}
      />
    </>
  );
}
