"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthInput = ({ type, id, placeholder, value, onChange, icon }) => (
  <div className="mb-4 relative">
    <input
      className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    <i className="absolute right-3 top-2 text-white font-normal not-italic">
      {icon}
    </i>
  </div>
);

export default function Auth() {
  const [authState, setAuthState] = useState({
    isLogin: true,
    fullName: "",
    email: "",
    password: "",
    errorMessage: "",
    loading: false,
  });
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Manually parse the message from the URL
    const query = new URLSearchParams(window.location.search);
    const queryMessage = query.get("message");
    if (queryMessage) {
      setMessage(queryMessage);
    }
  }, []);

  useEffect(() => {
    const blockMessage = localStorage.getItem("blockMessage");
    if (blockMessage) {
      setAuthState((prevState) => ({
        ...prevState,
        errorMessage: blockMessage,
      }));
      localStorage.removeItem("blockMessage");
    }
  }, []);

  const toggleAuthMode = () => {
    setAuthState((prevState) => ({
      ...prevState,
      isLogin: !prevState.isLogin,
      errorMessage: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthState((prevState) => ({
      ...prevState,
      loading: true,
      errorMessage: "",
    }));

    const { isLogin, fullName, email, password } = authState;

    try {
      const endpoint = `https://task4-10lg.onrender.com/api/${
        isLogin ? "login" : "register"
      }`;
      const bodyData = isLogin
        ? { email, password }
        : { name: fullName, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "An unknown error occurred." }));
        setAuthState((prevState) => ({
          ...prevState,
          errorMessage:
            errorData.message || "Something went wrong. Please try again.",
          loading: false,
        }));
        return;
      }

      const { token } = await response.json();
      localStorage.setItem("token", token);
      router.push("/");
    } catch {
      setAuthState((prevState) => ({
        ...prevState,
        errorMessage: "Failed to process your request. Please try again later.",
        loading: false,
      }));
    }
  };

  const { isLogin, fullName, email, password, errorMessage, loading } =
    authState;

  return (
    <div className="min-h-screen flex justify-center items-center relative bg-gradient-to-b from-purple-800 to-purple-900">
      {/* Background Image */}

      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url('/images/back.jpg')` }}
      ></div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>

      {/* Auth Card */}
      <div className="relative z-10 bg-white bg-opacity-10 rounded-xl shadow-xl p-4 max-w-xs w-full backdrop-blur-lg border border-white border-opacity-20">
        <h2 className="text-center text-2xl font-bold text-white mb-4">
          {isLogin ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-center text-gray-300 mb-6">
          {isLogin
            ? "Access your account and continue your journey."
            : "Create a new account to get started."}
        </p>
        {errorMessage && (
          <p className="text-center text-red-500 mb-4">{errorMessage}</p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <AuthInput
              type="text"
              id="name"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setAuthState((prevState) => ({
                  ...prevState,
                  fullName: e.target.value,
                }))
              }
              icon="👤"
            />
          )}
          <AuthInput
            type="email"
            id="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setAuthState((prevState) => ({
                ...prevState,
                email: e.target.value,
              }))
            }
            icon="📧"
          />
          <AuthInput
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setAuthState((prevState) => ({
                ...prevState,
                password: e.target.value,
              }))
            }
            icon="🔒"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg font-semibold transition ${
              loading && "opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-white text-sm mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="underline hover:text-purple-300"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
