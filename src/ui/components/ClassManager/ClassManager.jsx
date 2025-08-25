import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { createClassManagerStyles } from './ClassManagerStyles';
import AssetClassesList from '../assetclasses/AssetClassesList';
import RelationshipClassesList from '../relationshipclasses/RelationshipClassesList';
import ClassDetailsForm from './ClassDetailsForm';
import StylePropertiesForm from './StylePropertiesForm';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClassManager = ({ type = 'asset' }) => {
  const theme = useTheme();
  const styles = createClassManagerStyles(theme);
  const [selectedClass, setSelectedClass] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Load default style properties for new classes
  useEffect(() => {
    if (selectedClass && !selectedClass.styleProperties) {
      setSelectedClass(prev => ({
        ...prev,
        styleProperties: {} // Empty object will use form defaults
      }));
    }
  }, [selectedClass]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setTabValue(0); 
  };

  const handleClassDetailsChange = (updatedDetails) => {
    setSelectedClass(updatedDetails);
    // Here you would typically also dispatch an action to save the changes
  };

  const handleStyleChange = (updatedStyles) => {
    const updatedClass = {
      ...selectedClass,
      styleProperties: updatedStyles
    };
    setSelectedClass(updatedClass);
    
    // TODO: Integrate with AssetClassService to persist style changes
    console.log('🎨 Style properties updated:', {
      className: selectedClass.className || selectedClass.relationshipClassName,
      styleProperties: updatedStyles
    });
  };

  const renderList = () => {
    if (type === 'asset') {
      return <AssetClassesList onAssetClassSelect={handleSelectClass} />;
    }
    return <RelationshipClassesList onRelationshipClassSelect={handleSelectClass} />;
  };

  const renderEditForm = () => {
    if (!selectedClass) {
      return (
        <Box sx={styles.placeholder}>
          <Typography variant="h6">Select a class to edit</Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" sx={styles.editTitle}>{selectedClass.name}</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="edit class tabs">
            <Tab label="Fields" id="edit-tab-0" />
            <Tab label="Style" id="edit-tab-1" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <ClassDetailsForm 
            classDetails={selectedClass}
            onClassDetailsChange={handleClassDetailsChange}
            type={type}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StylePropertiesForm 
            styleProperties={selectedClass.styleProperties || {}}
            onStyleChange={handleStyleChange}
            type={type}
          />
        </TabPanel>
      </Box>
    );
  };

  return (
    <Paper sx={styles.container}>
      <Box sx={styles.main}>
        <Box sx={styles.listContainer}>
          {renderList()}
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={styles.editContainer}>
          {renderEditForm()}
        </Box>
      </Box>
    </Paper>
  );
};

export default ClassManager;