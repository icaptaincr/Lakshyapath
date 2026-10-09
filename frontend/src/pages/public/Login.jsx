import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/lakshyapath-logo.png";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Clear any previous admin session
      // so student requests always use the student JWT.
      localStorage.removeItem("lakshyapath_admin_token");
      localStorage.removeItem("lakshyapath_admin_user");

      await login(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("STUDENT LOGIN ERROR:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="calc(100vh - 76px)"
      bg="khaki.50"
      py={{ base: 10, md: 16 }}
    >
      <Container maxW="1100px">
        <Flex
          direction={{ base: "column", md: "row" }}
          minH={{ md: "620px" }}
          bg="white"
          borderRadius="20px"
          overflow="hidden"
          boxShadow="lg"
          border="1px solid"
          borderColor="khaki.200"
        >
          {/* Left Section */}
          <Flex
            flex="1"
            bg="brand.900"
            color="white"
            p={{ base: 8, md: 12 }}
            direction="column"
            justify="center"
          >
            <Image
              src={logo}
              alt="LakshyaPath"
              w="190px"
              mb={8}
              bg="white"
              borderRadius="12px"
              p={2}
            />

            <Text
              color="gold.300"
              fontSize="sm"
              fontWeight="700"
              letterSpacing="0.12em"
              mb={4}
            >
              WELCOME BACK
            </Text>

            <Heading
              fontSize={{ base: "2xl", md: "4xl" }}
              lineHeight="1.15"
              mb={5}
            >
              Continue Your
              <br />
              Preparation Journey.
            </Heading>

            <Text
              color="khaki.200"
              lineHeight="1.8"
              maxW="430px"
            >
              Log in to access your exams, subjects, practice
              questions, mock tests, progress, and important
              notifications.
            </Text>
          </Flex>

          {/* Login Form */}
          <Flex
            flex="1"
            p={{ base: 8, md: 12 }}
            align="center"
            justify="center"
          >
            <Box w="100%" maxW="420px">
              <VStack align="stretch" gap={6}>
                <Box>
                  <Heading
                    color="brand.900"
                    fontSize="2xl"
                    mb={2}
                  >
                    Student Login
                  </Heading>

                  <Text
                    color="charcoal.500"
                    fontSize="sm"
                  >
                    Sign in to continue to your LakshyaPath account.
                  </Text>
                </Box>

                {error && (
                  <Box
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    borderRadius="8px"
                    px={4}
                    py={3}
                  >
                    <Text
                      color="red.700"
                      fontSize="sm"
                    >
                      {error}
                    </Text>
                  </Box>
                )}

                <Box as="form" onSubmit={handleSubmit}>
                  <VStack align="stretch" gap={5}>
                    <Box>
                      <Text
                        mb={2}
                        fontSize="sm"
                        fontWeight="600"
                        color="charcoal.700"
                      >
                        Email Address
                      </Text>

                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        size="lg"
                        borderColor="khaki.300"
                        _focus={{
                          borderColor: "brand.600",
                          boxShadow:
                            "0 0 0 1px #3D5636",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text
                        mb={2}
                        fontSize="sm"
                        fontWeight="600"
                        color="charcoal.700"
                      >
                        Password
                      </Text>

                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        size="lg"
                        borderColor="khaki.300"
                        _focus={{
                          borderColor: "brand.600",
                          boxShadow:
                            "0 0 0 1px #3D5636",
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      size="lg"
                      bg="brand.700"
                      color="white"
                      loading={loading}
                      loadingText="Signing in..."
                      _hover={{
                        bg: "brand.800",
                        transform: "translateY(-1px)",
                      }}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </Box>

                <Text
                  textAlign="center"
                  fontSize="sm"
                  color="charcoal.600"
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#A97D21",
                      fontWeight: "700",
                    }}
                  >
                    Create Account
                  </Link>
                </Text>

                <Text
                  textAlign="center"
                  fontSize="xs"
                  color="charcoal.400"
                >
                  Admin?{" "}
                  <Link
                    to="/admin/login"
                    style={{
                      color: "#526B48",
                      fontWeight: "600",
                    }}
                  >
                    Admin Login
                  </Link>
                </Text>
              </VStack>
            </Box>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Login;