export const ApiError = (statusCode, message, isOperational = true) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    Error.captureStackTrace(error, ApiError);
    return error;
};
