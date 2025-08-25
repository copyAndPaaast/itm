import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Switch, FormControlLabel, Button, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassDetailsForm = ({ classDetails, onClassDetailsChange, type }) => {
  const [details, setDetails] = useState({ ...classDetails, propertySchema: [] });

  useEffect(() => {
    const propertiesArray = classDetails && classDetails.propertySchema 
      ? Object.entries(classDetails.propertySchema).map(([name, schema]) => ({ name, ...schema }))
      : [];
    setDetails({ ...classDetails, propertySchema: propertiesArray });
  }, [classDetails]);

  const convertSchemaToObject = (schemaArray) => {
    return schemaArray.reduce((acc, prop) => {
      if (prop.name) {
        const { name, ...schema } = prop;
        acc[name] = schema;
      }
      return acc;
    }, {});
  };

  const handleChange = (event) => {
    const { name, value, checked, type: inputType } = event.target;
    const newValue = inputType === 'checkbox' ? checked : value;
    const updatedDetails = { ...details, [name]: newValue };
    setDetails(updatedDetails);
    onClassDetailsChange({ ...updatedDetails, propertySchema: convertSchemaToObject(updatedDetails.propertySchema) });
  };

  const handlePropertyChange = (index, event) => {
    const { name, value } = event.target;
    const properties = [...details.propertySchema];
    properties[index] = { ...properties[index], [name]: value };
    const updatedDetails = { ...details, propertySchema: properties };
    setDetails(updatedDetails);
    onClassDetailsChange({ ...updatedDetails, propertySchema: convertSchemaToObject(properties) });
  };

  const addProperty = () => {
    const properties = [...details.propertySchema, { name: '', type: 'string' }];
    const updatedDetails = { ...details, propertySchema: properties };
    setDetails(updatedDetails);
    onClassDetailsChange({ ...updatedDetails, propertySchema: convertSchemaToObject(properties) });
  };

  const removeProperty = (index) => {
    const properties = [...details.propertySchema];
    properties.splice(index, 1);
    const updatedDetails = { ...details, propertySchema: properties };
    setDetails(updatedDetails);
    onClassDetailsChange({ ...updatedDetails, propertySchema: convertSchemaToObject(properties) });
  };

  if (!details) {
    return null;
  }

  return (
    <Box component="form" noValidate autoComplete="off">
      <TextField
        label={type === 'asset' ? "Class Name" : "Relationship Class Name"}
        name={type === 'asset' ? "className" : "relationshipClassName"}
        value={details.className || details.relationshipClassName || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      {type === 'relationship' && (
        <TextField
          label="Relationship Type"
          name="relationshipType"
          value={details.relationshipType || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      )}
      <TextField
        label="Description"
        name="description"
        value={details.description || ''}
        onChange={handleChange}
        fullWidth
        multiline
        rows={2}
        margin="normal"
      />

      <Typography variant="h6" sx={{ mt: 2 }}>Properties</Typography>
      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
        {(details.propertySchema || []).map((prop, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField
              label="Property Name"
              name="name"
              value={prop.name || ''}
              onChange={(e) => handlePropertyChange(index, e)}
            />
            <TextField
              label="Property Type"
              name="type"
              value={prop.type || ''}
              onChange={(e) => handlePropertyChange(index, e)}
            />
            <IconButton onClick={() => removeProperty(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addProperty}>
          Add Property
        </Button>
      </Paper>

      <FormControlLabel
        control={<Switch checked={details.isActive || false} onChange={handleChange} name="isActive" />}
        label="Active"
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default ClassDetailsForm;