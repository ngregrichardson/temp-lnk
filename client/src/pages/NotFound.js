import { Flex, Heading, Stack, Text } from "@chakra-ui/react";

const NotFound = () => {
  return (
    <Stack
      as={Flex}
      width={"100vw"}
      height={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      direction={"column"}
      spacing={"30px"}
    >
      <Heading textAlign={"center"}>Uh oh!</Heading>
      <Text textAlign={"center"}>
        It seems like this link has expired or never existed in the first place.
        Maybe you typed it in wrong (case matters!)?
      </Text>
    </Stack>
  );
};

export default NotFound;
