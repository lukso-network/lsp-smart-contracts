import fs from "fs";
import { ethers } from "ethers";
import { list } from "./files";
import { exec } from "child_process";

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
  if (text) {
    let leftIndex = 0;
    let rightIndex = text.length - 1;
    while (text[leftIndex] === " " || text[rightIndex] === " ") {
      if (text[leftIndex] === " ") leftIndex++;
      if (text[rightIndex] === " ") rightIndex--;
    }

    return text.substring(leftIndex, rightIndex + 1);
  } else return text;
};

const removeParameterName = (text: string): string => {
  const openParenthesesIndex = text.indexOf("(");
  const closeParenthesesIndex = text.indexOf(")");

  if (closeParenthesesIndex === -1) return text;

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

const extractErrorsFromList = (): [string[], string[]] => {
  const errors: string[] = [];
  const errorsNatspec: string[] = [];

  for (let fileIndex = 0; fileIndex < list.length; fileIndex++) {
    const allFileContents: string = fs.readFileSync(list[fileIndex], "utf-8");
    const fileContentByLines: string[] = allFileContents.split(/\r?\n/);

    for (
      let lineIndex = 0;
      lineIndex < fileContentByLines.length;
      lineIndex++
    ) {
      // get current line
      const line = fileContentByLines[lineIndex];

      // skip comments
      if (line.includes("*") || line.includes("//")) continue;

      // error found
      if (line.includes("error")) {
        // get and push the naspec if exists
        let natspec = removeSpacesAround(fileContentByLines[lineIndex - 1]);
        if (natspec.includes("*/")) {
          let k = 1;
          while (!natspec.includes("/**"))
            natspec =
              removeSpacesAround(fileContentByLines[lineIndex - ++k]) + natspec;
        } else natspec = "";

        let error: string;
        // if it is a single-line error
        if (line.includes(";")) {
          error = removeSpacesAround(line);
        }
        // if it is a multi-line error
        else {
          error = removeSpacesAround(line);
          while (!error.includes(";"))
            error += removeSpacesAround(fileContentByLines[++lineIndex]);
        }

        errors.push(removeParameterName(error));
        errorsNatspec.push(natspec);
      }
    }
  }

  return [errors, errorsNatspec];
};

const extractEventsFromList = (): [string[], string[]] => {
  const events: string[] = [];
  const eventsNatspec: string[] = [];

  for (let fileIndex = 0; fileIndex < list.length; fileIndex++) {
    const allFileContents = fs.readFileSync(list[fileIndex], "utf-8");
    const fileContentByLines: string[] = allFileContents.split(/\r?\n/);

    for (
      let lineIndex = 0;
      lineIndex < fileContentByLines.length;
      lineIndex++
    ) {
      // get current line
      const line = fileContentByLines[lineIndex];

      // skip comments
      if (line.includes("*") || line.includes("//")) continue;

      // event found
      if (line.includes("event")) {
        // get and push the naspec if exists
        let natspec = removeSpacesAround(fileContentByLines[lineIndex - 1]);
        if (natspec.includes("*/")) {
          let k = 1;
          while (!natspec.includes("/**"))
            natspec =
              removeSpacesAround(fileContentByLines[lineIndex - ++k]) + natspec;
        } else natspec = "";

        let event: string;
        // if it is a single-line event
        if (line.includes(";")) {
          event = removeSpacesAround(line);
        }
        // if it is a multi-line event
        else {
          event = removeSpacesAround(line);
          while (!event.includes(";"))
            event += removeSpacesAround(fileContentByLines[++lineIndex]);
        }

        events.push(removeParameterName(event));
        eventsNatspec.push(natspec);
      }
    }
  }

  return [events, eventsNatspec];
};

export const generateErrors = (): Record<string, Error> => {
  const [extractedErrors, extractedErrorsnatspec] = extractErrorsFromList();
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
  const [extractedEvents, extractedEventsNatspec] = extractEventsFromList();
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

const exportErrorsToFile = () => {
  const jsonErrors = JSON.stringify(generateErrors());
  fs.writeFile("Errors.json", jsonErrors, "utf8", () => {
    exec("npx prettier --write ./Errors.json");
  });
};

const exportEventsToFile = () => {
  const jsonEvents = JSON.stringify(generateEvents());
  fs.writeFile("Events.json", jsonEvents, "utf8", () => {
    exec("npx prettier --write ./Events.json");
  });
};

exportErrorsToFile();
exportEventsToFile();
