import json
import os
from common import *

def parseIntoSwift(jsonConstant, parentJsonConstant=None, indentLevel=0):
	indent = "\t" * (0 if parentJsonConstant == None else 1)
	bodyIndent = "\t" if parentJsonConstant == None and jsonConstant.get("members") == None else ""
	declaration = createDeclaration(jsonConstant, parentJsonConstant, indentLevel)
	entityType = jsonConstant["type"].lower()

	output = ""

	if declaration.strip().endswith(")") or entityType == "const":
		output = declaration
	else:	
		declarationLine = "{} {{".format(declaration)
		body = "".join(map(lambda x: "{}{}\n".format(bodyIndent, x), createBody(jsonConstant, indentLevel)))
		output = "{}\n{}".format(declarationLine, body).strip() + "\n}\n"

	output = appendDocsIfAny(output, jsonConstant)

	return "\n".join(map(lambda str: indent + str, output.split("\n")))

def createDeclaration(jsonConstant, parentJsonConstant, indentLevel):
	"""Return declaration of an enum, class or immutable variable (let) in Swift."""
	unitType = jsonConstant["type"].lower()
	
	validName = jsonConstant["name"].replace(":", "_")
	if validName.endswith("[]"):
		validName = validName.replace("[]", "Array")

	validName = escapeProhibitedNameCharacters(validName) 

	if parentJsonConstant == None:
		print("Processing ({}): {}".format(indentLevel, jsonConstant["name"]))
	else:
		print("Processing ({}): {}->{}".format(indentLevel, parentJsonConstant["name"], jsonConstant["name"]))
		

	if unitType == "const":
		# Top level variable
		insert = " "
		if parentJsonConstant != None:
			# Inner class level variable
			insert = " static "
		return "public{}let {} = {}\n".format(insert, validName, jsonConstant["value"])
	elif unitType == "enum":
		rawValueType = getValidEnumType(jsonConstant["rawValueType"])
		if rawValueType == None:
			raise Exception("\"rawValueType\" '{}' is not valid.".format(jsonConstant["rawValueType"]))
		if jsonConstant.get("caseIterable") == True:
			rawValueType = rawValueType + ", CaseIterable" 
		return "public enum {}: {}".format(validName, rawValueType)
	elif unitType == "json":
		return "public class {}".format(validName)
	elif unitType == "erc725y_jsonschema":
		return declareJsonSchema(validName, jsonConstant, parentJsonConstant)
	else:
		raise Exception("Unknown type in {}".format(jsonConstant))

def declareJsonSchema(validName, jsonConstant, parentJsonConstant):
	key = jsonConstant["key"]

	if re.search(hexStringRegEx, key).group() != key:
		raise Exception("ERC725Y_JSONSchema \"key\" must be a hex string without white space characters.\n{}".format(jsonConstant))
	
	# Top level variable
	insert = " "
	if parentJsonConstant != None:
		# Inner class level variable
		insert = " static "

	declarationLine = "public{}let {} = JSONSchema(".format(insert, validName)
	indent = " " * len(declarationLine)
	declarationLine = declarationLine + "name: \"{}\",\n".format(jsonConstant["name"])
	jsonSchemaAttrs = ["key: \"{}\",".format(key),
					   "keyType: .{},".format(jsonConstant["keyType"]),
					   "valueType: {},".format(getJsonSchemaValueType(jsonConstant["valueType"])),
					   "valueContent: {})\n".format(getJsonSchemaValueContent(jsonConstant["valueContent"]))]

	jsonSchemaAttrs = filter(lambda x: x != None, jsonSchemaAttrs)

	return declarationLine + "\n".join(map(lambda attr: indent + attr, jsonSchemaAttrs))
 
def getJsonSchemaValueType(valueType):
    """ 
    Expects jsonConstant to be a ERC725Y_JSONSchema object with "valueType" attribute
    that is parsed into a valid `ValueType` Swift enum instance that is returned.
    Note that "valueType" can have multiple types declared as tuple (e.g. "(uint256,address,bytes32)")
    """

    if valueType.count('(') != valueType.count(')'):
            raise Exception("Given valueType contains tuples but the number of opening and closing parentheses doesn't match: {}".format(valueType))

    valueType = valueType.strip()
    original = valueType
    isTuple = valueType.startswith("(")
    isArray = valueType.endswith("]")
    isCompactBytesArray = isArray and re.search(r'\[compactbytesarray\]$', valueType.lower()) is not None
    
    size = re.search(r'\d+$', valueType)

    if size is not None:
        """
        This case should cover types like uintN, intN, bytesN
        """
        size = size.group(0)
        valueType = "{}({})".format(valueType.replace(size, ""), size)
    elif isArray:
            """
            This case should cover all arrays
            """
            if valueType.endswith("[]"):
                    valueType = "array({})".format(getJsonSchemaValueType(rreplace(valueType, "[]", "", 1)))
            elif isCompactBytesArray:
                    valueType = "compactBytesArray({})".format(getJsonSchemaValueType(rreplace(valueType, "[CompactBytesArray]", "", 1)))
            
            arraySizeMatch = re.search(r'\[(\d+)\]$', valueType)
            if arraySizeMatch is not None:
                    rawArraySize = arraySizeMatch.group(1)
                    arraySize = int(rawArraySize)
                    
                    if arraySize is None:
                            raise Exception("Failed to parse array size: {}".format(rawArraySize))
                    if arraySize <= 0:
                            raise Exception("Invalid array size. Must be greater than 1. Given: {}".format(arraySize))
                    valueType = "array({}, {})".format(getJsonSchemaValueType(rreplace(valueType, arraySizeMatch.group(0), "", 1)), arraySize)
    elif isTuple:
            """
            This case covers tuples
            """

            roughlySplitTupleTypes = valueType[1:valueType.rindex(")")].split(",")
            typesCount = len(roughlySplitTupleTypes)
            parsedTypes = []
            nestedTuple = None
            for idx, _type in enumerate(roughlySplitTupleTypes):
                    _type = _type.strip()
                    # A tuple that contains only one type, e.g. (address)
                    oneTypeTuple = re.search(r'\([^()]*\)', _type) is not None
                    if oneTypeTuple and nestedTuple is None:
                            _type = _type
                    elif _type.startswith("(") and nestedTuple is None:
                            nestedTuple = _type
                            if idx + 1 == typesCount:
                                    raise Exception("Reached last type in a tuple and the number of open and closed parentheses doesn't match.")
                            else:
                                    continue
                    elif _type.endswith(")") and nestedTuple is not None:
                            nestedTuple = nestedTuple + "," + _type
                            if nestedTuple.count('(') == nestedTuple.count(')'):
                                    _type = nestedTuple
                                    nestedTuple = None
                            elif idx + 1 < typesCount:
                                    continue
                            else:
                                    raise Exception("Reached last type in a tuple and the number of open and closed parentheses doesn't match.")
                    elif nestedTuple is not None:
                            nestedTuple = nestedTuple + "," + _type
                            if idx + 1 < typesCount:
                                    continue
                            else:
                                    _type = nestedTuple
                    parsedTypes.append(getJsonSchemaValueType(_type))
            valueType = "tuple([{}])".format(",".join(parsedTypes))
    """
    The rest of simple value types covered here
    """
    if valueType.lower() == "bytes":
            return ".bytes()"
    return ".{}".format(valueType)
 
