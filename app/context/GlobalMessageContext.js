"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalMessageContext = createContext();

export const GlobalMessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration); // Clear the message after the specified duration
  };

  return (
    <GlobalMessageContext.Provider value={{ showMessage }}>
      {children}
      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg shadow-lg text-center animate-fade-in">
            <p className="text-white text-lg font-semibold">{message}</p>
          </div>
        </div>
      )}
    </GlobalMessageContext.Provider>
  );
};

export const useGlobalMessage = () => useContext(GlobalMessageContext);
