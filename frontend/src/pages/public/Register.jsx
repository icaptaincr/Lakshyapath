import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";

import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    email: "",
    phone: "",
    highestQualification: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    if (
      !formData.fullName ||
      !formData.age ||
      !formData.email ||
      !formData.phone ||
      !formData.highestQualification ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (Number(formData.age) < 18 || Number(formData.age) > 60) {
      setError("Age must be between 18 and 60.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        highestQualification: formData.highestQualification,
        password: formData.password,
      });

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="khaki.50" minH="calc(100vh - 76px)" py={10}>
      <Container maxW="650px">
        <Box
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="18px"
          p={{ base: 5, md: 8 }}
          boxShadow="md"
        >
          <Heading
            textAlign="center"
            color="brand.900"
            fontSize={{ base: "2xl", md: "3xl" }}
            mb={2}
          >
            Create Your LakshyaPath Account
          </Heading>

          <Text
            textAlign="center"
            color="charcoal.500"
            mb={7}
          >
            Start your preparation journey with discipline and consistency.
          </Text>

          {error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="10px"
              p={3}
              mb={5}
            >
              <Text
                color="red.700"
                fontSize="sm"
                fontWeight="600"
              >
                {error}
              </Text>
            </Box>
          )}

          {success && (
            <Box
              bg="green.50"
              border="1px solid"
              borderColor="green.200"
              borderRadius="10px"
              p={3}
              mb={5}
            >
              <Text
                color="green.700"
                fontSize="sm"
                fontWeight="600"
              >
                {success}
              </Text>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">
              <Field.Root>
                <Field.Label>Full Name</Field.Label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Age</Field.Label>
                <Input
                  name="age"
                  type="number"
                  min="18"
                  max="60"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Phone Number</Field.Label>
                <Input
                  name="phone"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>
                  Highest Educational Qualification
                </Field.Label>

                <NativeSelect.Root>
                  <NativeSelect.Field
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select qualification
                    </option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">
                      Post Graduate
                    </option>
                    <option value="Other">Other</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </Field.Root>

              <Button
                type="submit"
                bg="brand.700"
                color="white"
                size="lg"
                loading={loading}
                loadingText="Creating account..."
                _hover={{
                  bg: "brand.800",
                }}
              >
                Create Account
              </Button>

              <Text
                textAlign="center"
                fontSize="sm"
                color="charcoal.600"
              >
                Already have an account?{" "}
                <Box
                  as={RouterLink}
                  to="/login"
                  color="gold.600"
                  fontWeight="700"
                >
                  Login
                </Box>
              </Text>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
}

export default Register;