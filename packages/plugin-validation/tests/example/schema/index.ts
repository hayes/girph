import * as zod from 'zod';
// import type { ValidationOptions } from '../../../src';
import builder from '../builder';

// interface RecursiveShape {
//   number: number;
//   recurse?: RecursiveShape;
// }
// const Recursive = builder.inputRef<RecursiveShape>('Recursive');

// const numberValidation: ValidationOptions<number> = {
//   max: 5,
// };

// Recursive.implement({
//   validate: [(fields) => fields.number !== 3, { message: 'number must not be 3' }],
//   fields: (t) => ({
//     number: t.int({
//       required: true,
//       validate: numberValidation,
//     }),
//     float: t.float({
//       required: true,
//       validate: (val) => val % 1 !== 0,
//     }),
//     recurse: t.field({
//       required: false,
//       type: Recursive,
//     }),
//   }),
// });

// enum Enum1 {
//   One = 0,
//   Two = 1,
//   Three = 2,
// }

// const Enum1Type = builder.enumType(Enum1, {
//   name: 'Enum1',
// });

// const ContactInfo = builder.inputType('ContactInfo', {
//   fields: (t) => ({
//     name: t.string({
//       required: true,
//       validate: {
//         maxLength: 30,
//         refine: [
//           async (name) => Promise.resolve(name[0].toUpperCase() === name[0]),
//           { message: 'Name should be capitalized' },
//         ],
//       },
//     }),
//     aliases: t.stringList({
//       validate: {
//         items: {
//           maxLength: 30,
//         },
//         refine: [
//           (list) => list.every((alias) => alias[0].toUpperCase() === alias[0]),
//           { message: 'Aliases should be capitalized' },
//         ],
//       },
//     }),
//     email: t.string({
//       required: true,
//       validate: {
//         email: true,
//         refine: [
//           (arg) => arg.split('@')[1] !== 'example.com',
//           { message: 'no example.com email addresses' },
//         ],
//       },
//     }),
//     phone: t.string({
//       validate: {
//         schema: zod
//           .string()
//           .trim()
//           .regex(/^\d{3}-\d{3}-\d{4}$/u),
//         length: 12,
//       },
//     }),
//   }),
// });

// builder.queryType({
//   fields: (t) => ({
//     simple: t.boolean({
//       nullable: true,
//       args: {
//         email: t.arg.string({
//           validate: {
//             email: true,
//           },
//         }),
//         phone: t.arg.string({
//           validate: {
//             schema: zod.string().trim(),
//           },
//         }),
//       },
//       validate: async (args) => Promise.resolve(!!args.phone || !!args.email),
//       resolve: () => true,
//     }),
//     withMessage: t.boolean({
//       nullable: true,
//       args: {
//         email: t.arg.string({
//           validate: {
//             email: [true, { message: 'invalid email address' }],
//           },
//         }),
//         phone: t.arg.string(),
//       },
//       validate: [
//         (args) => !!args.phone || !!args.email,
//         { message: 'Must provide either phone number or email address' },
//       ],
//       resolve: () => true,
//     }),
//     list: t.boolean({
//       nullable: true,
//       args: {
//         list: t.arg.stringList({
//           validate: {
//             items: {
//               maxLength: 3,
//             },
//             maxLength: 3,
//           },
//         }),
//       },
//       resolve: () => true,
//     }),
//     exampleField: t.int({
//       args: {
//         enum1: t.arg({
//           type: [Enum1Type],
//           validate: {
//             refine: (val) => val[0] === Enum1.One,
//           },
//         }),
//         recursive: t.arg({
//           type: Recursive,
//           required: true,
//         }),
//         odd: t.arg.int({
//           validate: {
//             max: 5,
//             refine: [(n) => n % 2 === 1, { message: 'number must be odd' }],
//           },
//           required: true,
//         }),
//         contactInfo: t.arg({
//           type: ContactInfo,
//           validate: {
//             refine: [
//               [
//                 (info) => info.email.toLocaleLowerCase() === info.email,
//                 {
//                   path: ['email'],
//                   message: 'email should be lowercase',
//                 },
//               ],
//             ],
//           },
//         }),
//       },
//       validate: [
//         (args) => (args.contactInfo?.aliases?.length ?? 0) > 1,
//         {
//           path: ['contactInfo', 'aliases'],
//           message: 'contactInfo should include at least 2 aliases',
//         },
//       ],
//       resolve(_parent, args) {
//         return args.odd;
//       },
//     }),
//     all: t.boolean({
//       description: 'all possible validations, (these constraints cant be satisfied',
//       args: {
//         number: t.arg.float({
//           validate: {
//             type: 'number',
//             positive: true,
//             negative: true,
//             nonnegative: true,
//             nonpositive: true,
//             int: true,
//             min: 5,
//             max: 5,
//             refine: () => true,
//           },
//         }),
//         bigint: t.arg.id({
//           validate: {
//             type: 'bigint',
//             refine: () => true,
//           },
//         }),
//         string: t.arg.string({
//           validate: {
//             type: 'string',
//             email: true,
//             url: true,
//             uuid: true,
//             regex: /abc/u,
//             length: 5,
//             maxLength: 5,
//             minLength: 5,
//             refine: () => true,
//           },
//         }),
//         object: t.arg({
//           required: false,
//           type: Recursive,
//           validate: {
//             refine: (obj) => !obj.recurse,
//           },
//         }),
//         array: t.arg.stringList({
//           validate: {
//             type: 'array',
//             length: 5,
//             minLength: 5,
//             maxLength: 5,
//             items: {
//               type: 'string',
//               maxLength: 5,
//             },
//             refine: () => true,
//           },
//         }),
//       },
//       resolve: () => true,
//     }),
//     argsSchema: t.boolean({
//       nullable: true,
//       args: {
//         num: t.arg.int(),
//         string: t.arg.string(),
//       },
//       validate: {
//         schema: zod.object({ num: zod.number().min(2), string: zod.string().min(2) }),
//       },
//       resolve: () => true,
//     }),
//   }),
// });

