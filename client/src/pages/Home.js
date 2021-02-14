import {
  Button,
  Code,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { addDays, endOfDay, format } from "date-fns";
import { useFormik } from "formik";
import { useClipboard } from "use-clipboard-copy";
import * as yup from "yup";

const formSchema = yup.object().shape({
  redirectTo: yup.string().url("Invalid url.").required("Required."),
  type: yup.string().oneOf(["CLICKS", "DAYS"]),
  maxClicks: yup
    .number()
    .min(1, "The maximum number of clicks must be greater than 0.")
    .required("Required"),
  maxDays: yup
    .number()
    .min(0, "The maximum number of days must be greater than or equal to 0.")
    .required("Required"),
});

const Home = () => {
  const { copy } = useClipboard();
  const toast = useToast();

  const handleCreateLink = ({ redirectTo, type, maxClicks, maxDays }) => {
    return fetch("/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        redirectTo,
        type,
        maxClicks: type === "CLICKS" ? parseInt(maxClicks, 10) : null,
        expirationDate:
          type === "DAYS"
            ? endOfDay(addDays(new Date(), parseInt(maxDays, 10)))
            : null,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.type === "success") {
          copy(res.data);
          resetForm();
          toast({
            status: "success",
            title: "Link created",
            description:
              "Your link was created and was copied to your clipboard.",
            position: "bottom-right",
            isClosable: true,
          });
        } else {
          toast({
            status: "error",
            title: "Something went wrong",
            description: res.message,
            position: "bottom-right",
            isClosable: true,
          });
        }
      })
      .catch((e) => {
        toast({
          status: "error",
          title: "Something went wrong",
          description: e.message,
          position: "bottom-right",
          isClosable: true,
        });
      });
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    handleBlur,
    handleSubmit,
    resetForm,
    isSubmitting,
  } = useFormik({
    initialValues: {
      redirectTo: "",
      type: "CLICKS",
      maxClicks: "10",
      maxDays: "7",
    },
    validationSchema: formSchema,
    onSubmit: handleCreateLink,
  });

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
      <Heading textAlign={"center"}>Temp Lnk</Heading>
      <Stack
        as={Flex}
        spacing={"15px"}
        width={{ base: "90%", sm: "75%", md: "60%", lg: "45%" }}
        direction={"column"}
        alignItems={"center"}
      >
        <FormControl
          id="redirectTo"
          isRequired
          isInvalid={touched.redirectTo && errors.redirectTo}
        >
          <FormLabel>Link</FormLabel>
          <Input
            placeholder={"Enter your link..."}
            value={values.redirectTo}
            name={"redirectTo"}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <FormErrorMessage>{errors.redirectTo}</FormErrorMessage>
        </FormControl>
        <RadioGroup
          onChange={(v) => setFieldValue("type", v)}
          value={values.type}
        >
          <Stack as={Flex} direction={"row"}>
            <Radio value={"CLICKS"} cursor={"pointer"}>
              Clicks
            </Radio>
            <Radio value={"DAYS"} cursor={"pointer"}>
              Days
            </Radio>
          </Stack>
        </RadioGroup>
        {values.type === "CLICKS" ? (
          <Stack as={Flex} direction={"row"} alignItems={"center"}>
            <NumberInput
              value={values.maxClicks}
              name={"redirectTo"}
              onChange={(s) => setFieldValue("maxClicks", s)}
              onBlur={handleBlur}
              placeholder={"Max clicks"}
              min={1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text as={"i"}>clicks until expiration</Text>
          </Stack>
        ) : (
          <Stack as={Flex} justifyContent={"center"}>
            <Stack
              as={Flex}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <NumberInput
                value={values.maxDays}
                name={"maxDays"}
                onChange={(s) => setFieldValue("maxDays", s)}
                onBlur={handleBlur}
                placeholder={"Max days"}
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text as={"i"}>days until expiration</Text>
            </Stack>
            {!isNaN(parseInt(values.maxDays, 10)) ? (
              <Text as={"i"} textAlign={"center"}>
                This link will expire at{" "}
                <Code>
                  {format(
                    endOfDay(addDays(new Date(), parseInt(values.maxDays, 10))),
                    "hh:mm aaaa 'on' MMMM do, yyyy"
                  )}
                </Code>
              </Text>
            ) : null}
          </Stack>
        )}
      </Stack>
      <Button isLoading={isSubmitting} onClick={handleSubmit}>
        Create Link
      </Button>
    </Stack>
  );
};

export default Home;
