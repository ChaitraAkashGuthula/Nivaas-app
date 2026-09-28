export const startLogin = (redirectPath?: string) => {
  const url = new URL(window.location.origin + "/login");
  if (redirectPath) {
    url.searchParams.set("redirect", redirectPath);
  }
  window.location.href = url.toString();
};
