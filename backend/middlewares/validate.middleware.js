const validate = (
  schema,
  source = 'body'
) => {
  return (req, res, next) => {
    const result = schema.safeParse(
      req[source]
    );

    if (!result.success) {
      const error = new Error(
        'Validation failed'
      );

      error.statusCode = 400;

      error.errors =
        result.error.issues.map(
          (issue) => ({
            field:
              issue.path.length > 0
                ? issue.path.join('.')
                : '',
            message: issue.message,
          })
        );

      return next(error);
    }

    // Store validated data without
    // mutating Express request properties.
    req.validated = req.validated || {};

    req.validated[source] =
      result.data;

    next();
  };
};

export default validate;