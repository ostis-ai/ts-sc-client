const commonError = (error: string, msg: string) => {
  throw `${error}: ${msg}`;
};

export const invalidValue = (msg: string) => {
  commonError("Invalid value: ", msg);
};
