(() => {
    function toQuery(params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                searchParams.append(key, value);
            }
        });
        const query = searchParams.toString();
        return query ? `?${query}` : "";
    }

    async function getStudentReport(filters = {}) {
        return Auth.apiFetch(`/api/attendance/report${toQuery(filters)}`);
    }

    async function getMonthlyReport(filters = {}) {
        return Auth.apiFetch(`/api/attendance/monthly${toQuery(filters)}`);
    }

    async function getAlertReport(filters = {}) {
        return Auth.apiFetch(`/api/attendance/alert${toQuery(filters)}`);
    }

    async function downloadFile(endpoint, filters = {}, filename) {
        const token = Auth.getToken();
        const response = await fetch(`${Auth.API_BASE}${endpoint}${toQuery(filters)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const maybeJson = response.headers.get("content-type")?.includes("application/json");
            if (maybeJson) {
                const err = await response.json();
                throw new Error(err.message || "Download failed");
            }
            throw new Error("Download failed");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    async function exportPdf(filters = {}) {
        return downloadFile("/api/attendance/export/pdf", filters, "attendance-alert-report.pdf");
    }

    async function exportExcel(filters = {}) {
        return downloadFile("/api/attendance/export/excel", filters, "attendance-alert-report.xlsx");
    }

    window.ReportAPI = {
        toQuery,
        getStudentReport,
        getMonthlyReport,
        getAlertReport,
        exportPdf,
        exportExcel
    };
})();
