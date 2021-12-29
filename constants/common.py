import re 

unitNameRegEx = "[a-zA-Z_$][a-zA-Z_$0-9]*"

def generateDocs(jsonConstant, singleLineDocWrappingSymbol="/// ", multilineDocWrappingSymbols=["/**", " ", " */"]):
	""" 
	From given jsonConstant extracts documentation and constructs a valid multiline documentation string
	or return empty string if no documentation was provided.
	'jsonConstant' is allowed to have documentation attribute of type string or list. Any other will raise exception.
	"""
	documentation = jsonConstant.get("documentation")

	if documentation == None:
		return ""

	if type(documentation) is str:
		documentation = documentation.split("\n")
	elif type(documentation) is not list:
		raise Exception("\"documentation\" attribute cannot be of type {}. Use array (where int and other types are allowed) or string instead.".format(type(documentation)))

	if len(documentation) == 0:
		return ""

	openingDocSymbol = singleLineDocWrappingSymbol
	middleDocSymbol = singleLineDocWrappingSymbol
	closingDocSymbol = singleLineDocWrappingSymbol

	if type(multilineDocWrappingSymbols) is list:
		openingDocSymbol = multilineDocWrappingSymbols[0]
		middleDocSymbol = multilineDocWrappingSymbols[1]
		closingDocSymbol = multilineDocWrappingSymbols[2]
	elif type(multilineDocWrappingSymbols) is str:
		openingDocSymbol = multilineDocWrappingSymbols
		middleDocSymbol = multilineDocWrappingSymbols
		closingDocSymbol = multilineDocWrappingSymbols
	
	if len(documentation) == 1:
		return "{}{}\n".format(singleLineDocWrappingSymbol, documentation[0])

	docs = "".join(map(lambda docs: "{}{}\n".format(middleDocSymbol, docs), documentation))

	docs = "{}\n{}{}\n".format(openingDocSymbol, docs, closingDocSymbol)
	return docs

def appendDocsIfAny(inputString, jsonConstant, singleLineDocWrappingSymbol="/// ", multilineDocWrappingSymbols=["/**", " ", " */"]):
	return generateDocs(jsonConstant, singleLineDocWrappingSymbol, multilineDocWrappingSymbols) + inputString


def containsProhibitedNameCharacters(inputString):
	return re.search(unitNameRegEx, inputString).group() != inputString

# A better name will definitely improve understanding
def escapeProhibitedNameCharacters(inputString):
	""" 
	Returns a name (of a class/const/var or whatever it denotes) that is following this regular expression: \"[a-zA-Z_$][a-zA-Z_$0-9]*\".
	Returned name is either whole given input or a subsequence, e.g. given this value \"123_x123\" returned value will be \"_x123\" as it is the sequence that
	follows the regular expression.
	A name should start with letter, dollar sign ($) or underscore (_) and further conaint numbers, letters and/or underscores in any count. 
	We consider that the rule is the same for all languages and this particular function is common for all. 
	Any specific script is free to use it's own implementation to define it's own rules.
	"""
	givenInputString = inputString
	inputString = re.search(unitNameRegEx, inputString)
	if inputString == None:
		raise Exception("Given name is not valid and does not contain any valid const/var/class etc. name sequences: {}".format(givenInputString))
	return inputString.group()

def isLastLayerOfMembers(listOfJsonConstantMembers):
	for member in listOfJsonConstantMembers:
		members = member.get("members")
		if members != None and len(members) > 0:
			return False
	return True