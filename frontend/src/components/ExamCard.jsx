import { Box, Heading, Text, Button, HStack } from "@chakra-ui/react";

function ExamCard({ category, name, description }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="khaki.200"
      borderRadius="14px"
      p={6}
      boxShadow="sm"
      transition="all 0.25s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "md",
        borderColor: "gold.400",
      }}
    >
      <HStack justify="space-between" mb={5}>
        <Text
          fontSize="xs"
          fontWeight="800"
          letterSpacing="0.08em"
          color="gold.600"
        >
          {category}
        </Text>

        <Box
          w="10px"
          h="10px"
          borderRadius="full"
          bg="brand.600"
        />
      </HStack>

      <Heading
        color="brand.900"
        fontSize="xl"
        mb={3}
      >
        {name}
      </Heading>

      <Text
        color="charcoal.600"
        fontSize="sm"
        lineHeight="1.7"
        minH="72px"
      >
        {description}
      </Text>

      <Button
        mt={6}
        variant="outline"
        size="sm"
        borderColor="brand.600"
        color="brand.700"
        _hover={{
          bg: "brand.50",
        }}
      >
        Explore Exam
      </Button>
    </Box>
  );
}

export default ExamCard;