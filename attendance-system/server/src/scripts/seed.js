import "../config/env.js";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { CSE_DEPARTMENT_NAME } from "../constants/cse.js";
import { ROLES } from "../constants/roles.js";
import Attendance from "../models/Attendance.js";
import AttendanceRequest from "../models/AttendanceRequest.js";
import Department from "../models/Department.js";
import Notification from "../models/Notification.js";
import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { normalizeDay } from "../utils/time.js";

const TOTAL_STUDENTS = 50;

const TEACHER_SEED = [
  {
    username: "teacher.cse",
    password: "teacher123",
    role: ROLES.TEACHER,
    name: "Priya Menon",
    email: "priya@attendease.local",
  },
  {
    username: "teacher.cse.dbms",
    password: "teacher123",
    role: ROLES.TEACHER,
    name: "Arun Raj",
    email: "arun.raj@attendease.local",
  },
  {
    username: "teacher.cse.os",
    password: "teacher123",
    role: ROLES.TEACHER,
    name: "Meena Krishnan",
    email: "meena.krishnan@attendease.local",
  },
  {
    username: "teacher.cse.ai",
    password: "teacher123",
    role: ROLES.TEACHER,
    name: "Suresh Kumar",
    email: "suresh.kumar@attendease.local",
  },
  {
    username: "teacher.cse.cn",
    password: "teacher123",
    role: ROLES.TEACHER,
    name: "Divya Nair",
    email: "divya.nair@attendease.local",
  },
];

const SUBJECT_SEED = [
  { name: "Data Structures", teacherUsername: "teacher.cse", year: 2 },
  { name: "Database Management Systems", teacherUsername: "teacher.cse.dbms", year: 2 },
  { name: "Operating Systems", teacherUsername: "teacher.cse.os", year: 2 },
  { name: "Artificial Intelligence", teacherUsername: "teacher.cse.ai", year: 2 },
  { name: "Computer Networks", teacherUsername: "teacher.cse.cn", year: 2 },
];

const FIRST_NAMES = [
  "Aarav",
  "Ishaan",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Kavin",
  "Dharun",
  "Nithin",
  "Rahul",
  "Karthik",
  "Ananya",
  "Diya",
  "Keerthi",
  "Nivetha",
  "Sanjana",
  "Harini",
  "Mithra",
  "Shruti",
  "Akshaya",
  "Pavithra",
];

const LAST_NAMES = [
  "Sharma",
  "Gupta",
  "Nair",
  "Reddy",
  "Iyer",
  "Kumar",
  "Menon",
  "Patel",
  "Singh",
  "Rao",
];

function asDate(date) {
  return normalizeDay(`${date}T00:00:00.000Z`);
}