def getJsonSchemaValueContent(valueContent):
    """ 
    Expects jsonConstant to be a ERC725Y_JSONSchema object with "valueContent" attribute
    that is parsed into a valid `ValueContent` Swift enum instance that is returned.
    Note that "valueContent" can have multiple values declared as tuple (e.g. "(uint256,address,bytes32)")
    """

    if valueContent.count('(') != valueContent.count(')'):
            raise Exception("Given valueContent contains tuples but the number of opening and closing parentheses doesn't match: {}".format(valueContent))

    valueContent = valueContent.strip()
    isTuple = valueContent.startswith("(")

    if valueContent.startswith("0x"):
            valueContent = "SpecificBytes(\"{}\")".format(valueContent) 
    elif valueContent.lower().startswith("bytes") and valueContent.lower() != "bytes":
            valueContent = "BytesN({})".format(valueContent.lower().replace("bytes", ""))
    elif isTuple:
            roughlySplitTupleTypes = valueContent[1:valueContent.rindex(")")].split(",")
            parsedTypes = []
            nestedTuple = None
            for _type in roughlySplitTupleTypes:
                    _type = _type.strip()
                    if _type.startswith("(") and nestedTuple is None:
                            nestedTuple = _type
                            continue
                    elif _type.endswith(")") and nestedTuple is not None:
                            nestedTuple = nestedTuple + "," + _type
                            _type = nestedTuple
                            nestedTuple = None
                    elif nestedTuple is not None:
                            nestedTuple = nestedTuple + "," + _type
                            continue

                    parsedTypes.append(getJsonSchemaValueContent(_type))

            valueContent = "tuple([{}])".format(",".join(parsedTypes))
            
    return ".{}".format(valueContent)
 
def rreplace(s, old, new, occurrence):
       li = s.rsplit(old, occurrence)
       return new.join(li)

def getValidEnumType(rawValueType):
	"""Returns Swift type that is extended by enum."""
	_type = rawValueType.lower()
	if _type == "string":
		return "String"
	elif _type == "int" or _type.startswith("int"):
		return "Int"
	elif _type == "uint" or _type.startswith("uint"):
		return "UInt"
	elif _type == "double":
		return "Double"
	elif _type == "float":
		return "Float"

	return None

def createBody(jsonConstant,indentLevel=0):
	"""Returns body of a class, enum or a struct"""
	constType = jsonConstant["type"].lower()
	if constType == "enum":
		rawValueType = getValidEnumType(jsonConstant["rawValueType"])
		return "\n".join(map(lambda x: createEnumCase(x, rawValueType), jsonConstant["cases"])).split("\n")
	else:
		members = jsonConstant.get("members")
		if members == None or len(members) == 0:
			return [""]
		else:
			return map(lambda x: parseIntoSwift(x, jsonConstant, indentLevel+1), members)
			

def createEnumCase(entry, rawValueType):
	"""Declares and returns 'case X' for an enum"""
	if rawValueType == "String":
		return appendDocsIfAny("case {} = \"{}\"".format(entry["key"], entry["value"]), entry)
	else:
		return appendDocsIfAny("case {} = {}".format(entry["key"], entry["value"]), entry)

def generateSwiftFile():
	"""Generates UpConstants.swift file from 'constants_defined.json'."""
	with open('constants_defined.json') as fileToReadFrom:
		output = []
		data = json.load(fileToReadFrom)
		documentation = generateDocs(data, multilineDocWrappingSymbols=["/// ", "/// ", "/// "])
		if len(documentation) > 0:
			output.append(documentation)

		content = data["content"]
		for entry in content:
			output.append(parseIntoSwift(entry))

		outputFile = "UpConstants.swift"
		if os.path.exists(outputFile):
	  		os.remove(outputFile)

		with open(outputFile, "w") as fileToWriteTo:
			fileToWriteTo.write("\n".join(output))

		# https://github.com/nicklockwood/SwiftFormat
		#os.system('mint run swiftformat')
		os.system("code {}".format(outputFile))

if __name__ == "__main__":
	print("JSON to Swift generation started")
	generateSwiftFile()
	print("JSON to Swift generation complete")