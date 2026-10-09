import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

function PublicLayout() {
  return (
    <Box minH="100vh" bg="khaki.50">
      <Navbar />

      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
}

export default PublicLayout;