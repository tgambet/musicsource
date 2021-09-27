// https://github.com/sindresorhus/type-fest

export type SetRequired<
  BaseType,
  Keys extends keyof BaseType = keyof BaseType
> = Omit<BaseType, Keys> &
  Required<Pick<BaseType, Keys>> extends infer InferredType
  ? { [KeyType in keyof InferredType]: InferredType[KeyType] }
  : never;

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

export type SetOptional<BaseType, Keys extends keyof BaseType> = Simplify<
  // Pick just the keys that are readonly from the base type.
  Omit<BaseType, Keys> &
    // Pick the keys that should be mutable from the base type and make them mutable.
    Partial<Pick<BaseType, Keys>>
>;
