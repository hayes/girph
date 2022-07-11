import { Resolver, SchemaTypes, Subscriber } from '@pothos/core';

export type Resolvers<Types extends SchemaTypes, Parent> = Record<
  string,
  | Resolver<Parent, {}, Types['Context'], unknown>
  | {
      resolve: Resolver<Parent, {}, Types['Context'], unknown>;
      subscribe: Subscriber<Parent, {}, Types['Context'], unknown>;
    }
>;

export type ResolverMap<Types extends SchemaTypes> = Record<string, Resolvers<Types, unknown>>;

export interface Mock<Types extends SchemaTypes> {
  name: string;
  resolver: Resolver<unknown, unknown, Types['Context'], unknown>;
}
