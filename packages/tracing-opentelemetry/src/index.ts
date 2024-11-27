import { type Span, type Tracer, context as opentelemetryContext, trace } from '@opentelemetry/api';
import { createSpanWithParent, runFunction } from '@pothos/plugin-tracing';
import { type GraphQLFieldResolver, type GraphQLResolveInfo, print } from 'graphql';
import { AttributeNames, SpanNames } from './enums';

export * from './enums';

export interface TracingWrapperOptions<T> {
  includeArgs?: boolean;
  includeSource?: boolean;
  ignoreError?: boolean;
  onSpan?: (
    span: Span,
    options: T,
    parent: unknown,
    args: {},
    context: object,
    info: GraphQLResolveInfo,
  ) => void;
}

export function createOpenTelemetryWrapper<T = unknown>(
  tracer: Tracer,
  options?: TracingWrapperOptions<T>,
) {
  return <Context extends object = object>(
    resolver: GraphQLFieldResolver<unknown, Context, Record<string, unknown>>,
    fieldOptions: T,
    tracingOptions?: TracingWrapperOptions<T>,
  ) =>
    (
      parent: unknown,
      args: {},
      context: Context,
      info: GraphQLResolveInfo,
      abortSignal: AbortSignal | undefined,
    ) => {
      const span = createSpanWithParent<Span>(context, info, (path, parentSpan) => {
        const spanContext = parentSpan
          ? trace.setSpan(opentelemetryContext.active(), parentSpan)
          : undefined;

        const newSpan = tracer.startSpan(
          SpanNames.RESOLVE,
          {
            attributes: {
              [AttributeNames.FIELD_NAME]: info.fieldName,
              [AttributeNames.FIELD_PATH]: path,
              [AttributeNames.FIELD_TYPE]: info.returnType.toString(),
            },
          },
          spanContext,
        );

        if (tracingOptions?.includeSource ?? options?.includeSource) {
          newSpan.setAttribute(AttributeNames.SOURCE, print(info.fieldNodes[0]));
        }

        if (tracingOptions?.includeArgs ?? options?.includeArgs) {
          newSpan.setAttribute(AttributeNames.FIELD_ARGS, JSON.stringify(args, null, 2));
        }

        return newSpan;
      });

      tracingOptions?.onSpan?.(span, fieldOptions, parent, args, context, info);
      options?.onSpan?.(span, fieldOptions, parent, args, context, info);

      return runWithSpan(span, !!(tracingOptions?.ignoreError ?? options?.ignoreError), () =>
        resolver(parent, args, context, info, abortSignal),
      );
    };
}

function runWithSpan<T>(span: Span, recordException: boolean, fn: () => T) {
  const contextWithSpanSet = trace.setSpan(opentelemetryContext.active(), span);

  return opentelemetryContext.with(contextWithSpanSet, () =>
    runFunction(fn, (error) => {
      if (error && recordException) {
        span.recordException(error as Error);
      }
      span.end();
    }),
  );
}
