/**
 * @notice this file contains utility functions that can be used to generate a list
 * of all the functions, events and errors from all the contracts
 * listed in the `packager` section of the `hardhat.config.ts` file.
 *
 * it also parse the build-infos of each contract artifact to extract
 * the natspec documentation (userdoc + devdoc) for each function, event and error.
 *
 */
import hre, { artifacts } from "hardhat";
import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { Artifact, BuildInfo } from "hardhat/types";
import packager from "hardhat-packager";

/**
 *
 * @returns a list of all the functions of all the contracts listed in the `packager` section of the `hardhat.config.ts` file
 */
export async function getAllLSPErrors() {
  const contractsList = hre.config.packager.contracts;

  let errorsList: object = {};

  for (const index in contractsList) {
    const contract = contractsList[index];
    const artifact = await artifacts.readArtifact(contract);

    const contractInterface: Interface = new ethers.utils.Interface(
      artifact.abi
    );
    const errorsInInterface = contractInterface.errors;

    const docEntryType: DocProperty = "errors";

    const contractUserDocs = await getNatspecDocs(artifact, "userdoc");
    const contractDevDocs = await getNatspecDocs(artifact, "devdoc");

    const allErrorsUserDocs = contractUserDocs[docEntryType];
    const allErrorsDevDocs = contractDevDocs[docEntryType];

    Object.entries(errorsInInterface).forEach(([errorSig, errorDetails]) => {
      const errorSelectorcode = contractInterface.getSighash(errorSig);

      const errorUserDoc = getNatspecForProperty(allErrorsUserDocs, errorSig);
      const errorDevDoc = getNatspecForProperty(allErrorsDevDocs, errorSig);

      errorsList[errorSelectorcode] = {
        sig: errorSig,
        type: errorDetails.type,
        name: errorDetails.name,
        inputs: errorDetails.inputs,
        userdoc: errorUserDoc,
        devdoc: errorDevDoc,
      };
    });
  }

  return errorsList;
}

/**
 * @returns a list of all the functions of all the contracts listed in the `packager` section of the `hardhat.config.ts` file
 */
export async function getAllLSPEvents() {
  const contractsList = hre.config.packager.contracts;

  let eventsList: object = {};

  for (const index in contractsList) {
    const contract = contractsList[index];
    const artifact = await artifacts.readArtifact(contract);

    const contractInterface: Interface = new ethers.utils.Interface(
      artifact.abi
    );
    const eventsInInterface = contractInterface.events;

    const docEntryType: DocProperty = "events";

    const contractUserDocs = await getNatspecDocs(artifact, "userdoc");
    const contractDevDocs = await getNatspecDocs(artifact, "devdoc");

    const allEventsUserDocs = contractUserDocs[docEntryType];
    const allEventsDevDocs = contractDevDocs[docEntryType];

    Object.entries(eventsInInterface).forEach(([eventSig, eventDetails]) => {
      const eventTopicHash = contractInterface.getEventTopic(eventSig);

      const eventUserDoc = getNatspecForProperty(allEventsUserDocs, eventSig);
      const eventDevDoc = getNatspecForProperty(allEventsDevDocs, eventSig);

      eventsList[eventTopicHash] = {
        sig: eventSig,
        type: eventDetails.type,
        name: eventDetails.name,
        inputs: eventDetails.inputs,
        userdoc: eventUserDoc,
        devdoc: eventDevDoc,
      };
    });
  }

  return eventsList;
}

/**
 * @returns a list of all the functions of all the contracts listed in the `packager` section of the `hardhat.config.ts` file
 */
export async function getAllLSPFunctions() {
  const contractsList = hre.config.packager.contracts;

  let functionsList: object = {};

  for (const index in contractsList) {
    const contract = contractsList[index];
    const artifact = await artifacts.readArtifact(contract);

    const contractInterface: Interface = new ethers.utils.Interface(
      artifact.abi
    );
    const functionsInInterface = contractInterface.functions;

    const docEntryType: DocProperty = "methods";

    const contractUserDocs = await getNatspecDocs(artifact, "userdoc");
    const contractDevDocs = await getNatspecDocs(artifact, "devdoc");

    const allFunctionsUserDocs = contractUserDocs[docEntryType];
    const allFunctionsDevDocs = contractDevDocs[docEntryType];

    Object.entries(functionsInInterface).forEach(
      ([functionSig, functionDetails]) => {
        const functionSelectorcode = contractInterface.getSighash(functionSig);

        const functionUserDoc = getNatspecForProperty(
          allFunctionsUserDocs,
          functionSig
        );
        const functionDevDoc = getNatspecForProperty(
          allFunctionsDevDocs,
          functionSig
        );

        functionsList[functionSelectorcode] = {
          sig: functionSig,
          type: functionDetails.type,
          name: functionDetails.name,
          inputs: functionDetails.inputs,
          outputs: functionDetails.outputs,
          userdoc: functionUserDoc,
          devdoc: functionDevDoc,
        };
      }
    );
  }

  return functionsList;
}

type DocType = "userdoc" | "devdoc";
type DocProperty = "methods" | "errors" | "events";

/**
 * @notice get the natspec documentation for a given contract artifact
 * @param contractArtifact the JSON artifact of a contract
 * @param docType the type of Natspec documentation to extract (userdoc or devdoc)
 * @returns the natspec documentation for the given contract artifact
 */
async function getNatspecDocs(
  contractArtifact: Artifact,
  docType: DocType
): Promise<object> {
  const source = contractArtifact.sourceName;
  const contract = contractArtifact.contractName;

  // resolve to specific contract within the source file
  const buildInfo: BuildInfo | undefined = await artifacts.getBuildInfo(
    source + ":" + contract
  );

  if (typeof buildInfo == "undefined") {
    throw new Error(
      `Could not find build info for contract ${contract} in source file ${source}`
    );
  }

  // e.g: buildInfo.output.contracts["contracts/MyContract.sol"]["MyContract"]["devdoc"]
  const contractNatspecDoc =
    buildInfo.output.contracts[source][contract][docType];

  return contractNatspecDoc;
}

/**
 * @notice get the natspec documentation for a given property (function, event or error)
 * @param propertyList the list of all the properties (functions, events or errors) of a contract
 * @param propertySig the function, error or event signature of the property to get the natspec documentation for
 * @returns the natspec documentation for the given property
 *
 * @dev the `propertySig` is the signature of the function, event or error
 * e.g: "transfer(address,uint256)"
 * e.g: "Transfer(address,address,uint256)"
 * e.g: "TransferFailed()"
 *
 * @dev the property list is the list of all the properties (functions, events or errors) of a contract.
 * Can be obtained via ethers.js Interface object.
 *
 * e.g:
 * const contractInterface: Interface = new ethers.utils.Interface(artifact.abi)
 *
 * const functionsInInterface = contractInterface.functions
 * const eventsInInterface = contractInterface.events
 * const errorsInInterface = contractInterface.errors
 */
function getNatspecForProperty(propertyList: object, propertySig: string) {
  if (!Object(propertyList).hasOwnProperty(propertySig)) {
    return {};
  }

  return propertyList[propertySig];
}
