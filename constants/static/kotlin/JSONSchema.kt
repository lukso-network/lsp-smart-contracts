public data class KeyType(public val rawKeyType: String)

public data class ValueType(public val rawType: String, public val bytes: Int? = null)

public data class ValueContent(public val rawContentType: String, public val bytes: Int? = null)

public data class JSONSchema(public val name: String,
                             public val key: String,
                             public val keyType: KeyType,
                             public val valueType: ValueType,
                             public val valueContent: ValueContent)