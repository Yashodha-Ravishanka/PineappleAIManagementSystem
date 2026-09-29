import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";

import "./ReportExport.css";


function ReportExport({ pineapples }) {


  function exportPDF() {

  const doc = new jsPDF();

  doc.text(
  "TEST NEW PDF",
  14,
  30
);


  doc.text(
    "Pineapple AI Quality Report",
    14,
    15
  );


  const tableData = pineapples.map((item)=>[

    item.batchId,
    `${item.temperature} °C`,
    `${item.humidity} %`,
    item.quality,
    item.location

  ]);



  autoTable(doc, {

    startY: 25,

    head: [
      [
        "Batch ID",
        "Temperature",
        "Humidity",
        "Quality",
        "Location"
      ]
    ],

    body: tableData

  });



  doc.save(
    "pineapple-report.pdf"
  );

}




  function exportExcel() {


    const reportData = pineapples.map((item) => ({


      "Batch ID": item.batchId,

      "Temperature": item.temperature + " °C",

      "Humidity": item.humidity + " %",

      "Quality": item.quality,

      "Location": item.location


    }));



    const worksheet = XLSX.utils.json_to_sheet(
      reportData
    );



    const workbook = XLSX.utils.book_new();



    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      "Pineapple Batch Data"

    );



    XLSX.writeFile(

      workbook,

      "pineapple-report.xlsx"

    );


  }





  return (

    <div className="report-container">


      <h2>
        Export Reports
      </h2>



      <button

        className="pdf-btn"

        onClick={exportPDF}

      >

        Export PDF

      </button>




      <button

        className="excel-btn"

        onClick={exportExcel}

      >

        Export Excel

      </button>



    </div>

  );

}


export default ReportExport;