// const WithValidationInput = builder.inputType('WithValidationInput', {
//   fields: (t) => ({
//     name: t.string(),
//     age: t.int(),
//   }),
//   validate: [
//     [(args) => args.name === 'secret', { message: 'Incorrect name given' }],
//     [(args) => args.age === 100, { message: 'Incorrect age given' }],
//   ],
// });
// const WithValidationAndFieldValidator = builder.inputType('WithValidationAndFieldValidator', {
//   fields: (t) => ({
//     name: t.string({ validate: () => true }),
//     age: t.int(),
//   }),
//   validate: [
//     [(args) => args.name === 'secret', { message: 'Incorrect name given' }],
//     [(args) => args.age === 100, { message: 'Incorrect age given' }],
//   ],
// });

// const NestedInput = builder.inputType('NestedInput', {
//   fields: (t) => ({ id: t.id() }),
// });

// const SoloNestedInput = builder.inputType('SoloNestedInput', {
//   fields: (t) => ({
//     nested: t.field({
//       required: true,
//       type: NestedInput,
//       validate: {
//         schema: zod.object({ id: zod.string().min(2) }),
//       },
//     }),
//   }),
// });

// const NestedObjectListInput = builder.inputType('NestedObjectListInput', {
//   fields: (t) => ({
//     nested: t.field({
//       required: true,
//       type: [NestedInput],
//       validate: {
//         schema: zod.array(zod.object({ id: zod.string().min(2) })),
//       },
//     }),
//   }),
// });

// const WithSchemaInput = builder.inputType('WithSchemaInput', {
//   fields: (t) => ({
//     name: t.string(),
//   }),
//   validate: {
//     schema: zod.object({ name: zod.string().min(2) }),
//   },
// });

// builder.queryField('soloNested', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: SoloNestedInput }),
//     },
//     resolve: () => true,
//   }),
// );

// builder.queryField('nestedObjectList', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: NestedObjectListInput }),
//     },
//     resolve: () => true,
//   }),
// );

// builder.queryField('withValidationInput', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: WithValidationInput }),
//     },
//     resolve: () => true,
//   }),
// );

// builder.queryField('withValidationAndFieldValidator', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: WithValidationAndFieldValidator }),
//     },
//     resolve: () => true,
//   }),
// );

// builder.queryField('withSchemaInput', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: WithSchemaInput }),
//     },
//     resolve: () => true,
//   }),
// );

// builder.queryField('withSchemaInputList', (t) =>
//   t.boolean({
//     nullable: true,
//     args: {
//       input: t.arg({ type: [WithSchemaInput] }),
//     },
//     resolve: () => true,
//   }),
// );

const someSchema = zod.unknown();

// Schema for inputs
const SomeInput = builder.inputType('SomeInput', {
  validate: someSchema,
  fields: (t) => ({
    someField: t.string({ validate: someSchema }).validate(someSchema),
  }),
});

builder.queryFields((t) => ({
  someQuery: t.string({
    args: {
      someArg: t.arg.string({ validate: someSchema }).validate(someSchema),
      someInput: t.arg({ type: SomeInput }).validate(someSchema),
    },
    validate: someSchema,
    resolve: () => 'result',
  }),
}));

export default builder.toSchema();
