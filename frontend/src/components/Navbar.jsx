import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Link,
} from "@chakra-ui/react";

import logo from "../assets/lakshyapath-logo.png";

function Navbar() {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="white"
      borderBottom="1px solid"
      borderColor="khaki.200"
      boxShadow="sm"
    >
      <Container maxW="1280px">
        <Flex
          minH="76px"
          align="center"
          justify="space-between"
          gap={6}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            flexShrink={0}
            _hover={{ textDecoration: "none" }}
          >
            <Image
              src={logo}
              alt="LakshyaPath - A Clear Path to Your Goal"
              h={{ base: "48px", md: "58px" }}
              w="auto"
              objectFit="contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <HStack
            display={{ base: "none", lg: "flex" }}
            gap={8}
          >
            <Link
              href="/"
              fontSize="sm"
              fontWeight="600"
              color="brand.800"
              _hover={{
                color: "gold.600",
                textDecoration: "none",
              }}
            >
              Home
            </Link>

            <Link
              href="#exams"
              fontSize="sm"
              fontWeight="600"
              color="charcoal.600"
              _hover={{
                color: "gold.600",
                textDecoration: "none",
              }}
            >
              Exams
            </Link>

            <Link
              href="#how-it-works"
              fontSize="sm"
              fontWeight="600"
              color="charcoal.600"
              _hover={{
                color: "gold.600",
                textDecoration: "none",
              }}
            >
              How It Works
            </Link>

            <Link
              href="#about"
              fontSize="sm"
              fontWeight="600"
              color="charcoal.600"
              _hover={{
                color: "gold.600",
                textDecoration: "none",
              }}
            >
              About
            </Link>
          </HStack>

          {/* Authentication Actions */}
          <HStack gap={3}>
            <Button
              as="a"
              href="/login"
              size="sm"
              variant="outline"
              borderColor="brand.600"
              color="brand.700"
              _hover={{
                bg: "brand.50",
              }}
            >
              Login
            </Button>

            <Button
              as="a"
              href="/register"
              size="sm"
              bg="brand.700"
              color="white"
              _hover={{
                bg: "brand.800",
                transform: "translateY(-1px)",
              }}
            >
              Get Started
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;