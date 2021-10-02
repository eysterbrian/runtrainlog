// To allow a singleton prisma instance and avoid issues with
// NextJS HMR creating too many connection instances
declare namespace NodeJS {
  export interface Global {
    prisma: PrismaClient;
  }
}
