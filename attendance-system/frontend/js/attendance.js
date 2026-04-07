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

    async function loadDepartments(selectEl = null, includePlaceholder = true) {
        const rows = await Auth.apiFetch("/api/departments");

        if (selectEl) {
            selectEl.innerHTML = "";
            if (includePlaceholder) {
                selectEl.insertAdjacentHTML("beforeend", '<option value="">Select Department</option>');
            }
            rows.forEach((item) => {
                selectEl.insertAdjacentHTML(
                    "beforeend",
                    `<option value="${item.id}">${item.name}</option>`
                );
            });
        }

        return rows;
    }

    async function loadTeachers(selectEl = null, includePlaceholder = true) {
        const rows = await Auth.apiFetch("/api/teachers");

        if (selectEl) {
            selectEl.innerHTML = "";
            if (includePlaceholder) {
                selectEl.insertAdjacentHTML("beforeend", '<option value="">Select Teacher</option>');
            }
            rows.forEach((item) => {
                selectEl.insertAdjacentHTML(
                    "beforeend",
                    `<option value="${item.id}">${item.name}</option>`
                );
            });
        }

        return rows;
    }

    async function loadSubjects(selectEl = null, filters = {}, includePlaceholder = true) {
        const rows = await Auth.apiFetch(`/api/subjects${toQuery(filters)}`);

        if (selectEl) {
            selectEl.innerHTML = "";
            if (includePlaceholder) {
                selectEl.insertAdjacentHTML("beforeend", '<option value="">Select Subject</option>');
            }
            rows.forEach((item) => {
                selectEl.insertAdjacentHTML(
                    "beforeend",
                    `<option value="${item.id}">${item.name} (${item.department_name})</option>`
                );
            });
        }

        return rows;
    }

    async function loadStudents(filters = {}) {
        return Auth.apiFetch(`/api/students${toQuery(filters)}`);
    }

    async function markAttendance(payload) {
        return Auth.apiFetch("/api/attendance", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }

    async function listAttendance(filters = {}) {
        return Auth.apiFetch(`/api/attendance${toQuery(filters)}`);
    }

    window.AttendanceAPI = {
        toQuery,
        loadDepartments,
        loadTeachers,
        loadSubjects,
        loadStudents,
        markAttendance,
        listAttendance
    };
})();
