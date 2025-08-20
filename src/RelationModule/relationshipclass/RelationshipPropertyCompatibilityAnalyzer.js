import { PropertyCompatibilityAnalyzer } from '../../NodeModule/assetclass/PropertyCompatibilityAnalyzer.js'

/**
 * Specialized compatibility analyzer for RelationshipClass schemas
 * Extends the base PropertyCompatibilityAnalyzer with relationship-specific logic
 */
export class RelationshipPropertyCompatibilityAnalyzer extends PropertyCompatibilityAnalyzer {
  
  /**
   * Analyzes compatibility for relationship class switching
   * @param {Object} currentProperties - Current relationship properties
   * @param {Object} currentRelationshipClass - Current RelationshipClass
   * @param {Object} newRelationshipClass - Target RelationshipClass
   * @returns {Object} Enhanced compatibility analysis for relationships
   */
  static analyzeRelationshipCompatibility(currentProperties, currentRelationshipClass, newRelationshipClass) {
    // Base compatibility analysis
    const baseAnalysis = super.analyzeCompatibility(
      currentProperties,
      currentRelationshipClass.propertySchema,
      newRelationshipClass.propertySchema,
      newRelationshipClass.requiredProperties
    )

    // Add relationship-specific analysis
    const relationshipAnalysis = {
      ...baseAnalysis,
      relationshipTypeChange: currentRelationshipClass.relationshipType !== newRelationshipClass.relationshipType,
      nodeTypeCompatibility: this.analyzeNodeTypeCompatibility(currentRelationshipClass, newRelationshipClass),
      semanticCompatibility: this.analyzeSemanticCompatibility(currentRelationshipClass, newRelationshipClass)
    }

    // Update compatibility based on relationship-specific factors
    if (!relationshipAnalysis.nodeTypeCompatibility.compatible) {
      relationshipAnalysis.compatible = false
      relationshipAnalysis.issues.push(...relationshipAnalysis.nodeTypeCompatibility.issues)
    }

    return relationshipAnalysis
  }

  /**
   * Analyzes if the relationship can connect the same node types
   */
  static analyzeNodeTypeCompatibility(currentClass, newClass) {
    const analysis = {
      compatible: true,
      issues: [],
      fromTypeCompatible: true,
      toTypeCompatible: true
    }

    // Check if current allowed types are compatible with new class
    const currentFromTypes = currentClass.allowedFromTypes || ['Asset']
    const currentToTypes = currentClass.allowedToTypes || ['Asset']
    const newFromTypes = newClass.allowedFromTypes || ['Asset']
    const newToTypes = newClass.allowedToTypes || ['Asset']

    // Check from types
    const fromIntersection = currentFromTypes.filter(type => newFromTypes.includes(type))
    if (fromIntersection.length === 0) {
      analysis.compatible = false
      analysis.fromTypeCompatible = false
      analysis.issues.push(`From types incompatible: current [${currentFromTypes.join(', ')}] vs new [${newFromTypes.join(', ')}]`)
    }

    // Check to types  
    const toIntersection = currentToTypes.filter(type => newToTypes.includes(type))
    if (toIntersection.length === 0) {
      analysis.compatible = false
      analysis.toTypeCompatible = false
      analysis.issues.push(`To types incompatible: current [${currentToTypes.join(', ')}] vs new [${newToTypes.join(', ')}]`)
    }

    return analysis
  }

  /**
   * Analyzes semantic compatibility between relationship types
   */
  static analyzeSemanticCompatibility(currentClass, newClass) {
    const analysis = {
      semanticallyRelated: false,
      confidence: 0,
      suggestions: []
    }

    const currentType = currentClass.relationshipType.toLowerCase()
    const newType = newClass.relationshipType.toLowerCase()

    // Define semantic relationship groups
    const semanticGroups = {
      dependency: ['depends_on', 'requires', 'needs', 'uses'],
      connectivity: ['connects_to', 'linked_to', 'attached_to', 'wired_to'],
      hierarchy: ['parent_of', 'child_of', 'contains', 'part_of'],
      communication: ['sends_to', 'receives_from', 'communicates_with'],
      control: ['controls', 'manages', 'monitors', 'supervises'],
      data_flow: ['provides_data_to', 'receives_data_from', 'feeds_into']
    }

    // Check if both types belong to same semantic group
    for (const [groupName, types] of Object.entries(semanticGroups)) {
      const currentInGroup = types.some(t => currentType.includes(t.replace('_', '')))
      const newInGroup = types.some(t => newType.includes(t.replace('_', '')))
      
      if (currentInGroup && newInGroup) {
        analysis.semanticallyRelated = true
        analysis.confidence = 0.8
        analysis.suggestions.push(`Both relationship types belong to '${groupName}' semantic group`)
        break
      }
    }

    // Check for direct similarity
    if (currentType === newType) {
      analysis.semanticallyRelated = true
      analysis.confidence = 1.0
    } else if (currentType.includes(newType) || newType.includes(currentType)) {
      analysis.semanticallyRelated = true
      analysis.confidence = 0.6
      analysis.suggestions.push('Relationship types are textually similar')
    }

    return analysis
  }

  /**
   * Generates relationship-specific migration plan
   */
  static generateRelationshipMigrationPlan(analysis, currentRelationship, newRelationshipClass) {
    const plan = {
      steps: [],
      warnings: [],
      requiresUserInput: false,
      canAutoMigrate: analysis.compatible && analysis.nodeTypeCompatibility.compatible
    }

    // Step 1: Handle relationship type change
    if (analysis.relationshipTypeChange) {
      plan.steps.push({
        step: 'CHANGE_RELATIONSHIP_TYPE',
        description: `Change relationship type from '${currentRelationship.relationshipType}' to '${newRelationshipClass.relationshipType}'`,
        automatic: true
      })
    }

    // Step 2: Handle property migrations
    for (const migration of analysis.migrations) {
      plan.steps.push({
        step: migration.type,
        description: migration.action,
        property: migration.property,
        currentValue: migration.currentValue,
        suggestedValue: migration.suggestedValue,
        automatic: migration.type !== 'MAP_PROPERTY_VALUE',
        requiresUserInput: migration.type === 'MAP_PROPERTY_VALUE'
      })
      
      if (migration.type === 'MAP_PROPERTY_VALUE') {
        plan.requiresUserInput = true
      }
    }

    // Step 3: Handle node type compatibility
    if (!analysis.nodeTypeCompatibility.compatible) {
      plan.canAutoMigrate = false
      plan.warnings.push('Node type compatibility issues - relationship may need to be recreated')
    }

    // Step 4: Add semantic warnings
    if (!analysis.semanticCompatibility.semanticallyRelated) {
      plan.warnings.push('Relationship types are semantically different - verify this change makes sense')
    }

    return plan
  }
}