const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();

export const basePath =
  rawBasePath && rawBasePath !== "/" ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}` : "";

export function withBasePath(path: string) {
  if (!path || !path.startsWith("/") || /^https?:\/\//i.test(path)) {
    return path;
  }

  return `${basePath}${path}`;
}

export const apiPath = withBasePath;
