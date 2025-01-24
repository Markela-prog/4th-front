"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalMessage } from "./app/context/GlobalMessageContext";
import { verifyUserStatus } from "./app/utils/authUtils";

const withAuth = (Component) => {
  return (props) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { showMessage } = useGlobalMessage(); // Access the global message system

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem("token");

        const blockMessage = localStorage.getItem("blockMessage");
        if (blockMessage) {
          localStorage.removeItem("blockMessage");
          showMessage(blockMessage);
          router.replace("/auth");
          return;
        }

        if (!token) {
          showMessage("Unauthorized access. Please log in.");
          router.replace("/auth");
          return;
        }

        const { isValid, message } = await verifyUserStatus(token);
        if (!isValid) {
          localStorage.removeItem("token");
          showMessage(message || "You were blocked or unauthorized.");
          router.replace("/auth");
        } else {
          setIsAuthorized(true);
        }

        setIsLoading(false);
      };

      checkAuth();
    }, [router, showMessage]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      );
    }

    return isAuthorized ? <Component {...props} /> : null;
  };
};

export default withAuth;
