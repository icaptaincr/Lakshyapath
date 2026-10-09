import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";

import { FiLock, FiMail, FiArrowLeft } from "react-icons/fi";

import api from "../../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/admin-login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("ADMIN LOGIN RESPONSE:", response.data);

      const token = response.data.token;
      const user = response.data.user;

      if (!token) {
        throw new Error("Admin token was not received.");
      }

      // Clear student authentication
      localStorage.removeItem("lakshyapath_token");
      localStorage.removeItem("lakshyapath_user");

      // Store admin authentication
      localStorage.setItem("lakshyapath_admin_token", token);
      localStorage.setItem(
        "lakshyapath_admin_user",
        JSON.stringify(user)
      );

      // IMPORTANT: go directly to admin dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 76px)" bg="khaki.50" py={12}>
      <Container maxW="500px">
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          boxShadow="md"
        >
          <VStack gap={6} align="stretch">
            <Box textAlign="center">
              <Heading
                color="brand.900"
                fontSize="2xl"
                mb={2}
              >
                Admin Login
              </Heading>

              <Text color="charcoal.600" fontSize="sm">
                Sign in to manage LakshyaPath
              </Text>
            </Box>

            {error && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
                p={3}
              >
                <Text color="red.600" fontSize="sm">
                  {error}
                </Text>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={5} align="stretch">
                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Email
                  </Text>

                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={1}
                      color="charcoal.500"
                    >
                      <FiMail />
                    </Box>

                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      pl="40px"
                    />
                  </Box>
                </Box>

                <Box>
                  <Text
                    mb={2}
                    fontWeight="600"
                    color="brand.900"
                  >
                    Password
                  </Text>

                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={1}
                      color="charcoal.500"
                    >
                      <FiLock />
                    </Box>

                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      pl="40px"
                    />
                  </Box>
                </Box>

                <Button
                  type="submit"
                  bg="brand.800"
                  color="white"
                  size="lg"
                  loading={loading}
                  loadingText="Signing in..."
                  _hover={{
                    bg: "brand.900",
                  }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Link
              as={RouterLink}
              to="/login"
              color="brand.700"
              fontSize="sm"
              textAlign="center"
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <FiArrowLeft />
              Student Login
            </Link>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

export default AdminLogin;