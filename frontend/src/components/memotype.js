import React from 'react';
import DocViewer from 'react-doc-viewer';

const DocViewerComponent = ({ document }) => {
  const docs = [
    {
      uri: '../../typememo/023-MEMO-of-Advisory1S2021.doc', 
      fileType: 'docx',
    },
  ];

  return <DocViewer documents={docs} />;
};

export default DocViewerComponent;