function buildStudentName(index) {
  const first = FIRST_NAMES[(index - 1) % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor((index - 1) / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

function buildStudentSeed() {
  const students = [];
  for (let i = 1; i <= TOTAL_STUDENTS; i += 1) {
    const section = i <= TOTAL_STUDENTS / 2 ? "A" : "B";
    const serial = String(i).padStart(3, "0");
    students.push({
      username: `student.cse.${serial}`,
      password: "student123",
      role: ROLES.STUDENT,
      name: buildStudentName(i),
      email: `student${serial}@attendease.local`,
      rollNo: `CSE23${section}${serial}`,
      year: 2,
      semester: 3,
      section,
    });
  }
  return students;
}

async function run() {
  await connectDb();

  await Promise.all([
    Notification.deleteMany({}),
    AttendanceRequest.deleteMany({}),
    Attendance.deleteMany({}),
    Schedule.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    Department.deleteMany({}),
    User.deleteMany({}),
  ]);

  const department = await Department.create({ name: CSE_DEPARTMENT_NAME });

  const studentSeed = buildStudentSeed();
  const users = await User.create([
    {
      username: "admin",
      password: "admin123",
      role: ROLES.ADMIN,
      name: "System Admin",
      email: "admin@attendease.local",
    },
    {
      username: "hod.cse",
      password: "hod123",
      role: ROLES.HOD,
      name: "Dr. Shalini Rao",
      email: "shalini@attendease.local",
    },
    ...TEACHER_SEED,
    ...studentSeed.map((item) => ({
      username: item.username,
      password: item.password,
      role: item.role,
      name: item.name,
      email: item.email,
    })),
  ]);

  const userByUsername = new Map(users.map((item) => [item.username, item]));

  const subjects = await Subject.create(
    SUBJECT_SEED.map((item) => ({
      name: item.name,
      department: department._id,
      teacher: userByUsername.get(item.teacherUsername)._id,
      year: item.year,
    })),
  );

  const subjectByName = new Map(subjects.map((item) => [item.name, item]));

  const students = await Student.create(
    studentSeed.map((item) => ({
      user: userByUsername.get(item.username)._id,
      rollNo: item.rollNo,
      department: department._id,
      year: item.year,
      semester: item.semester,
      section: item.section,
    })),
  );

  const studentByRoll = new Map(students.map((item) => [item.rollNo, item]));

  const attendanceDates = [
    "2026-03-01",
    "2026-03-02",
    "2026-03-03",
    "2026-03-04",
    "2026-03-05",
    "2026-03-06",
    "2026-03-07",
    "2026-03-08",
  ];

  const attendanceRows = [];
  students.forEach((student, studentIndex) => {
    SUBJECT_SEED.forEach((subjectItem, subjectIndex) => {
      const subject = subjectByName.get(subjectItem.name);
      const teacher = userByUsername.get(subjectItem.teacherUsername);
      attendanceDates.forEach((date, dateIndex) => {
        const seed = studentIndex * 17 + subjectIndex * 11 + dateIndex * 7;
        let status = "Present";
        if (seed % 9 === 0) {
          status = "Absent";
        } else if (seed % 5 === 0) {
          status = "Late";
        }

        attendanceRows.push({
          student: student._id,
          subject: subject._id,
          attendanceDate: asDate(date),
          status,
          markedBy: teacher._id,
        });
      });
    });
  });
  await Attendance.create(attendanceRows);

  const scheduleRows = [];
  const daySlots = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "09:50" },
    { dayOfWeek: 2, startTime: "10:00", endTime: "10:50" },
    { dayOfWeek: 3, startTime: "11:00", endTime: "11:50" },
    { dayOfWeek: 4, startTime: "13:00", endTime: "13:50" },
    { dayOfWeek: 5, startTime: "14:00", endTime: "14:50" },
  ];

  ["A", "B"].forEach((section, sectionIndex) => {
    SUBJECT_SEED.forEach((subjectItem, subjectIndex) => {
      const subject = subjectByName.get(subjectItem.name);
      const teacher = userByUsername.get(subjectItem.teacherUsername);
      const slot = daySlots[(subjectIndex + sectionIndex) % daySlots.length];
      scheduleRows.push({
        department: department._id,
        year: 2,
        semester: 3,
        section,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: subject._id,
        teacher: teacher._id,
        room: `CSE-LH-${201 + subjectIndex + sectionIndex}`,
        academicYear: "2026-27",
        active: true,
      });
    });
  });
  await Schedule.create(scheduleRows);

  await AttendanceRequest.create([
    {
      student: studentByRoll.get("CSE23A001")._id,
      requestType: "LEAVE",
      attendanceDate: asDate("2026-03-05"),
      requestedStatus: null,
      reason: "Medical leave due to fever.",
      status: "PENDING",
    },
    {
      student: studentByRoll.get("CSE23A002")._id,
      requestType: "CORRECTION",
      subject: subjectByName.get("Database Management Systems")._id,
      attendanceDate: asDate("2026-03-02"),
      requestedStatus: "Present",
      reason: "Was present in class but marked absent by mistake.",
      status: "PENDING",
    },
    {
      student: studentByRoll.get("CSE23A003")._id,
      requestType: "LEAVE",
      attendanceDate: asDate("2026-03-06"),
      requestedStatus: null,
      reason: "Attended placement drive with prior approval.",
      status: "PENDING",
    },
    {
      student: studentByRoll.get("CSE23B030")._id,
      requestType: "CORRECTION",
      subject: subjectByName.get("Operating Systems")._id,
      attendanceDate: asDate("2026-03-04"),
      requestedStatus: "Late",
      reason: "Reached class slightly late and requested status update.",
      status: "PENDING",
    },
  ]);

  const lowAttendanceStudents = students.slice(0, 10);
  await Notification.create(
    lowAttendanceStudents.map((student, index) => ({
      recipient: student.user,
      student: student._id,
      type: "LOW_ATTENDANCE",
      title: "Low Attendance Alert",
      message: "Your attendance is below 75%. Please improve your class attendance.",
      isRead: index % 3 === 0,
      meta: { threshold: 75, source: "seed" },
    })),
  );

  // eslint-disable-next-line no-console
  console.log(
    `Seed completed for AttendEase MERN backend. Created ${TOTAL_STUDENTS} students and ${TEACHER_SEED.length} teachers.`,
  );
}

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
