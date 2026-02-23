export * from "./types/index"

declare global {
  type BlogPost = {
    id: string
    title: string
    date: string
  }
}

export {}
