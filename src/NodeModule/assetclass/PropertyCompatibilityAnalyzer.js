/**
 * Utility class for analyzing property compatibility between AssetClass schemas
 */
export class PropertyCompatibilityAnalyzer {
  
  /**
   * Analyzes compatibility between current properties and a new AssetClass schema
   * @param {Object} currentProperties - Current node/relationship properties
   * @param {Object} currentSchema - Current AssetClass/RelationshipClass property schema
   * @param {Object} newSchema - Target AssetClass/RelationshipClass property schema
   * @param {Array} newRequiredProperties - Required properties in new schema
   * @returns {Object} Compatibility analysis result
   */
  static analyzeCompatibility(currentProperties, currentSchema, newSchema, newRequiredProperties = []) {
    const analysis = {
      compatible: true,
      issues: [],
      migrations: [],
      preservedProperties: {},
      lostProperties: {},
      missingRequiredProperties: [],
      typeConflicts: [],
      valueMappingNeeded: []
    }

    // Analyze each current property
    for (const [propName, propValue] of Object.entries(currentProperties)) {
      if (newSchema[propName]) {
        // Property exists in new schema - check compatibility
        const compatibility = this.checkPropertyCompatibility(propName, propValue, currentSchema[propName], newSchema[propName])
        
        if (compatibility.compatible) {
          analysis.preservedProperties[propName] = propValue
          if (compatibility.needsMapping) {
            analysis.valueMappingNeeded.push({
              property: propName,
              currentValue: propValue,
              suggestion: compatibility.suggestedValue,
              reason: compatibility.reason
            })
          }
        } else {
          analysis.compatible = false
          analysis.typeConflicts.push({
            property: propName,
            currentValue: propValue,
            currentType: typeof propValue,
            expectedType: newSchema[propName].type,
            reason: compatibility.reason
          })
        }
      } else {
        // Property doesn't exist in new schema - will be lost
        analysis.lostProperties[propName] = propValue
        analysis.issues.push(`Property '${propName}' will be lost (not defined in new class)`)
      }
    }

    // Check for missing required properties in new schema
    for (const requiredProp of newRequiredProperties) {
      if (!(requiredProp in currentProperties)) {
        analysis.compatible = false
        analysis.missingRequiredProperties.push({
          property: requiredProp,
          schema: newSchema[requiredProp],
          defaultValue: this.getDefaultValue(newSchema[requiredProp])
        })
      }
    }

    // Generate migration suggestions
    analysis.migrations = this.generateMigrationSuggestions(analysis, newSchema)

    return analysis
  }

  /**
   * Checks if a single property is compatible between schemas
   */
  static checkPropertyCompatibility(propName, currentValue, currentSchemaRule, newSchemaRule) {
    const result = {
      compatible: true,
      needsMapping: false,
      suggestedValue: currentValue,
      reason: null
    }

    // Type compatibility check
    if (newSchemaRule.type && typeof currentValue !== newSchemaRule.type) {
      // Try automatic type conversion
      const converted = this.attemptTypeConversion(currentValue, newSchemaRule.type)
      if (converted.success) {
        result.needsMapping = true
        result.suggestedValue = converted.value
        result.reason = `Type conversion from ${typeof currentValue} to ${newSchemaRule.type}`
      } else {
        result.compatible = false
        result.reason = `Cannot convert ${typeof currentValue} to ${newSchemaRule.type}`
        return result
      }
    }

    // Enum/values compatibility check
    if (newSchemaRule.values && !newSchemaRule.values.includes(currentValue)) {
      // Try to find similar value
      const similarValue = this.findSimilarEnumValue(currentValue, newSchemaRule.values)
      if (similarValue) {
        result.needsMapping = true
        result.suggestedValue = similarValue
        result.reason = `Value '${currentValue}' not allowed, suggesting '${similarValue}'`
      } else {
        result.compatible = false
        result.reason = `Value '${currentValue}' not in allowed values: [${newSchemaRule.values.join(', ')}]`
        return result
      }
    }

    // Length constraints
    if (typeof currentValue === 'string') {
      if (newSchemaRule.minLength && currentValue.length < newSchemaRule.minLength) {
        result.compatible = false
        result.reason = `String too short (${currentValue.length} < ${newSchemaRule.minLength})`
        return result
      }
      if (newSchemaRule.maxLength && currentValue.length > newSchemaRule.maxLength) {
        result.compatible = false
        result.reason = `String too long (${currentValue.length} > ${newSchemaRule.maxLength})`
        return result
      }
    }

    return result
  }

