import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import StudentNavbar from "../components/StudentNavbar";

function StudentLayout() {
  return (
    <Box minH="100vh" bg="khaki.50">
      <StudentNavbar />

      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
}

export default StudentLayout;