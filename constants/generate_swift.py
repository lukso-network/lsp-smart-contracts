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
					   "valueType: .{},".format(getJsonSchemaValueType(jsonConstant)),
					   "valueContent: .{})\n".format(getJsonSchemaValueContent(jsonConstant))]

	jsonSchemaAttrs = filter(lambda x: x != None, jsonSchemaAttrs)

	return declarationLine + "\n".join(map(lambda attr: indent + attr, jsonSchemaAttrs))

def getJsonSchemaValueType(jsonConstant):
	""" 
	Expects jsonConstant to be a ERC725Y_JSONSchema object with "valueType" attribute
	that is parsed into a valid `ValueType` Swift enum instance that is returned.
	"""
	valueType = jsonConstant["valueType"].replace("[]", "Array")
	if valueType.lower().startswith("bytes") and valueType.lower().endswith("array"):
		valueType = "bytesNArray({})".format(valueType.lower()
													  .replace("bytes", "")
													  .replace("array", ""))
	return valueType

def getJsonSchemaValueContent(jsonConstant):
	""" 
	Expects jsonConstant to be a ERC725Y_JSONSchema object with "valueContent" attribute
	that is parsed into a valid `ValueContent` Swift enum instance that is returned.
	"""
	valueContent = jsonConstant["valueContent"].strip()
	if valueContent.startswith("0x"):
		valueContent = "SpecificBytes(\"{}\")".format(valueContent) 
	elif valueContent.lower().startswith("bytes") and valueContent.lower() != "bytes":
		valueContent = "BytesN({})".format(valueContent.lower().replace("bytes", ""))
	return valueContent

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