import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Button, Container, Flex, Grid, Heading, Progress, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiArrowLeft, FiBarChart2, FiCheckCircle, FiClock, FiTarget } from "react-icons/fi";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../services/api";

function ProgressPage() {
  const { examId } = useParams();
  const [preparations, setPreparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/progress/overview");
        setPreparations(response.data.preparations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your progress.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = useMemo(() => {
    if (!examId) return null;
    return preparations.find((item) => item.exam?._id === examId) || null;
  }, [preparations, examId]);

  if (loading) return <Flex minH="70vh" align="center" justify="center" bg="khaki.50"><VStack gap={4}><Spinner size="lg" color="brand.600" /><Text color="charcoal.600">Loading your progress...</Text></VStack></Flex>;

  if (error) return <Container maxW="1000px" py={16}><Box bg="white" border="1px solid" borderColor="red.200" borderRadius="xl" p={8} textAlign="center"><Text color="red.600" fontWeight="600" mb={5}>{error}</Text><Button as={RouterLink} to={examId ? `/exams/${examId}` : "/dashboard"} variant="outline" borderColor="brand.600" color="brand.700"><FiArrowLeft /><Text ml={2}>Back</Text></Button></Box></Container>;

  if (examId && !selected) return <Container maxW="1000px" py={16}><Box bg="white" border="1px solid" borderColor="khaki.200" borderRadius="xl" p={8} textAlign="center"><Heading fontSize="lg" color="brand.900" mb={2}>Preparation not started</Heading><Text color="charcoal.500" mb={5}>Start this exam from My Exams to begin tracking your preparation.</Text><Button as={RouterLink} to={`/exams/${examId}`} bg="brand.700" color="white">Open Exam</Button></Box></Container>;

  const cards = examId ? [selected] : preparations;

  return <Box minH="calc(100vh - 76px)" bg="khaki.50" py={10}><Container maxW="1200px">
    <Button as={RouterLink} to={examId ? `/exams/${examId}` : "/dashboard"} variant="ghost" color="brand.700" mb={5}><FiArrowLeft /><Text ml={2}>{examId ? "Back to Exam" : "Dashboard"}</Text></Button>
    <Flex align="center" gap={3} mb={2}><FiBarChart2 size={28} color="#526B48" /><Heading color="brand.900">{examId ? `${selected.exam?.name || "Exam"} Progress` : "My Preparation Progress"}</Heading></Flex>
    <Text color="charcoal.500" mb={8}>Track preparation completion and mock-test performance for every exam you have started.</Text>

    {cards.length === 0 ? <Box bg="white" border="1px dashed" borderColor="khaki.300" borderRadius="xl" p={10} textAlign="center"><FiTarget size={34} style={{margin:"0 auto 14px"}}/><Heading fontSize="lg" color="brand.900" mb={2}>No preparations yet</Heading><Text color="charcoal.500" mb={5}>Choose an exam and click Start Preparation to begin tracking it.</Text><Button as={RouterLink} to="/exams" bg="brand.700" color="white">Explore Exams</Button></Box> : <VStack align="stretch" gap={7}>{cards.map((item) => <PreparationCard key={item.exam?._id} item={item}/>)}</VStack>}
  </Container></Box>;
}

function PreparationCard({ item }) {
  const subjectProgress = item.subjectProgress || [];
  const history = item.testProgress?.history || [];
  const chartData = history.slice().reverse().map((attempt, index) => ({ name: `Test ${index + 1}`, score: attempt.percentage }));
  return <Box bg="white" border="1px solid" borderColor="khaki.200" borderRadius="xl" p={{base:5,md:7}} boxShadow="sm">
    <Flex justify="space-between" align={{base:"flex-start",md:"center"}} direction={{base:"column",md:"row"}} gap={4} mb={6}><Box><Text fontSize="xs" fontWeight="800" color="gold.600" letterSpacing="0.1em">PREPARATION</Text><Heading fontSize="2xl" color="brand.900" mt={1}>{item.exam?.name}</Heading><Text color="charcoal.500" fontSize="sm" mt={1}>{item.exam?.category}</Text></Box><Button as={RouterLink} to={`/exams/${item.exam?._id}`} variant="outline" borderColor="brand.600" color="brand.700">View Exam</Button></Flex>
    <Grid templateColumns={{base:"1fr",md:"repeat(3,1fr)"}} gap={4} mb={7}><Metric label="Preparation" value={`${Math.round(item.overallProgress || 0)}%`} icon={<FiCheckCircle/>}/><Metric label="Tests Attempted" value={item.testProgress?.testsAttempted || 0} icon={<FiBarChart2/>}/><Metric label="Average Accuracy" value={`${item.testProgress?.averageAccuracy || 0}%`} icon={<FiTarget/>}/></Grid>
    <Box mb={7}><Flex justify="space-between" mb={2}><Text fontWeight="700" color="brand.900">Overall Preparation</Text><Text fontWeight="800" color="brand.700">{Math.round(item.overallProgress || 0)}%</Text></Flex><Progress.Root value={item.overallProgress || 0} size="lg" colorPalette="green"><Progress.Track><Progress.Range/></Progress.Track></Progress.Root></Box>
    <Heading fontSize="lg" color="brand.900" mb={4}>Subject Progress</Heading>
    <VStack align="stretch" gap={4} mb={8}>{subjectProgress.length===0?<Text color="charcoal.500">No subject progress available yet.</Text>:subjectProgress.map(subject=><Box key={subject.subjectId?._id || subject.subjectId} p={4} bg="khaki.50" borderRadius="lg"><Flex justify="space-between" mb={2}><Box><Text fontWeight="700" color="brand.800">{subject.subjectId?.name || "Subject"}</Text><Text fontSize="xs" color="charcoal.500">{subject.completedTopics} of {subject.totalTopics} topics completed</Text></Box><Text fontWeight="800" color="brand.700">{Math.round(subject.progressPercentage || 0)}%</Text></Flex><Progress.Root value={subject.progressPercentage || 0} size="sm" colorPalette="green"><Progress.Track><Progress.Range/></Progress.Track></Progress.Root></Box>)}</VStack>
    <Flex justify="space-between" align="center" mb={4}><Box><Heading fontSize="lg" color="brand.900">Mock Test Performance</Heading><Text fontSize="sm" color="charcoal.500">Scores from completed tests for this exam.</Text></Box><HStackLike value={item.testProgress?.highestScore || 0}/></Flex>
    {history.length===0?<Box p={6} bg="khaki.50" borderRadius="lg"><Text color="charcoal.500">No completed mock tests for this exam yet.</Text></Box>:<Box h="280px"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`}/><Tooltip formatter={(value)=>[`${value}%`,"Score"]}/><Bar dataKey="score" fill="#526B48" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Box>}
    {item.testProgress?.latestAttempt && <Box mt={5} p={4} border="1px solid" borderColor="khaki.200" borderRadius="lg"><Flex justify="space-between" wrap="wrap" gap={3}><Box><Text fontWeight="700" color="brand.800">Latest: {item.testProgress.latestAttempt.testTitle}</Text><Text fontSize="xs" color="charcoal.500">{item.testProgress.latestAttempt.submittedAt ? new Date(item.testProgress.latestAttempt.submittedAt).toLocaleString("en-IN") : ""}</Text></Box><Text fontWeight="800" color="gold.700">{item.testProgress.latestAttempt.score} / {item.testProgress.latestAttempt.totalMarks}</Text></Flex></Box>}
  </Box>;
}
function Metric({label,value,icon}){return <Box p={4} bg="khaki.50" borderRadius="lg"><Flex justify="space-between" align="center"><Box><Text fontSize="xs" color="charcoal.500">{label}</Text><Text mt={1} fontSize="2xl" fontWeight="800" color="brand.900">{value}</Text></Box><Box color="brand.700">{icon}</Box></Flex></Box>}
function HStackLike({value}){return <Flex align="center" gap={2} color="gold.700"><FiClock/><Text fontSize="sm" fontWeight="700">Highest: {value}</Text></Flex>}
export default ProgressPage;
