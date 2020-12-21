// https://github.com/sindresorhus/type-fest

export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
  ObjectType,
  Exclude<keyof ObjectType, KeysType>
>;

export type SetRequired<
  BaseType,
  Keys extends keyof BaseType = keyof BaseType
> = Except<BaseType, Keys> &
  Required<Pick<BaseType, Keys>> extends infer InferredType
  ? { [KeyType in keyof InferredType]: InferredType[KeyType] }
  : never;
