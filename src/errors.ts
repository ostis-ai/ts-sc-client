function CommonError(error: string, msg: string) {
  throw `${error}: ${msg}`;
}

export function KnowledgeBaseError(msg: string) {
  CommonError("Invalid state of knowledge base", msg);
}

export function InvalidValue(msg: string) {
  CommonError("Invalid value: ", msg);
}
