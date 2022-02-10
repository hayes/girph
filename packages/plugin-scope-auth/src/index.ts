import './global-types';
import { GraphQLFieldResolver } from 'graphql';
import SchemaBuilder, {
  BasePlugin,
  FieldKind,
  PothosInterfaceTypeConfig,
  PothosMutationTypeConfig,
  PothosObjectTypeConfig,
  PothosOutputFieldConfig,
  PothosQueryTypeConfig,
  PothosSubscriptionTypeConfig,
  RootFieldBuilder,
  SchemaTypes,
} from '@pothos/core';
import { resolveHelper } from './resolve-helper';
import {
  createFieldAuthScopesStep,
  createFieldGrantScopesStep,
  createResolveStep,
  createTypeAuthScopesStep,
  createTypeGrantScopesStep,
} from './steps';
import { ResolveStep, TypeAuthScopes, TypeGrantScopes } from './types';

export * from './errors';
export * from './types';

const pluginName = 'scopeAuth' as const;

export default pluginName;
export class PothosScopeAuthPlugin<Types extends SchemaTypes> extends BasePlugin<Types> {
  override wrapResolve(
    resolver: GraphQLFieldResolver<unknown, Types['Context'], object>,
    fieldConfig: PothosOutputFieldConfig<Types>,
  ): GraphQLFieldResolver<unknown, Types['Context'], object> {
    if (this.options.disableScopeAuth) {
      return resolver;
    }

    const typeConfig = this.buildCache.getTypeConfig(fieldConfig.parentType);

    if (typeConfig.graphqlKind !== 'Object' && typeConfig.graphqlKind !== 'Interface') {
      throw new Error(
        `Got fields for ${fieldConfig.parentType} which is a ${typeConfig.graphqlKind} which cannot have fields`,
      );
    }

    const steps = this.createResolveSteps(fieldConfig, typeConfig, resolver);

    if (steps.length > 1) {
      return resolveHelper(steps, this, fieldConfig, this.options.scopeAuthError);
    }

    return resolver;
  }

  createResolveSteps(
    fieldConfig: PothosOutputFieldConfig<Types>,
    typeConfig:
      | PothosInterfaceTypeConfig
      | PothosMutationTypeConfig
      | PothosObjectTypeConfig
      | PothosQueryTypeConfig
      | PothosSubscriptionTypeConfig,
    resolver: GraphQLFieldResolver<unknown, Types['Context'], object>,
  ): ResolveStep<Types>[] {
    const parentAuthScope = typeConfig.pothosOptions.authScopes;
    const parentGrantScopes = typeConfig.pothosOptions.grantScopes;
    const fieldAuthScopes = fieldConfig.pothosOptions.authScopes;
    const fieldGrantScopes = fieldConfig.pothosOptions.grantScopes;

    const interfaceConfigs =
      typeConfig.kind === 'Object' || typeConfig.kind === 'Interface'
        ? typeConfig.interfaces.map((iface) =>
            this.buildCache.getTypeConfig(iface.name, 'Interface'),
          )
        : [];

    const steps: ResolveStep<Types>[] = [];

    if (parentAuthScope && !fieldConfig.pothosOptions.skipTypeScopes) {
      steps.push(
        createTypeAuthScopesStep(
          parentAuthScope as TypeAuthScopes<Types, unknown>,
          typeConfig.name,
        ),
      );
    }

    if (
      !(fieldConfig.kind === 'Interface' || fieldConfig.kind === 'Object') ||
      !fieldConfig.pothosOptions.skipInterfaceScopes
    ) {
      interfaceConfigs.forEach((interfaceConfig) => {
        if (interfaceConfig.pothosOptions.authScopes) {
          steps.push(
            createTypeAuthScopesStep(
              interfaceConfig.pothosOptions.authScopes as TypeAuthScopes<Types, unknown>,
              interfaceConfig.name,
            ),
          );
        }
      });
    }

    if (parentGrantScopes) {
      steps.push(
        createTypeGrantScopesStep(
          parentGrantScopes as TypeGrantScopes<Types, unknown>,
          typeConfig.name,
        ),
      );
    }

    interfaceConfigs.forEach((interfaceConfig) => {
      if (interfaceConfig.pothosOptions.grantScopes) {
        steps.push(
          createTypeGrantScopesStep(
            interfaceConfig.pothosOptions.grantScopes as TypeGrantScopes<Types, unknown>,
            interfaceConfig.name,
          ),
        );
      }
    });

    if (fieldAuthScopes) {
      steps.push(createFieldAuthScopesStep(fieldAuthScopes));
    }

    steps.push(createResolveStep(resolver));

    if (fieldGrantScopes) {
      steps.push(createFieldGrantScopesStep(fieldGrantScopes));
    }

    return steps;
  }
}

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;

fieldBuilderProto.authField = function authField(options) {
  return this.field(options as never);
};

SchemaBuilder.registerPlugin(pluginName, PothosScopeAuthPlugin);
