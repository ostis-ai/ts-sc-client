const commonError = (error: string, msg: string) => {
  throw `${error}: ${msg}`;
};

export const serverError = (msg: string) => {
  commonError("Invalid state of sc-memory", msg);
};

export const invalidValue = (msg: string) => {
  commonError("Invalid value: ", msg);
};
