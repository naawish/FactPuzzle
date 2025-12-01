// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_NINJAS_KEY: string;
    }
  }
}

export {};