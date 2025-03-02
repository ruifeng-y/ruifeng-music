// // src/database/factories/content.factory.ts
// export type IUserFactoryOptions = Partial<{
//     [key in keyof UserEntity]: UserEntity[key];
// }>;
// export const UserFactory = defineFactory(
//     UserEntity,
//     async (configure: Configure, settings: IUserFactoryOptions = {}) => {
//         const faker = new fakerjs.Faker({
//             locale: await getFakerLocales(configure),
//         });
//         const user = new UserEntity();
//         const optionals: (keyof IUserFactoryOptions)[] = ['username', 'password', 'email', 'phone'];
//         optionals.forEach((key) => {
//             if (settings[key] !== undefined) {
//                 user[key] = settings[key] as any;
//             }
//         });
//         user.nickname = settings.nickname ?? faker.person.fullName();
//         return user;
//     },
// );