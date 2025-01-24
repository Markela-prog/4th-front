export const apiRequest = async (url, options = {}, router, logout) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const data = await response.json();
      const blockMessages = {
        403: "Your account has been blocked.",
        404: "Your account has been deleted.",
      };

      if ([403, 404].includes(response.status)) {
        localStorage.setItem("blockMessage", blockMessages[response.status]);
        localStorage.removeItem("token");
        logout();
        return null;
      }

      throw new Error(data.message || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error.message);
    return null;
  }
};
