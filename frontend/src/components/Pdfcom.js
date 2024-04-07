import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import memo from './1.pdf';

function Pdfcom(props) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className='pdf-div'>
      <Document file={props.pdffile} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          pageNumber={pageNumber}
          renderTextLayer={true}
          renderAnnotationLayer={false}
        />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
}

export default Pdfcom;
