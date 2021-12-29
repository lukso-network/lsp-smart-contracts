import json
import os
from common import *

def parseIntoSwift(jsonConstant, parentJsonConstant=None, indentLevel=0):
	jsonConstantMembers = jsonConstant.get("members")
	if jsonConstant["name"] == "SupportedStandards":
		print("parentJsonConstant == None    {}".format(parentJsonConstant == None))
		print("jsonConstantMembers != None    {}".format(jsonConstantMembers != None))
		print("indentLevel == 0    {} {}".format(indentLevel, indentLevel == 0))
		print("isLastLayerOfMembers(jsonConstantMembers)    {}".format(isLastLayerOfMembers(jsonConstantMembers)))
	
	
	
	if parentJsonConstant == None and jsonConstantMembers != None and indentLevel == 0 and isLastLayerOfMembers(jsonConstantMembers):
		jsonConstantMembers = [{ "name": "companion object", "type": "companion_object", "members": jsonConstantMembers}]
		jsonConstant["members"] = jsonConstantMembers

	indent = "\t" * (0 if parentJsonConstant == None else 1)
	bodyIndent = "\t" if parentJsonConstant == None and jsonConstantMembers == None else ""
	declaration = createDeclaration(jsonConstant, parentJsonConstant, indentLevel)
	entityType = jsonConstant["type"].lower()

	output = ""

	if entityType == "const" or entityType == "jsonschema":
		output = declaration
	else:	
		declarationLine = "{} {{".format(declaration)
		body = "".join(map(lambda x: "{}{}\n".format(bodyIndent, x), createBody(jsonConstant, indentLevel)))
		output = "{}\n{}".format(declarationLine, body).strip() + "\n}\n"

	output = appendDocsIfAny(output, jsonConstant)

	return "\n".join(map(lambda str: indent + str, output.split("\n")))

