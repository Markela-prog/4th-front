export const verifyUserStatus = async (token) => {
  try {
    const response = await fetch(
      "https://task4-10lg.onrender.com/api/auth/verify",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return response.ok
      ? { isValid: true, status: data.status }
      : { isValid: false, message: data.message, status: "blocked" };
  } catch {
    return {
      isValid: false,
      message: "Failed to verify user status.",
      status: "unknown",
    };
  }
};
