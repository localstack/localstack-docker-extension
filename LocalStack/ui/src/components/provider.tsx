import { createDockerDesktopClient } from "@docker/extension-api-client";
import React, { ReactNode } from "react";
import { GlobalDDContext } from "../service/context/GlobalDDContext";

interface Props {
  children: ReactNode;
}
const client = createDockerDesktopClient();

export const GlobalDDProvide = ({ children }: Props) => {
  return (
    <GlobalDDContext.Provider value={{client}}>
      {children}
    </GlobalDDContext.Provider>
  );
};