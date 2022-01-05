import json
import os
from common import *

def validTypeScriptObjectName(jsonConstant, parentJsonConstant):
	name = jsonConstant["name"]

	if parentJsonConstant == None or parentJsonConstant["type"] != "json":
		return escapeProhibitedNameCharacters(name)
	
	if parentJsonConstant["type"] == "json":
		if name.endswith("[]"):
			name = name.replace("[]", "Array")

	if containsProhibitedNameCharacters(name):
		name = "\"{}\"".format(name)

	return name

def parseIntoTypeScript(jsonConstant, parentJsonConstant=None, indentLevel=0):
	indent = "\t" * (0 if parentJsonConstant == None else 1)
	bodyIndent = "\t" if parentJsonConstant == None and jsonConstant.get("members") == None else ""
	declaration = createDeclaration(jsonConstant, parentJsonConstant, indentLevel)
	entityType = jsonConstant["type"].lower()

	output = declaration

	if entityType != "const":
		declaration = "{} {{".format(declaration)
		body = "".join(map(lambda bodyLine: "{}{}\n".format(bodyIndent, bodyLine), createBody(jsonConstant, indentLevel)))
		bodyClosure = "\n}\n" if parentJsonConstant == None or parentJsonConstant["type"] != "json" else "\n},"
		output = "{}\n{}".format(declaration, body).strip() + bodyClosure

	output = appendDocsIfAny(output, jsonConstant)

	# Adding indents
	return "\n".join(map(lambda str: indent + str, output.split("\n")))

def createDeclaration(jsonConstant, parentJsonConstant, indentLevel):
	"""Return declaration of an enum, class, immutable variable (const) or JSON in TypeScript."""
	unitType = jsonConstant["type"].lower()
	parentType = None if parentJsonConstant == None else parentJsonConstant.get("type").lower()

	validName = validTypeScriptObjectName(jsonConstant, parentJsonConstant)

	if parentJsonConstant == None:
		print("Processing ({}): {}".format(indentLevel, jsonConstant["name"]))
	else:
		print("Processing ({}): {}->{}".format(indentLevel, parentJsonConstant["name"], jsonConstant["name"]))
		
	if unitType == "const":
		unitValue = jsonConstant["value"]
		if parentType == "json":
			return "{}: {},".format(validName, unitValue)
		else:
			return "export const {} = {}\n".format(validName, unitValue)
	if unitType == "enum":
		if parentJsonConstant != None:
			raise Exception("Not supported: enum can only be on the top level of file structure. Nested enums are not supported.")

		return "export const enum {}".format(validName)
	if  unitType == "json" or unitType == "jsonschema":
		if parentJsonConstant == None:
			return "export const {} = ".format(validName)
		else:
			return "{}: ".format(validName)
	
	raise Exception("Unknown type '{}' in {}".format(unitType, jsonConstant))

def createBody(jsonConstant, indentLevel=0):
	"""Returns body of a class, enum or a struct"""
	unitType = jsonConstant["type"].lower()
	if unitType == "enum":
		rawValueType = jsonConstant["rawValueType"].lower()
		return ",\n".join(map(lambda x: createEnumCase(x, rawValueType), jsonConstant["cases"])).split("\n")
	elif unitType == "jsonschema":
		jsonSchemaAttrs = [
			    "\tname: \"{}\",".format(jsonConstant["name"]),
				("\tkey: \"{}\"," if jsonConstant["key"].startswith("0x") else "\tkey: {},").format(jsonConstant["key"]),
				"\tkeyType: \"{}\",".format(jsonConstant["keyType"]),
				"\tvalueType: \"{}\",".format(jsonConstant["valueType"]),
				"\tvalueContent: \"{}\",".format(jsonConstant["valueContent"])
				]

		return filter(lambda x: x != None, jsonSchemaAttrs)
	else:
		members = jsonConstant.get("members")
		if members == None or len(members) == 0:
			return [""]
		else:
			return map(lambda x: parseIntoTypeScript(x, jsonConstant, indentLevel+1), members)
			

def createEnumCase(entry, rawValueType):
	"""Declares and returns case 'X = Y' for an enum"""
	if rawValueType.lower() == "string":
		return appendDocsIfAny("{} = \"{}\"".format(entry["key"], entry["value"]), entry)
	else:
		return appendDocsIfAny("{} = {}".format(entry["key"], entry["value"]), entry)

def generateTypeScriptFile():
	"""Generates UpConstants.ts file from 'constants_defined.json'."""
	with open('constants_defined.json') as fileToReadFrom:
		output = []
		data = json.load(fileToReadFrom)
		documentation = generateDocs(data, multilineDocWrappingSymbols=["/// ", "/// ", "/// "])
		if len(documentation) > 0:
			output.append(documentation)

		content = data["content"]
		for entry in content:
			output.append(parseIntoTypeScript(entry))

		constantsTypeScriptFile = "UpConstants.ts"
		
		if os.path.exists(constantsTypeScriptFile):
	  		os.remove(constantsTypeScriptFile)
		
		with open(constantsTypeScriptFile, "w") as fileToWriteTo:
			fileToWriteTo.write("\n".join(output))

		os.system("code UpConstants.ts")

if __name__ == "__main__":
	print("JSON to TypeScript generation started")
	generateTypeScriptFile()
	print("JSON to TypeScript generation complete")