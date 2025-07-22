import { getTags } from "@/lib/actions/tag.actions";
import React from "react";

const Tags = async () => {
  const { success, error, data } = await getTags({
    page: 1,
    pageSize: 10,
  });
  const { tags } = data || [];

  return <div>Tags</div>;
};

export default Tags;
