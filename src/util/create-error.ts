export const createError = (status: number, message: string) => {
  const error = new Error(message) as Error & {
    status?: number;
  };
  //   console.log("new error", error);

  error.status = status;

  //   console.log(error);

  return error;
};

// createError(404, "something went wrong");
