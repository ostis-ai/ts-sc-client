const commonError = (error: string, msg: string) => {
  throw `${error}: ${msg}`;
};

export const knowledgeBaseError = (msg: string) => {
  commonError("Invalid state of knowledge base", msg);
};

export const invalidValue = (msg: string) => {
  commonError("Invalid value: ", msg);
};
