export type IdUpdate<T extends { id: K }, K = T['id']> = {
  key: K;
  changes: Partial<T>;
};