  /**
   * Attempts automatic type conversion
   */
  static attemptTypeConversion(value, targetType) {
    try {
      switch (targetType) {
        case 'string':
          return { success: true, value: String(value) }
        case 'number':
          const num = Number(value)
          if (!isNaN(num)) {
            return { success: true, value: num }
          }
          break
        case 'boolean':
          if (typeof value === 'string') {
            const lower = value.toLowerCase()
            if (['true', '1', 'yes', 'on'].includes(lower)) {
              return { success: true, value: true }
            }
            if (['false', '0', 'no', 'off'].includes(lower)) {
              return { success: true, value: false }
            }
          }
          break
      }
    } catch (error) {
      // Conversion failed
    }
    return { success: false }
  }

  /**
   * Finds similar enum values using fuzzy matching
   */
  static findSimilarEnumValue(currentValue, allowedValues) {
    if (typeof currentValue !== 'string') return null
    
    const currentLower = currentValue.toLowerCase()
    
    // Exact case-insensitive match
    for (const allowed of allowedValues) {
      if (typeof allowed === 'string' && allowed.toLowerCase() === currentLower) {
        return allowed
      }
    }
    
    // Partial match
    for (const allowed of allowedValues) {
      if (typeof allowed === 'string') {
        const allowedLower = allowed.toLowerCase()
        if (allowedLower.includes(currentLower) || currentLower.includes(allowedLower)) {
          return allowed
        }
      }
    }
    
    return null
  }

  /**
   * Gets default value for a property schema
   */
  static getDefaultValue(schemaRule) {
    if (schemaRule.default !== undefined) {
      return schemaRule.default
    }
    if (schemaRule.values && schemaRule.values.length > 0) {
      return schemaRule.values[0]
    }
    
    switch (schemaRule.type) {
      case 'string': return ''
      case 'number': return 0
      case 'boolean': return false
      case 'array': return []
      case 'object': return {}
      default: return null
    }
  }

  /**
   * Generates migration suggestions based on analysis
   */
  static generateMigrationSuggestions(analysis, newSchema) {
    const suggestions = []

    // Suggest values for missing required properties
    for (const missing of analysis.missingRequiredProperties) {
      suggestions.push({
        type: 'ADD_REQUIRED_PROPERTY',
        property: missing.property,
        suggestedValue: missing.defaultValue,
        action: `Add required property '${missing.property}' with default value`
      })
    }

    // Suggest mappings for value conflicts
    for (const mapping of analysis.valueMappingNeeded) {
      suggestions.push({
        type: 'MAP_PROPERTY_VALUE',
        property: mapping.property,
        currentValue: mapping.currentValue,
        suggestedValue: mapping.suggestion,
        action: `Map '${mapping.property}': '${mapping.currentValue}' → '${mapping.suggestion}'`,
        reason: mapping.reason
      })
    }

    // Suggest handling for lost properties
    for (const [propName, propValue] of Object.entries(analysis.lostProperties)) {
      suggestions.push({
        type: 'PRESERVE_IN_METADATA',
        property: propName,
        currentValue: propValue,
        action: `Preserve '${propName}' in metadata (not part of new schema)`,
        reason: 'Property not defined in target class'
      })
    }

    return suggestions
  }

  /**
   * Calculates a compatibility score (0-100)
   */
  static calculateCompatibilityScore(analysis) {
    const totalProperties = Object.keys(analysis.preservedProperties).length + 
                          Object.keys(analysis.lostProperties).length
    
    if (totalProperties === 0) return 100

    const preservedCount = Object.keys(analysis.preservedProperties).length
    const score = (preservedCount / totalProperties) * 100

    // Penalize for missing required properties and type conflicts
    const penalties = (analysis.missingRequiredProperties.length + analysis.typeConflicts.length) * 10
    
    return Math.max(0, Math.min(100, score - penalties))
  }
}