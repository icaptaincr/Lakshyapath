import { useEffect, useState } from "react";
import { Box, Button, Container, Flex, HStack, Image, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import logo from "../assets/lakshyapath-logo.png";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function StudentNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  const loadUnread = async () => {
    try {
      const response = await api.get("/user-notifications/unread-count");
      setUnread(response.data.unreadCount || 0);
    } catch {
      setUnread(0);
    }
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box as="header" position="sticky" top="0" zIndex="1000" bg="white" borderBottom="1px solid" borderColor="khaki.200" boxShadow="sm">
      <Container maxW="1280px">
        <Flex minH="76px" align="center" justify="space-between" gap={6}>
          <Link as={RouterLink} to="/dashboard" flexShrink={0} _hover={{ textDecoration: "none" }}>
            <Image src={logo} alt="LakshyaPath" h={{ base: "48px", md: "58px" }} w="auto" objectFit="contain" />
          </Link>

          <HStack display={{ base: "none", lg: "flex" }} gap={6}>
            <Link as={RouterLink} to="/dashboard" fontSize="sm" fontWeight="600" color="brand.800" _hover={{ color: "gold.600", textDecoration: "none" }}>Dashboard</Link>
            <Link as={RouterLink} to="/exams" fontSize="sm" fontWeight="600" color="charcoal.600" _hover={{ color: "gold.600", textDecoration: "none" }}>My Exams</Link>
            <Link as={RouterLink} to="/exams" fontSize="sm" fontWeight="600" color="charcoal.600" _hover={{ color: "gold.600", textDecoration: "none" }}>Mock Tests</Link>
            <Link as={RouterLink} to="/progress" fontSize="sm" fontWeight="600" color="charcoal.600" _hover={{ color: "gold.600", textDecoration: "none" }}>Progress</Link>
            <Link as={RouterLink} to="/notifications" position="relative" color="charcoal.600" _hover={{ color: "gold.600" }} aria-label="Notifications">
              <FiBell size={20} />
              {unread > 0 && <Box position="absolute" top="-8px" right="-10px" minW="18px" h="18px" px="1" bg="red.500" color="white" borderRadius="full" fontSize="10px" fontWeight="800" display="flex" alignItems="center" justifyContent="center">{unread > 99 ? "99+" : unread}</Box>}
            </Link>
          </HStack>

          <HStack gap={3}>
            <Link as={RouterLink} to="/notifications" display={{ base: "flex", lg: "none" }} position="relative" color="brand.700" aria-label="Notifications">
              <FiBell size={21} />
              {unread > 0 && <Box position="absolute" top="-8px" right="-8px" minW="17px" h="17px" bg="red.500" color="white" borderRadius="full" fontSize="9px" fontWeight="800" display="flex" alignItems="center" justifyContent="center">{unread > 9 ? "9+" : unread}</Box>}
            </Link>
            <Box display={{ base: "none", md: "block" }} textAlign="right">
              <Text fontSize="sm" fontWeight="700" color="brand.800">{user?.fullName || "Student"}</Text>
              <Text fontSize="xs" color="charcoal.500">Student</Text>
            </Box>
            <Button size="sm" variant="outline" borderColor="brand.600" color="brand.700" onClick={handleLogout} _hover={{ bg: "brand.50" }}>Logout</Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
export default StudentNavbar;
