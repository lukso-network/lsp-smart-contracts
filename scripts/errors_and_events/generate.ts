import fs from "fs";
import { ethers } from "ethers";
import { list } from "./files";

export type Message = {
  dev: string;
  notice: string;
  params: Record<string, string>;
};

export type Error = {
  error: string;
  message: Message;
};

export type Event = {
  event: string;
  message: Message;
};

const removeSpacesAround = (text: string): string => {
  let leftIndex = 0;
  let rightIndex = text.length - 1;
  while (text[leftIndex] == " " || text[rightIndex] == " ") {
    if (text[leftIndex] == " ") leftIndex++;
    if (text[rightIndex] == " ") rightIndex--;
  }

  return text.substring(leftIndex, rightIndex + 1);
};

const removeParameterName = (text: string): string => {
  const openParenthesesIndex = text.indexOf("(");
  const closeParenthesesIndex = text.indexOf(")");

  if (closeParenthesesIndex == -1) return text;

  const parameters = text
    .substring(openParenthesesIndex + 1, closeParenthesesIndex)
    .split(",")
    .map((parameter) => {
      parameter = removeSpacesAround(parameter);
      const firstSpace = parameter.indexOf(" ");
      return parameter.substring(0, firstSpace);
    });

  return (
    text.substring(0, openParenthesesIndex + 1) +
    parameters +
    text.substring(closeParenthesesIndex)
  );
};

const formatNatspec = (text: string): Message => {
  let textCopy = text.replace("/*** ", "").replace("*/", "");

  while (textCopy.includes("*")) textCopy = textCopy.replace("*", "");

  let dev: string = "";
  let notice: string = "";
  let params: Record<string, string> = {};

  textCopy.split("@").forEach((element) => {
    if (element.substring(0, 3) === "dev") {
      dev = removeSpacesAround(element.substring(4));
    } else if (element.substring(0, 6) === "notice") {
      dev = removeSpacesAround(element.substring(7));
    } else if (element.substring(0, 5) === "param") {
      const separator = element.indexOf(" ", 6);
      params[element.substring(6, separator)] = removeSpacesAround(
        element.substring(separator + 1)
      );
    }
  });

  return {
    dev,
    notice,
    params,
  };
};

const extractErrorsFromlist = (): [string[], string[]] => {
  const errors: string[] = [];
  const errorsNatspec: string[] = [];

  for (let i = 0; i < list.length; i++) {
    const allFileContents: string = fs.readFileSync(list[i], "utf-8");
    const fileContentByLines: string[] = allFileContents.split(/\r?\n/);

    let multiLineError = false;

    for (let j = 0; j < fileContentByLines.length; j++) {
      // get current line
      const line = fileContentByLines[j];

      // skip comments
      if (line.includes("*") || line.includes("//")) continue;

      // error declarations
      if (line.includes("error")) {
        // push the current line and keep only the types for parameters
        const error = removeParameterName(removeSpacesAround(line));
        errors.push(error);

        // get and push the naspec if exists
        const previousLine = fileContentByLines[j - 1];
        let natspec = "";
        let k = 1;
        if (previousLine.includes("*/")) {
          while (!natspec.includes("/**")) {
            natspec = removeSpacesAround(fileContentByLines[j - k]) + natspec;
            k++;
          }
        }
        errorsNatspec.push(natspec);

        // if the line doesn't contain a ; it means that the error is spread ove multiple lines
        if (!line.includes(";")) multiLineError = true;
        continue;
      } else if (multiLineError) {
        errors[errors.length - 1] += line;
        if (line.includes(";")) {
          multiLineError = false;
          errors[errors.length - 1] = removeParameterName(
            errors[errors.length - 1]
          );
        }
        continue;
      }
    }
  }

  return [errors, errorsNatspec];
};

const extractEventsFromlist = (): [string[], string[]] => {
  const events: string[] = [];
  const eventsNatspec: string[] = [];

  for (let i = 0; i < list.length; i++) {
    const allFileContents = fs.readFileSync(list[i], "utf-8");
    const fileContentByLines: string[] = allFileContents.split(/\r?\n/);

    let multiLineEvent = false;

    for (let j = 0; j < fileContentByLines.length; j++) {
      // get current line
      const line = fileContentByLines[j];

      // skip comments
      if (line.includes("*") || line.includes("//")) continue;

      // event declarations
      if (line.includes("event")) {
        // push the current line and keep only the types for parameters
        const event = removeParameterName(removeSpacesAround(line));
        events.push(event);

        // get and push the naspec if exists
        const previousLine = fileContentByLines[j - 1];
        let natspec = "";
        let k = 1;
        if (previousLine.includes("*/")) {
          while (!natspec.includes("/**")) {
            natspec = removeSpacesAround(fileContentByLines[j - k]) + natspec;
            k++;
          }
        }
        eventsNatspec.push(natspec);

        // if the line doesn't contain a ; it means that the error is spread ove multiple lines
        if (!line.includes(";")) multiLineEvent = true;
        continue;
      } else if (multiLineEvent) {
        events[events.length - 1] += line;
        if (line.includes(";")) {
          multiLineEvent = false;
          events[events.length - 1] = removeParameterName(
            events[events.length - 1]
          );
        }
        continue;
      }
    }
  }

  return [events, eventsNatspec];
};

export const generateErrors = (): Record<string, Error> => {
  const [extractedErrors, extractedErrorsnatspec] = extractErrorsFromlist();
  const errors: Record<string, Error> = {};

  for (let i = 0; i < extractedErrors.length; i++) {
    const error = extractedErrors[i].replace("error ", "").replace(";", "");
    const errorSig = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes(error))
      .substring(0, 10);

    const message: Message =
      extractedErrorsnatspec[i] != undefined
        ? formatNatspec(extractedErrorsnatspec[i])
        : {
            dev: "",
            notice: "",
            params: {},
          };

    errors[errorSig] = {
      error,
      message,
    };
  }

  return errors;
};

export const generateEvents = (): Record<string, Event> => {
  const [extractedEvents, extractedEventsNatspec] = extractEventsFromlist();
  const events: Record<string, Event> = {};

  for (let i = 0; i < extractedEvents.length; i++) {
    const event = extractedEvents[i].replace("error ", "").replace(";", "");
    const eventSig = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(event));
    const message: Message =
      extractedEventsNatspec[i] != undefined
        ? formatNatspec(extractedEventsNatspec[i])
        : {
            dev: "",
            notice: "",
            params: {},
          };

    events[eventSig] = {
      event,
      message,
    };
  }

  return events;
};

console.log(generateErrors());
console.log(generateEvents());

const exportErrorsToFile = () => {
  var jsonErrors = JSON.stringify(generateErrors());
  fs.writeFile("Errors.json", jsonErrors, "utf8", () => {});
};

const exportEventsToFile = () => {
  var jsonEvents = JSON.stringify(generateEvents());
  fs.writeFile("Events.json", jsonEvents, "utf8", () => {});
};

// const used = process.memoryUsage().heapUsed / 1024 / 1024;
// console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
