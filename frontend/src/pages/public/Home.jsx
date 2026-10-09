import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";

import logo from "../../assets/lakshyapath-logo.png";
import ExamCard from "../../components/ExamCard";
import api from "../../services/api";

function Home() {
  const [homeContent, setHomeContent] = useState([]);

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        const response = await api.get("/home-content");
        setHomeContent(response.data.content || []);
      } catch (error) {
        console.error("Home content loading error:", error);
      }
    };
    loadHomeContent();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        position="relative"
        overflow="hidden"
        bg="khaki.50"
        minH={{ base: "auto", lg: "calc(100vh - 76px)" }}
        display="flex"
        alignItems="center"
      >
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="-180px"
          right="-180px"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="gold.100"
          opacity={0.35}
        />

        <Box
          position="absolute"
          bottom="-220px"
          left="-180px"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="brand.100"
          opacity={0.5}
        />

        <Container
          maxW="1280px"
          py={{ base: 14, md: 20, lg: 24 }}
          position="relative"
          zIndex={1}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={{ base: 12, lg: 16 }}
          >
            {/* Left Content */}
            <VStack
              align={{ base: "center", lg: "flex-start" }}
              textAlign={{ base: "center", lg: "left" }}
              maxW="650px"
              gap={6}
            >
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                bg="brand.100"
                color="brand.800"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.08em"
              >
                DISCIPLINE • PREPARATION • ACHIEVEMENT
              </Badge>

              <Heading
                color="brand.900"
                fontSize={{
                  base: "4xl",
                  md: "5xl",
                  lg: "6xl",
                }}
                lineHeight="1.05"
                fontWeight="800"
              >
                Your Goal Is Ahead.
                <Box as="span" display="block" color="gold.600">
                  Find Your Path.
                </Box>
              </Heading>

              <Text
                color="charcoal.600"
                fontSize={{ base: "md", md: "lg" }}
                lineHeight="1.8"
                maxW="590px"
              >
                LakshyaPath helps competitive-exam aspirants organize their
                preparation, track progress, practice smarter, and stay
                focused on the goal that matters.
              </Text>

              <HStack
                gap={4}
                flexWrap="wrap"
                justify={{ base: "center", lg: "flex-start" }}
              >
                <Button
                  as="a"
                  href="/register"
                  size="lg"
                  px={8}
                  bg="brand.700"
                  color="white"
                  borderRadius="8px"
                  _hover={{
                    bg: "brand.800",
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                >
                  Start Your Journey
                </Button>

                <Button
                  as="a"
                  href="#how-it-works"
                  size="lg"
                  px={8}
                  variant="outline"
                  borderColor="brand.600"
                  color="brand.700"
                  borderRadius="8px"
                  _hover={{
                    bg: "brand.50",
                  }}
                >
                  Explore LakshyaPath
                </Button>
              </HStack>

              <Text
                fontSize="sm"
                color="charcoal.500"
                fontWeight="500"
              >
                Built for focused preparation — one step at a time.
              </Text>
            </VStack>

            {/* Logo / Visual */}
            <Box
              w={{ base: "100%", md: "90%", lg: "48%" }}
              maxW="620px"
              display="flex"
              justifyContent="center"
              position="relative"
            >
              <Box
                position="absolute"
                w={{ base: "280px", md: "420px", lg: "500px" }}
                h={{ base: "280px", md: "420px", lg: "500px" }}
                borderRadius="full"
                bg="white"
                opacity={0.75}
                boxShadow="lg"
              />

              <Image
                src={logo}
                alt="LakshyaPath"
                position="relative"
                w="100%"
                h="auto"
                objectFit="contain"
                filter="drop-shadow(0 18px 24px rgba(36, 53, 32, 0.12))"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Preparation Path Preview */}
      <Box
        id="how-it-works"
        bg="brand.800"
        color="white"
        py={{ base: 14, md: 20 }}
      >
        <Container maxW="1200px">
          <VStack gap={4} textAlign="center" mb={12}>
            <Text
              color="gold.300"
              fontSize="sm"
              fontWeight="700"
              letterSpacing="0.12em"
            >
              THE LAKSHYAPATH WAY
            </Text>

            <Heading
              color="white"
              fontSize={{ base: "3xl", md: "4xl" }}
            >
              One Clear Path to Your Goal
            </Heading>

            <Text
              color="khaki.200"
              maxW="650px"
              lineHeight="1.8"
            >
              Turn a large goal into manageable steps. Prepare with
              structure, practice consistently, and measure your progress.
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 4 }}
            gap={5}
          >
            {[
              {
                number: "01",
                title: "Choose Your Exam",
                text: "Select the competitive exam you are preparing for.",
              },
              {
                number: "02",
                title: "Build Your Path",
                text: "Follow subjects and topics through an organized preparation plan.",
              },
              {
                number: "03",
                title: "Practice & Test",
                text: "Strengthen your preparation with questions and mock tests.",
              },
              {
                number: "04",
                title: "Track Progress",
                text: "Understand your performance and keep moving toward your goal.",
              },
            ].map((step) => (
              <Box
                key={step.number}
                bg="brand.700"
                border="1px solid"
                borderColor="brand.600"
                borderRadius="14px"
                p={6}
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  borderColor: "gold.500",
                }}
              >
                <Text
                  color="gold.400"
                  fontSize="sm"
                  fontWeight="800"
                  mb={4}
                >
                  {step.number}
                </Text>

                <Heading
                  color="white"
                  fontSize="lg"
                  mb={3}
                >
                  {step.title}
                </Heading>

                <Text
                  color="khaki.200"
                  fontSize="sm"
                  lineHeight="1.7"
                >
                  {step.text}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {homeContent.length > 0 && (
        <Box bg="brand.900" color="white" py={{ base: 10, md: 14 }}>
          <Container maxW="1200px">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {homeContent.map((item) => (
                <Box key={item._id} bg="rgba(255,255,255,0.06)" border="1px solid" borderColor="brand.600" borderRadius="xl" overflow="hidden">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} w="100%" h="220px" objectFit="cover" />
                  )}
                  <Box p={6}>
                    <Text fontSize="xs" fontWeight="800" color="gold.300" letterSpacing="0.1em">{item.category}</Text>
                    <Heading mt={2} fontSize="xl">{item.title}</Heading>
                    {item.description && <Text mt={3} color="khaki.200" fontSize="sm" lineHeight="1.7">{item.description}</Text>}
                    {item.buttonText && item.buttonLink && (
                      <Button as="a" href={item.buttonLink} mt={5} bg="gold.500" color="brand.900" _hover={{ bg:"gold.400" }}>{item.buttonText}</Button>
                    )}
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      )}

      {/* Exams Section */}
<Box
  id="exams"
  bg="white"
  py={{ base: 14, md: 20 }}
>
  <Container maxW="1200px">
    <VStack
      textAlign="center"
      gap={4}
      mb={12}
    >
      <Text
        color="gold.600"
        fontSize="sm"
        fontWeight="700"
        letterSpacing="0.12em"
      >
        COMPETITIVE EXAMS
      </Text>

      <Heading color="brand.900">
        Prepare With Purpose
      </Heading>

      <Text
        maxW="650px"
        color="charcoal.600"
        lineHeight="1.8"
      >
        Choose your target examination and build a focused
        preparation journey around it.
      </Text>
    </VStack>

    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      gap={6}
    >
      <ExamCard
        category="SSC"
        name="SSC CGL"
        description="Prepare for the Combined Graduate Level examination with structured subjects, topics, practice questions, and mock tests."
      />

      <ExamCard
        category="RRB"
        name="RRB NTPC"
        description="Build a focused preparation path for RRB NTPC with organized learning and continuous performance tracking."
      />

      <ExamCard
        category="DEFENCE"
        name="Defence Exams"
        description="Prepare for competitive defence examinations with disciplined practice and a structured preparation journey."
      />

      <ExamCard
        category="BANKING"
        name="Banking Exams"
        description="Strengthen quantitative aptitude, reasoning, English, and other core areas through consistent practice."
      />

      <ExamCard
        category="UPSC"
        name="UPSC"
        description="Organize your long-term UPSC preparation with structured subjects, topics, and progress tracking."
      />

      <ExamCard
        category="STATE PSC"
        name="State PSC"
        description="Create a focused preparation routine for state-level competitive examinations."
      />
    </SimpleGrid>
  </Container>
</Box>

{/* How it Works Section */}
<Box
  id="how-it-works"
  bg="khaki.50"
  py={{ base: 14, md: 20 }}
>
  <Container maxW="1200px">
    <VStack textAlign="center" gap={4} mb={12}>
      <Text
        color="gold.600"
        fontSize="sm"
        fontWeight="700"
        letterSpacing="0.12em"
      >
        HOW IT WORKS
      </Text>

      <Heading color="brand.900">
        A Clear Path From Goal to Achievement
      </Heading>

      <Text
        maxW="680px"
        color="charcoal.600"
        lineHeight="1.8"
      >
        LakshyaPath keeps your preparation organized so you can
        focus on learning, practicing, testing, and improving.
      </Text>
    </VStack>

    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 4 }}
      gap={6}
    >
      {[
        {
          number: "01",
          title: "Choose Your Exam",
          text: "Select the competitive examination you are preparing for and define your target.",
        },
        {
          number: "02",
          title: "Build Your Path",
          text: "Explore subjects and topics through a structured preparation journey.",
        },
        {
          number: "03",
          title: "Practice & Test",
          text: "Solve questions and attempt mock tests to strengthen your preparation.",
        },
        {
          number: "04",
          title: "Track Progress",
          text: "Monitor your performance, identify weak areas, and stay consistent.",
        },
      ].map((step) => (
        <Box
          key={step.number}
          bg="white"
          border="1px solid"
          borderColor="khaki.200"
          borderRadius="14px"
          p={6}
          boxShadow="sm"
        >
          <Text
            fontSize="sm"
            fontWeight="800"
            color="gold.600"
            letterSpacing="0.08em"
            mb={5}
          >
            {step.number}
          </Text>

          <Heading
            fontSize="lg"
            color="brand.900"
            mb={3}
          >
            {step.title}
          </Heading>

          <Text
            color="charcoal.600"
            fontSize="sm"
            lineHeight="1.7"
          >
            {step.text}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  </Container>
</Box>

{/* About Section */}
<Box
  id="about"
  bg="brand.900"
  color="white"
  py={{ base: 14, md: 20 }}
>
  <Container maxW="1000px">
    <VStack
      textAlign="center"
      gap={5}
    >
      <Text
        color="gold.300"
        fontSize="sm"
        fontWeight="700"
        letterSpacing="0.12em"
      >
        ABOUT LAKSHYAPATH
      </Text>

      <Heading
        fontSize={{ base: "2xl", md: "4xl" }}
      >
        Preparation With Direction
      </Heading>

      <Text
        maxW="760px"
        color="khaki.200"
        lineHeight="1.9"
        fontSize={{ base: "sm", md: "md" }}
      >
        LakshyaPath is designed to help competitive exam aspirants
        bring structure and consistency to their preparation. From
        selecting an examination to practicing questions, attempting
        mock tests, tracking progress, and staying updated with
        important notifications, everything follows one clear path.
      </Text>

      <HStack
        gap={3}
        flexWrap="wrap"
        justify="center"
        pt={3}
      >
        <Box
          px={4}
          py={2}
          border="1px solid"
          borderColor="brand.600"
          borderRadius="full"
          color="khaki.100"
          fontSize="sm"
        >
          Discipline
        </Box>

        <Box
          px={4}
          py={2}
          border="1px solid"
          borderColor="brand.600"
          borderRadius="full"
          color="khaki.100"
          fontSize="sm"
        >
          Preparation
        </Box>

        <Box
          px={4}
          py={2}
          border="1px solid"
          borderColor="brand.600"
          borderRadius="full"
          color="khaki.100"
          fontSize="sm"
        >
          Consistency
        </Box>

        <Box
          px={4}
          py={2}
          border="1px solid"
          borderColor="gold.600"
          borderRadius="full"
          color="gold.300"
          fontSize="sm"
        >
          Achievement
        </Box>
      </HStack>
    </VStack>
  </Container>
</Box>

{/* Footer Section */}
<Box
  bg="charcoal.900"
  color="white"
  py={8}
>
  <Container maxW="1200px">
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "flex-start", md: "center" }}
      gap={6}
    >
      <VStack
        align="flex-start"
        gap={1}
      >
        <Text
          fontWeight="800"
          fontSize="lg"
          color="gold.300"
        >
          LakshyaPath
        </Text>

        <Text
          fontSize="sm"
          color="charcoal.300"
        >
          A clear path to your goal.
        </Text>
      </VStack>

      <HStack
        gap={6}
        fontSize="sm"
        flexWrap="wrap"
      >
        <Text
          cursor="pointer"
          _hover={{ color: "gold.300" }}
        >
          Home
        </Text>

        <Text
          cursor="pointer"
          _hover={{ color: "gold.300" }}
        >
          Exams
        </Text>

        <Text
          cursor="pointer"
          _hover={{ color: "gold.300" }}
        >
          About
        </Text>

        <Text
          cursor="pointer"
          _hover={{ color: "gold.300" }}
        >
          Contact
        </Text>
      </HStack>
    </Flex>

    <Box
      borderTop="1px solid"
      borderColor="charcoal.700"
      mt={8}
      pt={6}
    >
      <Text
        textAlign="center"
        fontSize="xs"
        color="charcoal.400"
      >
        © {new Date().getFullYear()} LakshyaPath. All rights reserved.
      </Text>
    </Box>
  </Container>
</Box>


    </Box>
  );
}

export default Home;