def createDeclaration(jsonConstant, parentJsonConstant, indentLevel):
	"""Return declaration of an enum, class or immutable variable (val) in Kotlin."""
	unitType = jsonConstant["type"].lower()
	
	validName = escapeProhibitedNameCharacters(jsonConstant["name"].replace(":", "_")) 

	if parentJsonConstant == None:
		print("Processing ({}): {}".format(indentLevel, jsonConstant["name"]))
	else:
		print("Processing ({}): {}->{}".format(indentLevel, parentJsonConstant["name"], jsonConstant["name"]))

	# "companion_object" is a runtime-only generated Kotlin specific type
	if unitType == "companion_object":
		return "public companion object"

	if unitType == "const":
		return "public val {} = {}\n".format(validName, jsonConstant["value"])
	
	if unitType == "enum":
		rawValueType = getValidEnumType(jsonConstant["rawValueType"])
		if rawValueType == None:
			raise Exception("\"rawValueType\" '{}' is not valid.".format(jsonConstant["rawValueType"]))
		return "public enum class {}(val value: {})".format(validName, rawValueType)
	
	if unitType == "json":
		if indentLevel >= 1:
			return "public object {}".format(validName)
		else:
			return "public class {}".format(validName)
	
	if unitType == "jsonschema":
		valueContent = jsonConstant["valueContent"].strip()
		if valueContent.startswith("0x"):
			valueContent = "ValueContent(\"{}\", {})".format(valueContent, int(len(valueContent.replace("0x", "")) / 2)) 
		elif valueContent.lower().startswith("bytes") and valueContent.lower() != "bytes":
			valueContent = "ValueContent(\"{}\", {})".format(valueContent, valueContent.lower().replace("bytes", ""))
		else:
			valueContent = "ValueContent(\"{}\")".format(valueContent)
		
		valueType = jsonConstant["valueType"]
		_bits =  re.search("[\d]+", valueType)
		if valueType.startswith("0x"):
			valueType = "ValueType(\"{}\", {})".format(valueType, int(len(valueType.replace("0x", "")) / 2)) 
		elif _bits != None and valueType.lower().startswith("bytes") and valueType.lower() != "bytes":
			valueType = "ValueType(\"{}\", {})".format(valueType, _bits.group())
		elif _bits != None:
			valueType = "ValueType(\"{}\", {})".format(valueType, int(int(_bits.group()) / 8))
		else:
			valueType = "ValueType(\"{}\")".format(valueType)

		# 	ValueType(\"{}\")

		# valueType = jsonConstant["valueType"].replace("[]", "Array")
		# if valueType.lower().startswith("bytes") and valueType.lower().endswith("array"):
		# 	valueType = "bytesNArray({})".format(valueType.lower()
		# 												  .replace("bytes", "")
		# 												  .replace("array", ""))

		elementValueContent = jsonConstant.get("elementValueContent")
		elementValueType = jsonConstant.get("elementValueType")
		hasElementValueMetaData = elementValueContent != None and elementValueType != None

		declarationLine = "public val {} = JSONSchema(".format(validName)
		declarationLine = declarationLine + "name = \"{}\",\n".format(jsonConstant["name"])

		# jsonConstant["valueType"]
		# jsonConstant["valueContent"]
		# keyTypeBytes = re.sub("[a-zA-Z]", "", jsonConstant["keyType"]) 

		jsonSchemaAttrs = ["key = \"{}\",".format(jsonConstant["key"]),
						   "keyType = KeyType(\"{}\"),".format(jsonConstant["keyType"]),
						   "valueContent = {},".format(valueContent),
						   "valueType = {}{}".format(valueType, ")\n" if not hasElementValueMetaData else ","),
						   "elementValueContent = ElementValueContent(\"{}\"),".format(elementValueContent) if hasElementValueMetaData else None,
						   "elementValueType = ElementValueType(\"{}\"))\n".format(elementValueType) if hasElementValueMetaData else None]

		jsonSchemaAttrs = filter(lambda x: x != None, jsonSchemaAttrs)
		return declarationLine + "\n".join(map(lambda attr: "\t" + attr, jsonSchemaAttrs))
	
	raise Exception("Unknown type '{}' in {}".format(unitType, jsonConstant))

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
		return ",\n".join(map(lambda x: createEnumCase(x, rawValueType), jsonConstant["cases"])).split("\n")
	else:
		members = jsonConstant.get("members")
		if members == None or len(members) == 0:
			return [""]
		else:
			return map(lambda x: parseIntoSwift(x, jsonConstant, indentLevel+1), members)
			

def createEnumCase(entry, rawValueType):
	"""Declares and returns case 'NAME(VALUE)' for an enum"""
	formatString = "{}({})"
	if rawValueType == "String":
		formatString = "{}(\"{}\")"
	elif rawValueType == "UInt":
		formatString = "{}(UInt({}))"
	elif rawValueType == "Float":
		formatString = "{}({}.toFloat())"
	elif rawValueType == "Double":
		formatString = "{}({}.toDouble())"
	
	return appendDocsIfAny(formatString.format(entry["key"], entry["value"]), entry)

def generateKotlinFile():
	"""Generates UpConstants.kt file from 'constants_defined.json'."""
	with open('constants_defined.json') as fileToReadFrom:
		output = []
		data = json.load(fileToReadFrom)
		documentation = generateDocs(data, multilineDocWrappingSymbols=["/// ", "/// ", "/// "])
		if len(documentation) > 0:
			output.append(documentation)

		content = data["content"]
		for entry in content:
			output.append(parseIntoSwift(entry))

		constantsSwiftFile = "UpConstants.kt"
		if os.path.exists(constantsSwiftFile):
	  		os.remove(constantsSwiftFile)

		with open(constantsSwiftFile, "w") as fileToWriteTo:
			fileToWriteTo.write("\n".join(output))

		os.system("code UpConstants.kt")

if __name__ == "__main__":
	print("JSON to Kotlin generation started")
	generateKotlinFile()
	print("JSON to Kotlin generation complete")