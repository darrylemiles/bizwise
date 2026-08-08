const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getPagination = (query) => {
  const page = Math.max(
    Number.parseInt(query.page, 10) || DEFAULT_PAGE,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(query.limit, 10) || DEFAULT_LIMIT,
      1
    ),
    MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const buildPaginationMeta = ({
  page,
  limit,
  total,
}) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export {
  getPagination,
  buildPaginationMeta,
};