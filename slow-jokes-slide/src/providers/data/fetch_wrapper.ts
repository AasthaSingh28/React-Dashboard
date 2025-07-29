import { message } from "antd";
import { error } from "console";
import { GraphQLError } from "graphql";
type Error ={
    message: string;
    statusCode: string;
}

const customFetch = async (url: string, options: RequestInit = {}) => {
    const accessToken = localStorage.getItem("accessToken");
    const headers = {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Apollo-Required-Preflight": "true",
    } as Record<string, string>;
  
    return await fetch(url, {
        ...options,
        headers
    });
};

type GraphQLClientError = {
    message: string;
    statusCode: string;
};
const getGraphQLErrors = (
  body: { errors: GraphQLError[] } | undefined | null,
): Error | null => {
  if (!body) {
    return {
      message: "An error occurred while fetching data.",
      statusCode: "Internal Server Error",
    };
  }

  if ("errors" in body && Array.isArray(body.errors) && body.errors.length > 0) {
    const errors = body.errors;
    const message = errors.map((error) => error.message).join(", ");
    const code =
      errors[0].extensions?.code || "Unknown Error";  // extensions may be undefined, optional chaining used

    return {
      message: message || JSON.stringify(errors),
      statusCode: code,
    };
  }

  return null;
};

const fetchWrapper = async (url: string, options: RequestInit = {}) => {
    const response = await customFetch(url, options);
    const responseCLone = response.clone();
    const body = await responseCLone.json().catch(() => null);
    const errors = getGraphQLErrors(body);
    if (error){
        throw error ;
    }
    return response;
};