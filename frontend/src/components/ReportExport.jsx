import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";

import "./ReportExport.css";

function ReportExport({ pineapples }) {

    function exportPDF() {

        const doc = new jsPDF();

        doc.setFontSize(18);

        doc.text(
            "Pineapple AI Quality Report",
            14,
            18
        );

        doc.setFontSize(10);

        doc.setTextColor(100);

        doc.text(
            `Generated: ${new Date().toLocaleString()}`,
            14,
            25
        );

        doc.setTextColor(0);

        const tableData = pineapples.map((item) => [

            item.batchId,

            `${item.temperature ?? "--"} °C`,

            `${item.humidity ?? "--"} %`,

            item.quality || "Pending",

            item.location || "N/A"

        ]);

        autoTable(doc, {

            startY: 32,

            head: [[

                "Batch ID",
                "Temperature",
                "Humidity",
                "Quality",
                "Location"

            ]],

            body: tableData,

            theme: "grid",

            headStyles: {
                fillColor: [22, 101, 52],
                textColor: 255,
                fontStyle: "bold"
            },

            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },

            styles: {
                fontSize: 9,
                cellPadding: 4
            }

        });

        doc.save(
            "pineapple-report.pdf"
        );
    }


    function exportExcel() {

        const reportData = pineapples.map((item) => ({

            "Batch ID":
                item.batchId,

            "Temperature":
                `${item.temperature ?? "--"} °C`,

            "Humidity":
                `${item.humidity ?? "--"} %`,

            "MQ135 Raw":
                item.mq135 ?? 0,

            "Quality":
                item.quality || "Pending",

            "Risk":
                item.riskLevel || "Pending",

            "Storage Days":
                item.storage_days ?? 0,

            "Location":
                item.location || "N/A",

            "Last Updated":
                item.timestamp
                    ? new Date(
                        item.timestamp
                    ).toLocaleString()
                    : "N/A"

        }));

        const worksheet =
            XLSX.utils.json_to_sheet(
                reportData
            );

        const workbook =
            XLSX.utils.book_new();

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

            <div className="report-header">

                <div className="report-icon">
                    📄
                </div>

                <div>

                    <h2>
                        Reports & Export
                    </h2>

                    <p>
                        Download pineapple quality
                        monitoring data
                    </p>

                </div>

            </div>


            <div className="report-summary">

                <div className="report-summary-icon">
                    🍍
                </div>

                <div>

                    <span>
                        Available Records
                    </span>

                    <strong>
                        {pineapples?.length || 0}
                    </strong>

                </div>

            </div>


            <div className="export-options">

                <button
                    className="export-card pdf-btn"
                    onClick={exportPDF}
                >

                    <span className="export-card-icon">
                        📕
                    </span>

                    <span className="export-card-content">

                        <strong>
                            Export PDF
                        </strong>

                        <small>
                            Generate a printable
                            quality report
                        </small>

                    </span>

                    <span className="export-arrow">
                        →
                    </span>

                </button>


                <button
                    className="export-card excel-btn"
                    onClick={exportExcel}
                >

                    <span className="export-card-icon">
                        📗
                    </span>

                    <span className="export-card-content">

                        <strong>
                            Export Excel
                        </strong>

                        <small>
                            Download batch data
                            as spreadsheet
                        </small>

                    </span>

                    <span className="export-arrow">
                        →
                    </span>

                </button>

            </div>


            <div className="report-footer">

                <span>
                    🔒
                </span>

                Reports are generated from
                the current dashboard data.

            </div>

        </div>

    );
}

export default ReportExport;