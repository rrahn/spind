import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { io } from "socket.io-client";

/** Provides context to the global socket instance */
// TODO: Configure the socket.io client to connect to the server with the correct URL.
export const SocketContext = createContext(io());

export function SocketProvider({ children }: { children: ReactNode }) {

  // Initialize the current contact to empty data (maybe the placeholder data?).
  const socket = useContext(SocketContext);

  // TODO: the socket is automatically connected, but later we may connect it only if the booking page is loaded.
  useEffect(() => {
    // Connect to the server
    // socket.connect();
    socket.on('connect', () => {console.log("Connected to the server with id: <%s>", socket.id )});
    socket.on('disconnect', () => {console.log("Disconnected from the server with id: <%s>", socket.id )});
    // Disconnect from the server when the component is unmounted
    // return () => {
    //   console.log("Disconnecting from the server with id: <%s>", socket.id);
    //   socket.disconnect();
    // }
  }, []);

  // Return the context provider with the configured socket.io client
  return (
    <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
  );
}
